import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import {
  users,
  questions,
  courses,
  tutors,
  payments,
  studentProgress,
  mockTests,
  mockTestQuestions,
  mockTestSessions,
  mockTestAnswers,
  events,
  eventParticipants,
  notifications,
  media,
  studentAchievements,
  studentEngagement,
  rewards,
  studentRewards,
  subscriptionPlans,
  userSubscriptions,
  products,
  questionCategories,
  quizzes,
  quizQuestions
} from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import multer from "multer";
import { stringify } from "csv-stringify";
import { parse } from "csv-parse";
import * as fs from 'fs';
import * as path from 'path';
import { Decimal } from 'decimal.js';
import express from 'express';

// Configure multer for file uploads with proper directory
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    // Sanitize filename and add timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-');
    cb(null, filename + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Extend Express Request type to include file from multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
    }
  }
}

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).send("Forbidden");
}

// Add this middleware after the existing requireAuth and requireAdmin middleware
function requireSubscription(feature: string) {
  return async (req: Request & { user?: Express.User }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    // Admin users bypass subscription check
    if (req.user.role === "admin") {
      return next();
    }

    const hasAccess = await checkSubscriptionAccess(req.user.id, feature);
    if (!hasAccess) {
      return res.status(403).send("This content requires an active subscription");
    }

    next();
  };
}

export function registerRoutes(app: Express): Server {
  // Sets up auth middleware and routes
  setupAuth(app);

  // Serve uploaded files from the public directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Users
  app.get("/api/users", requireAdmin, async (_req, res) => {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  });

  // Questions
  app.get("/api/questions", requireAuth, async (_req, res) => {
    try {
      const allQuestions = await db
        .select()
        .from(questions)
        .orderBy(desc(questions.createdAt));

      res.json(allQuestions);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      res.status(500).send(error.message);
    }
  });

  // Courses
  app.get("/api/courses", requireAuth, async (_req, res) => {
    const allCourses = await db.select().from(courses).orderBy(desc(courses.createdAt));
    res.json(allCourses);
  });

  // Tutors
  app.get("/api/tutors", requireAuth, async (_req, res) => {
    const allTutors = await db.select().from(tutors);
    res.json(allTutors);
  });

  // Payments
  app.get("/api/payments", requireAdmin, async (_req, res) => {
    const allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt));
    res.json(allPayments);
  });

  // Student Progress
  app.get("/api/progress", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }
    const progress = await db
      .select()
      .from(studentProgress)
      .where(eq(studentProgress.userId, req.user.id));
    res.json(progress);
  });

  // Mock Test Routes
  app.get("/api/mock-tests", requireAuth, requireSubscription("mockTests"), async (_req, res) => {
    try {
      const allTests = await db
        .select()
        .from(mockTests)
        .orderBy(desc(mockTests.createdAt));
      res.json(allTests);
    } catch (error: any) {
      console.error("Error fetching mock tests:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/mock-tests", requireAuth, requireSubscription("mockTests"), async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const [mockTest] = await db
        .insert(mockTests)
        .values({
          title: req.body.title,
          description: req.body.description || "",
          type: req.body.type,
          duration: req.body.duration,
          totalQuestions: req.body.totalQuestions,
          rules: req.body.rules || {},
          createdBy: req.user.id,
          scheduledFor: req.body.scheduledFor ? new Date(req.body.scheduledFor) : null,
        })
        .returning();

      res.json(mockTest);
    } catch (error: any) {
      console.error("Error creating mock test:", error);
      res.status(500).send(error.message);
    }
  });

  // Mock Test Generation
  app.post("/api/mock-tests/generate", requireAuth, requireSubscription("mockTests"), async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const { type, totalQuestions, rules } = req.body;
      let selectedQuestions: typeof questions.$inferSelect[] = [];

      if (type === "subject_specific") {
        selectedQuestions = await db
          .select()
          .from(questions)
          .where(eq(questions.category as any, rules.category))
          .orderBy(sql`RANDOM()`)
          .limit(totalQuestions);
      } else if (type === "mixed") {
        for (const [category, count] of Object.entries(rules.categoryDistribution)) {
          const subjectQuestions = await db
            .select()
            .from(questions)
            .where(eq(questions.category as any, category))
            .orderBy(sql`RANDOM()`)
            .limit(count as number);

          selectedQuestions = [...selectedQuestions, ...subjectQuestions];
        }
      }

      if (selectedQuestions.length < totalQuestions) {
        return res.status(400).send("Not enough questions available");
      }

      const [mockTest] = await db
        .insert(mockTests)
        .values({
          title: req.body.title,
          description: req.body.description || "",
          type,
          duration: req.body.duration,
          totalQuestions,
          rules: rules,
          createdBy: req.user.id,
        })
        .returning();

      await Promise.all(
        selectedQuestions.map((question, index) =>
          db.insert(mockTestQuestions).values({
            mockTestId: mockTest.id,
            questionId: question.id,
            orderNumber: index + 1,
            marks: rules.marksDistribution?.[question.difficulty] || 1,
          })
        )
      );

      if (mockTest.scheduledFor) {
        const students = await db
          .select()
          .from(users)
          .where(eq(users.role, "student"));

        await Promise.all(
          students.map((student) =>
            db.insert(notifications).values({
              userId: student.id,
              title: `New Mock Test Available: ${mockTest.title}`,
              content: `A new mock test has been scheduled for ${mockTest.scheduledFor}`,
              type: "event",
            })
          )
        );
      }

      res.json(mockTest);
    } catch (error: any) {
      console.error("Error generating mock test:", error);
      res.status(500).send(error.message);
    }
  });

  // Media Management
  app.get("/api/media", requireAuth, async (_req, res) => {
    try {
      const allMedia = await db.select().from(media).orderBy(desc(media.createdAt));
      res.json(allMedia);
    } catch (error: any) {
      console.error("Error fetching media:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/media/upload", requireAuth, upload.single("file"), async (req: Request & { user?: Express.User }, res) => {
    if (!req.user || !req.file) {
      return res.status(400).send(!req.user ? "Unauthorized" : "No file uploaded");
    }

    try {
      // Generate URL using the file path relative to public directory
      const url = `/uploads/${req.file.filename}`;

      const [mediaFile] = await db
        .insert(media)
        .values({
          url,
          filename: req.file.originalname,
          category: req.body.category || 'uncategorized',
          createdBy: req.user.id,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        })
        .returning();

      res.json(mediaFile);
    } catch (error: any) {
      console.error("Error uploading media:", error);
      res.status(500).send(error.message);
    }
  });

  // Bulk Import/Export
  app.get("/api/users/export", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await db.select().from(users);
      const stringifier = stringify({
        header: true,
        columns: ["username", "email", "role", "createdAt"],
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");

      stringifier.pipe(res);
      allUsers.forEach((user) => {
        stringifier.write({
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        });
      });
      stringifier.end();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/users/import", requireAdmin, upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
      });

      parser.on("readable", function () {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on("error", function (err) {
        throw err;
      });

      parser.write(req.file.buffer.toString());
      parser.end();

      await new Promise((resolve) => parser.on("end", resolve));

      const validRecords = records.map((record) => ({
        username: record.username,
        email: record.email,
        role: record.role || "student",
        password: "changeme123", // Default password that users must change
      }));

      const result = await db.insert(users).values(validRecords).returning();

      res.json({ imported: result.length });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/courses/export", requireAdmin, async (_req, res) => {
    try {
      const allCourses = await db.select().from(courses);

      const stringifier = stringify({
        header: true,
        columns: ["title", "description", "price", "published", "createdAt"],
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=courses.csv");

      stringifier.pipe(res);
      allCourses.forEach((course) => {
        stringifier.write({
          title: course.title,
          description: course.description,
          price: course.price,
          published: course.published,
          createdAt: course.createdAt,
        });
      });
      stringifier.end();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.post("/api/courses/import", requireAdmin, upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
      });

      parser.on("readable", function () {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on("error", function (err) {
        throw err;
      });

      parser.write(req.file.buffer.toString());
      parser.end();

      await new Promise((resolve) => parser.on("end", resolve));

      const validRecords = records.map((record) => ({
        title: record.title,
        description: record.description,
        price: parseFloat(record.price) || 0,
        published: record.published === "true",
      }));

      const result = await db.insert(courses).values(validRecords).returning();

      res.json({ imported: result.length });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });


  // Stats endpoints
  app.get("/api/stats", requireAdmin, async (_req, res) => {
    const [userCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    const [questionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(questions);

    const [tutorCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(tutors)
      .where(eq(tutors.available, true));

    const [{ revenue }] = await db
      .select({
        revenue: sql<number>`sum(amount::numeric)`,
      })
      .from(payments)
      .where(eq(payments.status, "completed"));

    res.json({
      users: userCount.count,
      questions: questionCount.count,
      tutors: tutorCount.count,
      revenue: revenue || 0,
    });
  });

  app.get("/api/tutor/stats", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user || req.user.role !== "tutor") {
      return res.status(403).send("Forbidden");
    }

    try {
      const [totalStudents] = await db
        .select({ count: sql<number>`count(distinct sp.user_id)` })
        .from(studentProgress)
        .where(eq(studentProgress.tutorId, req.user.id));

      const [activeCourses] = await db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(
          and(
            eq(courses.createdBy, req.user.id),
            eq(courses.published, true)
          )
        );

      const [mockTestsCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(mockTests)
        .where(eq(mockTests.createdBy, req.user.id));

      const [{ averageRating }] = await db
        .select({
          averageRating: sql<number>`avg(rating)::numeric(10,2)`,
        })
        .from(tutors)
        .where(eq(tutors.userId, req.user.id));

      res.json({
        totalStudents: totalStudents.count || 0,
        activeCourses: activeCourses.count || 0,
        mockTests: mockTestsCount.count || 0,
        averageRating: averageRating || 0,
      });
    } catch (error: any) {
      console.error("Error fetching tutor stats:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/student/stats", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Forbidden");
    }

    try {
      const [completedCourses] = await db
        .select({ count: sql<number>`count(*)` })
        .from(studentProgress)
        .where(
          and(
            eq(studentProgress.userId, req.user.id),
            eq(studentProgress.progress, 100)
          )
        );

      const [activeTests] = await db
        .select({ count: sql<number>`count(*)` })
        .from(mockTestSessions)
        .where(
          and(
            eq(mockTestSessions.userId, req.user.id),
            eq(mockTestSessions.status, "in_progress")
          )
        );

      const [achievements] = await db
        .select({ count: sql<number>`count(*)` })
        .from(studentAchievements)
        .where(eq(studentAchievements.userId, req.user.id));

      const [{ averageScore }] = await db
        .select({
          averageScore: sql<number>`avg(score)::numeric(10,2)`,
        })
        .from(mockTestSessions)
        .where(
          and(
            eq(mockTestSessions.userId, req.user.id),
            eq(mockTestSessions.status, "completed")
          )
        );

      res.json({
        completedCourses: completedCourses.count || 0,
        activeTests: activeTests.count || 0,
        achievements: achievements.count || 0,
        averageScore: averageScore || 0,
      });
    } catch (error: any) {
      console.error("Error fetching student stats:", error);
      res.status(500).send(error.message);
    }
  });

  // Delete media
  app.delete("/api/media/:id", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const mediaId = parseInt(req.params.id);
    if (isNaN(mediaId)) {
      return res.status(400).send("Invalid media ID");
    }

    const [deletedMedia] = await db
      .delete(media)
      .where(eq(media.id, mediaId))
      .returning();

    if (!deletedMedia) {
      return res.status(404).send("Media not found");
    }

    res.json({ message: "Media deleted successfully" });
  });

  // Student Engagement Routes
  app.get("/api/student/engagement", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const [engagement] = await db
      .select()
      .from(studentEngagement)
      .where(eq(studentEngagement.userId, req.user.id))
      .limit(1);

    if (!engagement) {
      const [newEngagement] = await db
        .insert(studentEngagement)
        .values({
          userId: req.user.id,
          lastLogin: new Date(),
        })
        .returning();

      return res.json(newEngagement);
    }

    const lastLoginDate = new Date(engagement.lastLogin);
    const today = new Date();
    const daysSinceLastLogin = Math.floor((today.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));

    let loginStreak = engagement.loginStreak;
    if (daysSinceLastLogin === 1) {
      loginStreak += 1;
    } else if (daysSinceLastLogin > 1) {
      loginStreak = 1;
    }

    const [updatedEngagement] = await db
      .update(studentEngagement)
      .set({
        lastLogin: today,
        loginStreak,
      })
      .where(eq(studentEngagement.userId, req.user.id))
      .returning();

    res.json(updatedEngagement);
  });

  // Achievements Routes
  app.get("/api/achievements", requireAuth, async (_req, res) => {
    const allAchievements = await db
      .select()
      .from(achievements)
      .orderBy(achievements.type);

    res.json(allAchievements);
  });

  app.get("/api/student/achievements", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const userAchievements = await db
      .select({
        id: studentAchievements.id,
        achievement: {
          id: achievements.id,
          name: achievements.name,
          description: achievements.description,
          icon: achievements.icon,
          type: achievements.type,
          requiredValue: achievements.requiredValue,
        },
        unlockedAt: studentAchievements.unlockedAt,
        progress: studentAchievements.progress,
      })
      .from(studentAchievements)
      .innerJoin(achievements, eq(achievements.id, studentAchievements.achievementId))
      .where(eq(studentAchievements.userId, req.user.id))
      .orderBy(desc(studentAchievements.unlockedAt));

    res.json(userAchievements);
  });

  // Rewards Routes
  app.get("/api/rewards", requireAuth, async (_req, res) => {
    const allRewards = await db
      .select()
      .from(rewards)
      .orderBy(rewards.type);

    res.json(allRewards);
  });

  app.get("/api/student/rewards", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const userRewards = await db
      .select({
        id: studentRewards.id,
        reward: {
          id: rewards.id,
          name: rewards.name,
          description: rewards.description,
          type: rewards.type,
        },
        earnedAt: studentRewards.earnedAt,
        status: studentRewards.status,
      })
      .from(studentRewards)
      .innerJoin(rewards, eq(rewards.id, studentRewards.rewardId))
      .where(eq(studentRewards.userId, req.user.id))
      .orderBy(desc(studentRewards.earnedAt));

    res.json(userRewards);
  });

  // Update student engagement metrics
  app.post("/api/student/engagement/update", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const { timeSpent, lessonsCompleted, questionsAnswered, correctAnswers } = req.body;

    const [engagement] = await db
      .select()
      .from(studentEngagement)
      .where(eq(studentEngagement.userId, req.user.id))
      .limit(1);

    if (!engagement) {
      return res.status(404).send("Student engagement record not found");
    }

    const [updatedEngagement] = await db
      .update(studentEngagement)
      .set({
        totalTimeSpent: sql`${studentEngagement.totalTimeSpent} + ${timeSpent || 0}`,
        completedLessons: sql`${studentEngagement.completedLessons} + ${lessonsCompleted || 0}`,
        questionsAnswered: sql`${studentEngagement.questionsAnswered} + ${questionsAnswered || 0}`,
        correctAnswers: sql`${studentEngagement.correctAnswers} + ${correctAnswers || 0}`,
        participationScore: sql`(${studentEngagement.correctAnswers} + ${correctAnswers || 0})::decimal / NULLIF(${studentEngagement.questionsAnswered} + ${questionsAnswered || 0}, 0) * 100`,
        lastUpdated: new Date(),
      })
      .where(eq(studentEngagement.userId, req.user.id))
      .returning();

    await checkAndAwardAchievements(req.user.id, updatedEngagement);

    res.json(updatedEngagement);
  });

  // Helper function to check and award achievements
  async function checkAndAwardAchievements(userId: number, engagement: typeof studentEngagement.$inferSelect) {
    const allAchievements = await db
      .select()
      .from(achievements)
      .where(
        and(
          not(
            exists(
              db
                .select()
                .from(studentAchievements)
                .where(
                  and(
                    eq(studentAchievements.userId, userId),
                    eq(studentAchievements.achievementId, achievements.id)
                  )
                )
            )
          )
        )
      );

    for (const achievement of allAchievements) {
      let progress = 0;
      let achieved = false;

      switch (achievement.type) {
        case "login_streak":
          progress = engagement.loginStreak;
          achieved = progress >= achievement.requiredValue;
          break;
        case "completion":
          progress = engagement.completedLessons;
          achieved = progress >= achievement.requiredValue;
          break;
        case "grade":
          progress = Math.floor(engagement.participationScore);
          achieved = progress >= achievement.requiredValue;
          break;
        case "participation":
          progress = engagement.questionsAnswered;
          achieved = progress >= achievement.requiredValue;
          break;
      }

      if (achieved) {
        await db.insert(studentAchievements).values({
          userId,
          achievementId: achievement.id,
          progress,
        });
      }
    }
  }

  // Get question statistics
  app.get("/api/questions/stats", requireAuth, async (_req, res) => {
    try {
      const [{ total }] = await db
        .select({
          total: sql<number>`count(*)`,
        })
        .from(questions);

      const categoryCounts = await db
        .select({
          category: questions.category,
          total: sql<number>`count(*)`,
        })
        .from(questions)
        .groupBy(questions.category);

      const byCategory = Object.fromEntries(
        categoryCounts.map(({ category, total }) => [
          category,
          { total },
        ])
      );

      res.json({
        total,
        byCategory,
      });
    } catch (error: any) {
      console.error("Error fetching question statistics:", error);
      res.status(500).send(error.message);
    }
  });

  // Event Management Routes
  app.get("/api/events", requireAuth, async (_req, res) => {
    try {
      const allEvents = await db
        .select()
        .from(events)
        .orderBy(desc(events.startTime));
      res.json(allEvents);
    } catch (error: any) {
      console.error("Error fetching events:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/events", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const [event] = await db
        .insert(events)
        .values({
          ...req.body,
          createdBy: req.user.id,
        })
        .returning();

      await db.insert(eventParticipants).values({
        eventId: event.id,
        userId: req.user.id,
        role: "organizer",
      });

      if (event.type === "exam") {
        const students = await db
          .select()
          .from(users)
          .where(eq(users.role, "student"));

        await Promise.all(
          students.map((student) =>
            db.insert(notifications).values({
              userId: student.id,
              title: `New Exam Scheduled: ${event.title}`,
              content: `A new exam has been scheduled for ${new Date(event.startTime).toLocaleDateString()}`,
              type: "event",
            })
          )
        );
      }

      res.json(event);
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/events/:id/register", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const eventId = parseInt(req.params.id);
      const [event] = await db
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event) {
        return res.status(404).send("Event not found");
      }

      if (event.capacity && event.enrolledCount >= event.capacity) {
        return res.status(400).send("Event is full");
      }

      const [registration] = await db
        .insert(eventParticipants)
        .values({
          eventId,
          userId: req.user.id,
          role: "attendee",
        })
        .returning();

      await db
        .update(events)
        .set({
          enrolledCount: sql`${events.enrolledCount} + 1`,
        })
        .where(eq(events.id, eventId));

      res.json(registration);
    } catch (error: any) {
      console.error("Error registering for event:", error);
      res.status(500).send(error.message);
    }
  });

  // Automated Result Processing Routes
  app.post("/api/mock-tests/:sessionId/process-results", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const sessionId = parseInt(req.params.sessionId);
      const [session] = await db
        .select()
        .from(mockTestSessions)
        .where(eq(mockTestSessions.id, sessionId))
        .limit(1);

      if (!session) {
        return res.status(404).send("Session not found");
      }

      // Process results logic here
      res.json({ message: "Results processed successfully" });
    } catch (error: any) {
      console.error("Error processing results:", error);
      res.status(500).send(error.message);
    }
  });

  // Notification Routes
  app.get("/api/notifications", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, req.user.id))
        .orderBy(desc(notifications.createdAt));

      res.json(userNotifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/notifications/:id/mark-read", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const [notification] = await db
        .update(notifications)
        .set({
          status: "read",
          readAt: new Date(),
        })
        .where(
          and(
            eq(notifications.id, parseInt(req.params.id)),
            eq(notifications.userId, req.user.id)
          )
        )
        .returning();

      res.json(notification);
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).send(error.message);
    }
  });

  // Helper functions for result processing
  function calculateConfidenceLevel(timeSpent: number): number {
    if (timeSpent < 30) return 5;
    if (timeSpent < 60) return 4;
    if (timeSpent < 120) return 3;
    if (timeSpent < 180) return 2;
    return 1;
  }

  function categorizeMistake(selected: number, correct: number): string {
    if (Math.abs(selected - correct) === 1) {
      return "near_miss";
    }
    return "conceptual_error";
  }

  // Get question statistics
  app.get("/api/questions/stats", requireAuth, async (_req, res) => {
    try {
      const [{ total }] = await db
        .select({
          total: sql<number>`count(*)`,
        })
        .from(questions);

      const categoryCounts = await db
        .select({
          category: questions.category,
          total: sql<number>`count(*)`,
        })
        .from(questions)
        .groupBy(questions.category);

      const byCategory = Object.fromEntries(
        categoryCounts.map(({ category, total }) => [
          category,
          { total },
        ])
      );

      res.json({
        total,
        byCategory,
      });
    } catch (error: any) {
      console.error("Error fetching question statistics:", error);
      res.status(500).send(error.message);
    }
  });

  // Subscription Plan Routes
  app.get("/api/subscription-plans", requireAuth, async (_req, res) => {
    try {
      const allPlans = await db
        .select()
        .from(subscriptionPlans)
        .orderBy(desc(subscriptionPlans.createdAt));
      res.json(allPlans);
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const [plan] = await db
        .insert(subscriptionPlans)
        .values({
          name: req.body.name,
          description: req.body.description,
          tier: req.body.tier,
          duration: req.body.duration,
          price: req.body.price,
          features: req.body.features,
          isActive: true,
        })
        .returning();
      res.json(plan);
    } catch (error: any) {
      console.error("Error creating subscription plan:", error);
      res.status(500).send(error.message);
    }
  });

  app.put("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const [updatedPlan] = await db
        .update(subscriptionPlans)
        .set({
          name: req.body.name,
          description: req.body.description,
          tier: req.body.tier,
          duration: req.body.duration,
          price: req.body.price,
          features: req.body.features,
          isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        })
        .where(eq(subscriptionPlans.id, planId))
        .returning();
      res.json(updatedPlan);
    } catch (error: any) {
      console.error("Error updating subscription plan:", error);
      res.status(500).send(error.message);
    }
  });

  // User Subscription Routes
  app.get("/api/subscriptions", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }
    try {
      const userSubscriptions = await db
        .select({
          subscription: userSubscriptions,
          plan: {
            id: subscriptionPlans.id,
            name: subscriptionPlans.name,
            tier: subscriptionPlans.tier,
            features: subscriptionPlans.features,
          },
        })
        .from(userSubscriptions)
        .innerJoin(subscriptionPlans, eq(subscriptionPlans.id, userSubscriptions.planId))
        .where(eq(userSubscriptions.userId, req.user.id))
        .orderBy(desc(userSubscriptions.startDate));
      res.json(userSubscriptions);
    } catch (error: any) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).send(error.message);
    }
  });

  // Function to check subscription access
  async function checkSubscriptionAccess(userId: number, feature: string): Promise<boolean> {
    const [activeSubscription] = await db
      .select({
        subscription: userSubscriptions,
        plan: subscriptionPlans,
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptionPlans.id, userSubscriptions.planId))
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .orderBy(desc(userSubscriptions.startDate))
      .limit(1);

    if (!activeSubscription) {
      return false;
    }

    const features = activeSubscription.plan.features as Record<string, any>;
    return features[feature]?.enabled || false;
  }

  // Analytics Routes
  app.get("/api/analytics/overview", requireAdmin, async (_req, res) => {
    try {
      // User Growth Analysis
      const [userGrowth] = await db
        .select({
          total: sql<number>`count(*)`,
          newThisMonth: sql<number>`count(*) filter (where created_at >= date_trunc('month', now()))`,
          activeThisMonth: sql<number>`count(*) filter (where last_login >= date_trunc('month', now()))`,
        })
        .from(users);

      // Revenue Analytics
      const [revenueMetrics] = await db
        .select({
          totalRevenue: sql<number>`sum(amount::numeric)`,
          monthlyRevenue: sql<number>`sum(amount::numeric) filter (where created_at >= date_trunc('month', now()))`,
        })
        .from(payments)
        .where(eq(payments.status, "completed"));

      // Subscription Analytics
      const [subscriptionMetrics] = await db
        .select({
          totalActive: sql<number>`count(*) filter (where status = 'active')`,
          expiringThisMonth: sql<number>`count(*) filter (where status = 'active' and end_date <= date_trunc('month', now()) + interval '1 month')`,
        })
        .from(userSubscriptions);

      // Engagement Metrics
      const [engagementMetrics] = await db
        .select({
          avgLoginStreak: sql<number>`avg(login_streak)`,
          avgTimeSpent: sql<number>`avg(total_time_spent)`,
          avgParticipationScore: sql<number>`avg(participation_score)`,
        })
        .from(studentEngagement);

      // Mock Test Analytics
      const [mockTestMetrics] = await db
        .select({
          totalTests: sql<number>`count(*)`,
          avgScore: sql<number>`avg(score) filter (where status = 'completed')`,
          completionRate: sql<number>`count(*) filter (where status = 'completed')::float / count(*)::float`,
        })
        .from(mockTestSessions);

      // Course Progress Analytics
      const [courseMetrics] = await db
        .select({
          avgProgress: sql<number>`avg(progress)`,
          completionRate: sql<number>`count(*) filter (where progress = 100)::float / count(*)::float`,
        })
        .from(studentProgress);

      res.json({
        users: {
          total: userGrowth.total || 0,
          newThisMonth: userGrowth.newThisMonth || 0,
          activeThisMonth: userGrowth.activeThisMonth || 0,
          growthRate: userGrowth.total ? (userGrowth.newThisMonth / userGrowth.total) * 100 : 0,
        },
        revenue: {
          total: revenueMetrics?.totalRevenue || 0,
          monthly: revenueMetrics?.monthlyRevenue || 0,
        },
        subscriptions: {
          activeSubscriptions: subscriptionMetrics?.totalActive || 0,
          expiringThisMonth: subscriptionMetrics?.expiringThisMonth || 0,
        },
        engagement: {
          averageLoginStreak: Math.round(engagementMetrics?.avgLoginStreak || 0),
          averageTimeSpentMinutes: Math.round((engagementMetrics?.avgTimeSpent || 0) / 60),
          averageParticipationScore: Math.round(engagementMetrics?.avgParticipationScore || 0),
        },
        mockTests: {
          total: mockTestMetrics?.totalTests || 0,
          averageScore: Math.round((mockTestMetrics?.avgScore || 0) * 10) / 10,
          completionRate: Math.round((mockTestMetrics?.completionRate || 0) * 100),
        },
        courses: {
          averageProgress: Math.round((courseMetrics?.avgProgress || 0) * 10) / 10,
          completionRate: Math.round((courseMetrics?.completionRate || 0) * 100),
        },
      });
    } catch (error: any) {
      console.error("Error fetching analytics overview:", error);
      res.status(500).send(error.message);
    }
  });

  // Detailed Analytics Routes
  app.get("/api/analytics/user-growth", requireAdmin, async (req, res) => {
    try {
      const period = req.query.period as string || "month";
      const intervalMap = {
        week: "day",
        month: "week",
        year: "month",
      };

      const interval = intervalMap[period as keyof typeof intervalMap] || "month";

      const userGrowth = await db
        .select({
          period: sql`date_trunc(${sql.raw(interval)}, created_at)`,
          newUsers: sql<number>`count(*)`,
        })
        .from(users)
        .groupBy(sql`date_trunc(${sql.raw(interval)}, created_at)`)
        .orderBy(sql`date_trunc(${sql.raw(interval)}, created_at)`);

      res.json(userGrowth);
    } catch (error: any) {
      console.error("Error fetching user growth analytics:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/analytics/revenue", requireAdmin, async (req, res) => {
    try {
      const period = req.query.period as string || "month";
      const intervalMap = {
        week: "day",
        month: "week",
        year: "month",
      };

      const interval = intervalMap[period as keyof typeof intervalMap] || "month";

      const revenueData = await db
        .select({
          period: sql`date_trunc(${sql.raw(interval)}, created_at)`,
          revenue: sql<number>`sum(amount::numeric)`,
          transactions: sql<number>`count(*)`,
        })
        .from(payments)
        .where(eq(payments.status, "completed"))
        .groupBy(sql`date_trunc(${sql.raw(interval)}, created_at)`)
        .orderBy(sql`date_trunc(${sql.raw(interval)}, created_at)`);

      res.json(revenueData);
    } catch (error: any) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/analytics/mock-tests", requireAdmin, async (req, res) => {
    try {
      const [categoryPerformance] = await db
        .select({
          categories: sql<Record<string, { avgScore: number; totalAttempts: number }>>`
            jsonb_object_agg(
              q.category,
              jsonb_build_object(
                'avgScore', avg(case when mta.is_correct then 1 else 0 end),
                'totalAttempts', count(*)
              )
            )
          `,
        })
        .from(mockTestAnswers)
        .innerJoin(questions, eq(questions.id, mockTestAnswers.questionId))
        .groupBy(questions.category);

      const difficultyAnalysis = await db
        .select({
          difficulty: questions.difficulty,
          correctRate: sql<number>`avg(case when mta.is_correct then 1 else 0 end)`,
          avgTimeSpent: sql<number>`avg(mta.time_spent)`,
        })
        .from(mockTestAnswers)
        .innerJoin(questions, eq(questions.id, mockTestAnswers.questionId))
        .groupBy(questions.difficulty);

      const timeDistribution = await db
        .select({
          timeRange: sql<string>`
            case 
              when time_spent < 30 then 'Under 30s'
              when time_spent < 60 then '30-60s'
              when time_spent < 120 then '1-2m'
              else 'Over 2m'
            end
          `,
          count: sql<number>`count(*)`,
          correctRate: sql<number>`avg(case when is_correct then 1 else 0 end)`,
        })
        .from(mockTestAnswers)
        .groupBy(sql`
          case 
            when time_spent < 30 then 'Under 30s'
            when time_spent < 60 then '30-60s'
            when time_spent < 120 then '1-2m'
            else 'Over 2m'
          end
        `);

      res.json({        categoryPerformance: categoryPerformance?.categories || {},
        difficultyAnalysis,
        timeDistribution,
      });
    } catch (error: any) {
      console.error("Error fetching mock test analytics:", error);
      res.status(500).send(error.message);
    }
  });

  // Student Analytics
  app.get("/api/analytics/student/:id", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user || (req.user.role !== "admin" && req.user.id !== parseInt(req.params.id))) {
      return res.status(403).send("Forbidden");
    }

    try {
      const studentId = parseInt(req.params.id);

      // Performance Overview
      const [performance] = await db
        .select({
          totalTests: sql<number>`count(*)`,
          avgScore: sql<number>`avg(score)`,
          testsCompleted: sql<number>`count(*) filter (where status = 'completed')`,
        })
        .from(mockTestSessions)
        .where(eq(mockTestSessions.userId, studentId));

      // Progress Tracking
      const courseProgress = await db
        .select({
          courseId: courses.id,
          courseName: courses.title,
          progress: studentProgress.progress,
          lastUpdated: studentProgress.lastUpdated,
        })
        .from(studentProgress)
        .innerJoin(courses, eq(courses.id, studentProgress.courseId))
        .where(eq(studentProgress.userId, studentId));

      // Engagement Metrics
      const [engagement] = await db
        .select()
        .from(studentEngagement)
        .where(eq(studentEngagement.userId, studentId));

      // Strength and Weaknesses
      const strengthWeakness = await db
        .select({
          category: questions.category,
          totalQuestions: sql<number>`count(*)`,
          correctAnswers: sql<number>`count(*) filter (where mta.is_correct)`,
          avgTimeSpent: sql<number>`avg(mta.time_spent)`,
        })
        .from(mockTestAnswers)
        .innerJoin(questions, eq(questions.id, mockTestAnswers.questionId))
        .innerJoin(
          mockTestSessions,
          eq(mockTestSessions.id, mockTestAnswers.sessionId)
        )
        .where(eq(mockTestSessions.userId, studentId))
        .groupBy(questions.category);

      res.json({
        performance: {
          totalTests: performance?.totalTests || 0,
          averageScore: Math.round((performance?.avgScore || 0) * 10) / 10,
          completionRate: performance?.totalTests
            ? (performance.testsCompleted / performance.totalTests) * 100
            : 0,
        },
        courseProgress,
        engagement: engagement || null,
        strengthWeakness: strengthWeakness.map((sw) => ({
          ...sw,
          correctRate: sw.totalQuestions ? (sw.correctAnswers / sw.totalQuestions) * 100 : 0,
        })),
      });
    } catch (error: any) {
      console.error("Error fetching student analytics:", error);
      res.status(500).send(error.message);
    }
  });

  // Question Categories
  app.get("/api/questions/categories", requireAuth, async (_req, res) => {
    try {
      const categories = await db
        .select()
        .from(questionCategories)
        .orderBy(questionCategories.name);
      res.json(categories);
    } catch (error: any) {
      console.error("Error fetching question categories:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/questions/categories", requireAuth, requireAdmin, async (req, res) => {
    try {
      const [category] = await db
        .insert(questionCategories)
        .values({
          name: req.body.name,
          description: req.body.description,
          parentId: req.body.parentId,
        })
        .returning();
      res.json(category);
    } catch (error: any) {
      console.error("Error creating question category:", error);
      res.status(500).send(error.message);
    }
  });

  app.put("/api/questions/categories/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const [category] = await db
        .update(questionCategories)
        .set({
          name: req.body.name,
          description: req.body.description,
          parentId: req.body.parentId,
        })
        .where(eq(questionCategories.id, categoryId))
        .returning();
      res.json(category);
    } catch (error: any) {
      console.error("Error updating question category:", error);
      res.status(500).send(error.message);
    }
  });

  // Add these routes after the question categories routes
  app.get("/api/quizzes", requireAuth, async (_req, res) => {
    try {
      const allQuizzes = await db
        .select({
          quiz: quizzes,
          category: questionCategories,
          createdBy: users,
        })
        .from(quizzes)
        .leftJoin(questionCategories, eq(quizzes.categoryId, questionCategories.id))
        .leftJoin(users, eq(quizzes.createdBy, users.id))
        .orderBy(desc(quizzes.createdAt));
      res.json(allQuizzes);
    } catch (error: any) {
      console.error("Error fetching quizzes:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/quizzes", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const [quiz] = await db
        .insert(quizzes)
        .values({
          title: req.body.title,
          description: req.body.description,
          categoryId: req.body.categoryId,
          difficulty: req.body.difficulty,
          timeLimit: req.body.timeLimit,
          passingScore: req.body.passingScore,
          createdBy: req.user.id,
        })
        .returning();

      res.json(quiz);
    } catch (error: any) {
      console.error("Error creating quiz:", error);
      res.status(500).send(error.message);
    }
  });

  app.put("/api/quizzes/:id", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const quizId = parseInt(req.params.id);

      // Check if user owns the quiz or is admin
      const [existingQuiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      if (!existingQuiz || (existingQuiz.createdBy !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).send("Not authorized to edit this quiz");
      }

      const [quiz] = await db
        .update(quizzes)
        .set({
          title: req.body.title,
          description: req.body.description,
          categoryId: req.body.categoryId,
          difficulty: req.body.difficulty,
          timeLimit: req.body.timeLimit,
          passingScore: req.body.passingScore,
          lastModified: new Date(),
        })
        .where(eq(quizzes.id, quizId))
        .returning();

      res.json(quiz);
    } catch (error: any) {
      console.error("Error updating quiz:", error);
      res.status(500).send(error.message);
    }
  });

  app.delete("/api/quizzes/:id", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const quizId = parseInt(req.params.id);

      // Check if user owns the quiz or is admin
      const [existingQuiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      if (!existingQuiz || (existingQuiz.createdBy !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).send("Not authorized to delete this quiz");
      }

      // First delete associated quiz questions
      await db
        .delete(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId));

      // Then delete the quiz
      await db
        .delete(quizzes)
        .where(eq(quizzes.id, quizId));

      res.json({ message: "Quiz deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting quiz:", error);
      res.status(500).send(error.message);
    }
  });

  app.get("/api/quizzes/:id/questions", requireAuth, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quizQuestionsList = await db
        .select({
          id: quizQuestions.id,
          question: questions,
          orderNumber: quizQuestions.orderNumber,
          marks: quizQuestions.marks,
        })
        .from(quizQuestions)
        .innerJoin(questions, eq(questions.id, quizQuestions.questionId))
        .where(eq(quizQuestions.quizId, quizId))
        .orderBy(quizQuestions.orderNumber);

      res.json(quizQuestionsList);
    } catch (error: any) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/quizzes/:id/questions", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const quizId = parseInt(req.params.id);

      // Check if user owns the quiz or is admin
      const [existingQuiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, quizId))
        .limit(1);

      if (!existingQuiz || (existingQuiz.createdBy !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).send("Not authorized to add questions to this quiz");
      }

      const { questionIds, marks } = req.body;

      const existingQuestions = await db
        .select()
        .from(quizQuestions)
        .where(eq(quizQuestions.quizId, quizId));

      const nextOrderNumber = existingQuestions.length;

      const newQuestions = await Promise.all(
        questionIds.map(async (questionId: number, index: number) => {
          const [question] = await db
            .insert(quizQuestions)
            .values({
              quizId,
              questionId,
              orderNumber: nextOrderNumber + index,
              marks: marks[index] || 1,
            })
            .returning();
          return question;
        })
      );

      res.json(newQuestions);
    } catch (error: any) {
      console.error("Error adding quiz questions:", error);
      res.status(500).send(error.message);
    }
  });

  // Subscription Plan Routes
  app.get("/api/subscription-plans", requireAuth, async (_req, res) => {
    try {
      const allPlans = await db
        .select()
        .from(subscriptionPlans)
        .orderBy(desc(subscriptionPlans.createdAt));
      res.json(allPlans);
    } catch (error: any) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const [plan] = await db
        .insert(subscriptionPlans)
        .values({
          name: req.body.name,
          description: req.body.description,
          tier: req.body.tier,
          duration: req.body.duration,
          price: req.body.price,
          features: req.body.features,
          isActive: true,
        })
        .returning();
      res.json(plan);
    } catch (error: any) {
      console.error("Error creating subscription plan:", error);
      res.status(500).send(error.message);
    }
  });

  app.put("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const [updatedPlan] = await db
        .update(subscriptionPlans)
        .set({
          name: req.body.name,
          description: req.body.description,
          tier: req.body.tier,
          duration: req.body.duration,
          price: req.body.price,
          features: req.body.features,
          isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        })
        .where(eq(subscriptionPlans.id, planId))
        .returning();
      res.json(updatedPlan);
    } catch (error: any) {
      console.error("Error updating subscription plan:", error);
      res.status(500).send(error.message);
    }
  });

  // User Subscription Routes
  app.get("/api/subscriptions", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }
    try {
      const userSubscriptions = await db
        .select({
          subscription: userSubscriptions,
          plan: {
            id: subscriptionPlans.id,
            name: subscriptionPlans.name,
            tier: subscriptionPlans.tier,
            features: subscriptionPlans.features,
          },
        })
        .from(userSubscriptions)
        .innerJoin(subscriptionPlans, eq(subscriptionPlans.id, userSubscriptions.planId))
        .where(eq(userSubscriptions.userId, req.user.id))
        .orderBy(desc(userSubscriptions.startDate));
      res.json(userSubscriptions);
    } catch (error: any) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).send(error.message);
    }
  });

  // Function to check subscription access
  async function checkSubscriptionAccess(userId: number, feature: string): Promise<boolean> {
    const [activeSubscription] = await db
      .select({
        subscription: userSubscriptions,
        plan: subscriptionPlans,
      })
      .from(userSubscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptionPlans.id, userSubscriptions.planId))
      .where(
        and(
          eq(userSubscriptions.userId, userId),
          eq(userSubscriptions.status, "active")
        )
      )
      .orderBy(desc(userSubscriptions.startDate))
      .limit(1);

    if (!activeSubscription) {
      return false;
    }

    const features = activeSubscription.plan.features as Record<string, any>;
    return features[feature]?.enabled || false;
  }

  const httpServer = createServer(app);
  return httpServer;
}