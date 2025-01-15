import * as admin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { db } from '@db';
import { notifications, users } from '@db/schema';
import { eq } from 'drizzle-orm';

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

// Initialize Email Transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface NotificationPayload {
  title: string;
  content: string;
  type: 'event' | 'result' | 'system' | 'message';
  metadata?: Record<string, any>;
}

export async function sendNotification(userId: number, payload: NotificationPayload) {
  try {
    // Get user details
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    // Store notification in database
    await db.insert(notifications).values({
      userId,
      title: payload.title,
      content: payload.content,
      type: payload.type,
      metadata: payload.metadata || {},
    });

    // Send email notification
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: payload.title,
      text: payload.content,
      html: `<div>
        <h2>${payload.title}</h2>
        <p>${payload.content}</p>
        ${payload.metadata?.actionUrl ? 
          `<p><a href="${payload.metadata.actionUrl}">Click here for more details</a></p>` 
          : ''
        }
      </div>`,
    });

    // Send Firebase notification if FCM token exists
    if (user.fcmToken) {
      await admin.messaging().send({
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.content,
        },
        data: payload.metadata || {},
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

// Function to send notifications to multiple users
export async function sendBulkNotifications(
  userIds: number[],
  payload: NotificationPayload
) {
  await Promise.all(userIds.map(userId => sendNotification(userId, payload)));
}

// Function to send class notifications
export async function sendClassNotification(
  classId: number,
  payload: NotificationPayload,
  onlySubscribed: boolean = true
) {
  const users = await db.query.classParticipants.findMany({
    where: eq(classParticipants.classId, classId),
    with: {
      user: true,
    },
  });

  const userIds = users
    .filter(participant => 
      !onlySubscribed || participant.user.hasActiveSubscription
    )
    .map(participant => participant.user.id);

  await sendBulkNotifications(userIds, payload);
}

// Function to send exam notifications
export async function sendExamNotification(
  examId: number,
  payload: NotificationPayload
) {
  // Get all enrolled students for this exam
  const users = await db.query.mockTestSessions.findMany({
    where: eq(mockTestSessions.mockTestId, examId),
    with: {
      user: true,
    },
  });

  const userIds = users.map(session => session.user.id);
  await sendBulkNotifications(userIds, payload);
}
