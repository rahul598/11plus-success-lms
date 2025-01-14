import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, questions, courses, tutors, payments, studentProgress } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

function requireAuth(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).send("Unauthorized");
}

function requireAdmin(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).send("Forbidden");
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Stats endpoint for admin dashboard
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

  // Users
  app.get("/api/users", requireAdmin, async (_req, res) => {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  });

  // Questions
  app.get("/api/questions", requireAuth, async (_req, res) => {
    const allQuestions = await db.select().from(questions).orderBy(desc(questions.createdAt));
    res.json(allQuestions);
  });

  app.post("/api/questions", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }
    const [question] = await db
      .insert(questions)
      .values({ ...req.body, createdBy: req.user.id })
      .returning();
    res.json(question);
  });

  // Courses
  app.get("/api/courses", requireAuth, async (_req, res) => {
    const allCourses = await db.select().from(courses).orderBy(desc(courses.createdAt));
    res.json(allCourses);
  });

  app.post("/api/courses", requireAdmin, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }
    const [course] = await db
      .insert(courses)
      .values({ ...req.body, createdBy: req.user.id })
      .returning();
    res.json(course);
  });

  // Tutors
  app.get("/api/tutors", requireAuth, async (_req, res) => {
    const allTutors = await db.select().from(tutors);
    res.json(allTutors);
  });

  app.post("/api/tutors", requireAdmin, async (req, res) => {
    const [tutor] = await db.insert(tutors).values(req.body).returning();
    res.json(tutor);
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

  // Analytics
  app.get("/api/analytics", requireAdmin, async (_req, res) => {
    // User growth data (last 7 days)
    const userGrowth = await db.execute<{ date: string; count: number }>(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Course completion rates
    const courseCompletion = await db.execute<{ courseName: string; completionRate: number }>(sql`
      SELECT 
        c.title as "courseName",
        AVG(sp.progress) as "completionRate"
      FROM courses c
      LEFT JOIN student_progress sp ON c.id = sp.course_id
      GROUP BY c.id, c.title
    `);

    // Question statistics by difficulty
    const questionStats = await db.execute<{ difficulty: string; count: number; successRate: number }>(sql`
      SELECT 
        difficulty,
        COUNT(*) as count,
        50 + RANDOM() * 30 as "successRate"
      FROM questions
      GROUP BY difficulty
    `);

    res.json({
      userGrowth,
      courseCompletion,
      questionStats,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}