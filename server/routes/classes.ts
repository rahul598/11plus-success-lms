import { Router } from "express";
import { db } from "@db";
import { liveClasses, classParticipants, recordedVideos, users, tutors } from "@db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import type { SelectUser } from "@db/schema";

// Extend Express Request type to include our user type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const router = Router();

// Get all live classes
router.get("/api/classes/live", async (req, res) => {
  try {
    const classes = await db.query.liveClasses.findMany({
      with: {
        tutor: {
          with: {
            user: true
          }
        }
      },
      orderBy: [desc(liveClasses.startTime)]
    });

    // Get statistics
    const upcoming = classes.filter(c => c.status === "scheduled").length;
    const totalStudents = await db.query.classParticipants.findMany({
      where: eq(classParticipants.status, "registered")
    }).then(p => p.length);
    const recordedSessions = await db.query.recordedVideos.findMany().then(r => r.length);

    res.json({
      data: classes,
      upcoming,
      totalStudents,
      recordedSessions
    });
  } catch (error) {
    console.error("Error fetching live classes:", error);
    res.status(500).json({ error: "Failed to fetch live classes" });
  }
});

// Create a new live class
router.post("/api/classes/live", async (req, res) => {
  try {
    const { title, description, tutorId, startTime, endTime, maxParticipants } = req.body;

    const [newClass] = await db.insert(liveClasses).values({
      title,
      description,
      tutorId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxParticipants,
      status: "scheduled"
    }).returning();

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error creating live class:", error);
    res.status(500).json({ error: "Failed to create live class" });
  }
});

// Register for a class
router.post("/api/classes/:classId/register", async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if already registered
    const existing = await db.query.classParticipants.findFirst({
      where: and(
        eq(classParticipants.classId, parseInt(classId)),
        eq(classParticipants.userId, userId)
      )
    });

    if (existing) {
      return res.status(400).json({ error: "Already registered for this class" });
    }

    // Check class capacity
    const [liveClass] = await db.select().from(liveClasses).where(eq(liveClasses.id, parseInt(classId)));
    const participantCount = await db.query.classParticipants.findMany({
      where: eq(classParticipants.classId, parseInt(classId))
    }).then(p => p.length);

    if (liveClass.maxParticipants && participantCount >= liveClass.maxParticipants) {
      return res.status(400).json({ error: "Class is full" });
    }

    const [registration] = await db.insert(classParticipants).values({
      classId: parseInt(classId),
      userId,
      status: "registered"
    }).returning();

    res.status(201).json(registration);
  } catch (error) {
    console.error("Error registering for class:", error);
    res.status(500).json({ error: "Failed to register for class" });
  }
});

// Get scheduled classes
router.get("/api/classes/schedule", async (req, res) => {
  try {
    const scheduledClasses = await db.query.liveClasses.findMany({
      where: gte(liveClasses.startTime, new Date()),
      orderBy: [desc(liveClasses.startTime)],
      with: {
        tutor: {
          with: {
            user: true
          }
        }
      }
    });

    res.json(scheduledClasses);
  } catch (error) {
    console.error("Error fetching scheduled classes:", error);
    res.status(500).json({ error: "Failed to fetch scheduled classes" });
  }
});

// Create a scheduled class
router.post("/api/classes/schedule", async (req, res) => {
  try {
    const { title, description, startTime, duration, maxParticipants } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get tutor information for the user
    const [tutor] = await db.select().from(tutors).where(eq(tutors.userId, userId));

    if (!tutor) {
      return res.status(403).json({ error: "Only tutors can schedule classes" });
    }

    const endTime = new Date(new Date(startTime).getTime() + duration * 60000);

    const [newClass] = await db.insert(liveClasses).values({
      title,
      description,
      tutorId: tutor.id,
      startTime: new Date(startTime),
      endTime,
      maxParticipants,
      status: "scheduled"
    }).returning();

    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error scheduling class:", error);
    res.status(500).json({ error: "Failed to schedule class" });
  }
});

export default router;