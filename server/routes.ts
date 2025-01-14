import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, questions, courses, tutors, payments, studentProgress } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import multer from "multer";
import { parse } from "csv-parse";
import { stringify } from "csv-stringify";
import { Readable } from "stream";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

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

  // Analytics endpoint with enhanced data
  app.get("/api/analytics", requireAdmin, async (_req, res) => {
    // User growth data (last 30 days)
    const userGrowth = await db.execute<{ date: string; count: number }>(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    // Course performance metrics
    const courseMetrics = await db.execute<{
      courseName: string;
      completionRate: number;
      averageProgress: number;
      totalEnrollments: number;
      revenue: number;
    }>(sql`
      WITH course_stats AS (
        SELECT 
          c.id,
          c.title as "courseName",
          COUNT(DISTINCT sp.user_id) as "totalEnrollments",
          AVG(sp.progress) as "averageProgress",
          COUNT(CASE WHEN sp.progress = 100 THEN 1 END)::float / 
            NULLIF(COUNT(sp.user_id), 0) * 100 as "completionRate",
          COALESCE(SUM(p.amount::numeric), 0) as revenue
        FROM courses c
        LEFT JOIN student_progress sp ON c.id = sp.course_id
        LEFT JOIN payments p ON c.id = p.course_id AND p.status = 'completed'
        GROUP BY c.id, c.title
      )
      SELECT *
      FROM course_stats
      ORDER BY "totalEnrollments" DESC
    `);

    // Question analytics
    const questionAnalytics = await db.execute<{
      difficulty: string;
      count: number;
      averageAttempts: number;
      successRate: number;
    }>(sql`
      WITH question_stats AS (
        SELECT 
          q.difficulty,
          COUNT(*) as count,
          AVG(sp.attempts) as "averageAttempts",
          COUNT(CASE WHEN sp.completed THEN 1 END)::float / 
            NULLIF(COUNT(*), 0) * 100 as "successRate"
        FROM questions q
        LEFT JOIN student_progress sp ON q.id = sp.question_id
        GROUP BY q.difficulty
      )
      SELECT *
      FROM question_stats
      ORDER BY difficulty
    `);

    // Revenue analytics
    const revenueAnalytics = await db.execute<{
      period: string;
      revenue: number;
      transactionCount: number;
    }>(sql`
      WITH monthly_revenue AS (
        SELECT 
          DATE_TRUNC('month', created_at) as period,
          SUM(amount::numeric) as revenue,
          COUNT(*) as "transactionCount"
        FROM payments
        WHERE status = 'completed'
        AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY period
        ORDER BY period DESC
      )
      SELECT 
        to_char(period, 'Month YYYY') as period,
        revenue,
        "transactionCount"
      FROM monthly_revenue
    `);

    // User engagement metrics
    const userEngagement = await db.execute<{
      period: string;
      activeUsers: number;
      averageTimeSpent: number;
    }>(sql`
      WITH user_activity AS (
        SELECT 
          DATE_TRUNC('week', sp.last_activity) as period,
          COUNT(DISTINCT sp.user_id) as "activeUsers",
          AVG(sp.time_spent) as "averageTimeSpent"
        FROM student_progress sp
        WHERE sp.last_activity >= NOW() - INTERVAL '12 weeks'
        GROUP BY period
        ORDER BY period DESC
      )
      SELECT 
        to_char(period, 'DD Mon YYYY') as period,
        "activeUsers",
        "averageTimeSpent"
      FROM user_activity
    `);

    res.json({
      userGrowth,
      courseMetrics,
      questionAnalytics,
      revenueAnalytics,
      userEngagement,
    });
  });

  // Bulk Export Routes
  app.get("/api/users/export", requireAdmin, async (_req, res) => {
    try {
      const allUsers = await db.select().from(users);

      const stringifier = stringify({
        header: true,
        columns: ["username", "email", "role", "createdAt"]
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=users.csv");

      stringifier.pipe(res);
      allUsers.forEach(user => {
        stringifier.write({
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        });
      });
      stringifier.end();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/courses/export", requireAdmin, async (_req, res) => {
    try {
      const allCourses = await db.select().from(courses);

      const stringifier = stringify({
        header: true,
        columns: ["title", "description", "price", "published", "createdAt"]
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=courses.csv");

      stringifier.pipe(res);
      allCourses.forEach(course => {
        stringifier.write({
          title: course.title,
          description: course.description,
          price: course.price,
          published: course.published,
          createdAt: course.createdAt
        });
      });
      stringifier.end();
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  // Bulk Import Routes
  app.post("/api/users/import", requireAdmin, upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    try {
      const records: any[] = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });

      parser.on("readable", function() {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on("error", function(err) {
        throw err;
      });

      parser.write(req.file.buffer.toString());
      parser.end();

      // Wait for parsing to complete
      await new Promise((resolve) => parser.on("end", resolve));

      // Validate and prepare records
      const validRecords = records.map(record => ({
        username: record.username,
        email: record.email,
        role: record.role || "student",
        password: "changeme123" // Default password that users must change
      }));

      // Insert records
      const result = await db.insert(users).values(validRecords).returning();

      res.json({ imported: result.length });
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
        skip_empty_lines: true
      });

      parser.on("readable", function() {
        let record;
        while ((record = parser.read()) !== null) {
          records.push(record);
        }
      });

      parser.on("error", function(err) {
        throw err;
      });

      parser.write(req.file.buffer.toString());
      parser.end();

      // Wait for parsing to complete
      await new Promise((resolve) => parser.on("end", resolve));

      // Validate and prepare records
      const validRecords = records.map(record => ({
        title: record.title,
        description: record.description,
        price: parseFloat(record.price) || 0,
        published: record.published === "true"
      }));

      // Insert records
      const result = await db.insert(courses).values(validRecords).returning();

      res.json({ imported: result.length });
    } catch (error: any) {
      res.status(500).send(error.message);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}