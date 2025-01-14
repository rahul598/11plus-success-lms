import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { db } from "@db";
import { users, questions, courses, tutors, payments, studentProgress } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import multer from "multer";
import { stringify } from "csv-stringify";
import { parse } from 'csv-parse';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Extend Express Request type to include file from multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File
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

export function registerRoutes(app: Express): Server {
  // Sets up auth middleware and routes
  setupAuth(app);

  // Analytics endpoint with enhanced data
  app.get("/api/analytics", requireAdmin, async (_req, res) => {
    try {
      // User growth data (last 30 days)
      const userGrowth = await db.execute(sql`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `).then(result => result.rows as Array<{ date: string; count: number }>);

      // Course performance metrics  
      const courseMetrics = await db.execute(sql`
        WITH course_stats AS (
          SELECT 
            c.title as "courseName",
            COUNT(DISTINCT sp.user_id) as "totalEnrollments",
            AVG(CAST(sp.progress as float)) as "averageProgress",
            COUNT(CASE WHEN sp.progress = 100 THEN 1 END)::float / 
              NULLIF(COUNT(sp.user_id), 0) * 100 as "completionRate",
            COALESCE(SUM(CASE WHEN p.status = 'completed' THEN CAST(p.amount as float) ELSE 0 END), 0) as revenue
          FROM courses c
          LEFT JOIN student_progress sp ON c.id = sp.course_id
          LEFT JOIN payments p ON p.user_id = sp.user_id
          GROUP BY c.title
        )
        SELECT * FROM course_stats
        ORDER BY "totalEnrollments" DESC
      `).then(result => result.rows as Array<{
        courseName: string;
        totalEnrollments: number;
        averageProgress: number;
        completionRate: number;
        revenue: number;
      }>);

      // Question analytics
      const questionAnalytics = await db.execute(sql`
        WITH question_stats AS (
          SELECT 
            q.difficulty,
            COUNT(*) as count,
            AVG(COALESCE(sp.attempts, 0)) as "averageAttempts",
            COUNT(CASE WHEN sp.completed THEN 1 END)::float / 
              NULLIF(COUNT(*), 0) * 100 as "successRate"
          FROM questions q
          LEFT JOIN student_progress sp ON q.id = sp.question_id
          GROUP BY q.difficulty
        )
        SELECT * FROM question_stats
        ORDER BY difficulty
      `).then(result => result.rows as Array<{
        difficulty: string;
        count: number;
        averageAttempts: number;
        successRate: number;
      }>);

      // Revenue analytics
      const revenueAnalytics = await db.execute(sql`
        WITH monthly_revenue AS (
          SELECT 
            DATE_TRUNC('month', created_at) as period,
            SUM(CAST(amount as float)) as revenue,
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
      `).then(result => result.rows as Array<{
        period: string;
        revenue: number;
        transactionCount: number;
      }>);

      // User engagement metrics
      const userEngagement = await db.execute(sql`
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
      `).then(result => result.rows as Array<{
        period: string;
        activeUsers: number;
        averageTimeSpent: number;
      }>);

      res.json({
        userGrowth,
        courseMetrics,
        questionAnalytics,
        revenueAnalytics,
        userEngagement,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      res.status(500).send(error.message);
    }
  });

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


  // Mock Test Management Routes for Admin
  app.get("/api/admin/mock-tests", requireAdmin, async (_req, res) => {
    try {
        const allTests = await db
            .select({
                id: mockTests.id,
                title: mockTests.title,
                description: mockTests.description,
                type: mockTests.type,
                duration: mockTests.duration,
                totalQuestions: mockTests.totalQuestions,
                createdBy: mockTests.createdBy,
                createdAt: mockTests.createdAt,
                scheduledFor: mockTests.scheduledFor,
                status: mockTests.status
            })
            .from(mockTests)
            .orderBy(desc(mockTests.createdAt));

        res.json(allTests);
    } catch (error: any) {
        console.error("Error fetching mock tests:", error);
        res.status(500).send(error.message);
    }
});

app.post("/api/admin/mock-tests", requireAdmin, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const [mockTest] = await db
            .insert(mockTests)
            .values({
                title: req.body.title,
                description: req.body.description,
                type: req.body.type,
                duration: req.body.duration,
                totalQuestions: req.body.totalQuestions,
                rules: req.body.rules || [],
                createdBy: req.user.id,
                status: "draft",
                scheduledFor: new Date(req.body.scheduledFor)
            })
            .returning();

        res.json(mockTest);
    } catch (error: any) {
        console.error("Error creating mock test:", error);
        res.status(500).send(error.message);
    }
});

// Get mock test details with questions
app.get("/api/admin/mock-tests/:id", requireAdmin, async (req, res) => {
    try {
        const testId = parseInt(req.params.id);

        const [mockTest] = await db
            .select()
            .from(mockTests)
            .where(eq(mockTests.id, testId))
            .limit(1);

        if (!mockTest) {
            return res.status(404).send("Mock test not found");
        }

        const questions = await db
            .select()
            .from(mockTestQuestions)
            .where(eq(mockTestQuestions.mockTestId, testId))
            .orderBy(mockTestQuestions.questionOrder);

        res.json({ ...mockTest, questions });
    } catch (error: any) {
        console.error("Error fetching mock test details:", error);
        res.status(500).send(error.message);
    }
});

// Update mock test status
app.patch("/api/admin/mock-tests/:id/status", requireAdmin, async (req, res) => {
    try {
        const testId = parseInt(req.params.id);
        const { status } = req.body;

        const [updatedTest] = await db
            .update(mockTests)
            .set({ status })
            .where(eq(mockTests.id, testId))
            .returning();

        if (!updatedTest) {
            return res.status(404).send("Mock test not found");
        }

        res.json(updatedTest);
    } catch (error: any) {
        console.error("Error updating mock test status:", error);
        res.status(500).send(error.message);
    }
});

// Add questions to mock test
app.post("/api/admin/mock-tests/:id/questions", requireAdmin, async (req, res) => {
    try {
        const testId = parseInt(req.params.id);
        const { questions } = req.body;

        const insertedQuestions = await db
            .insert(mockTestQuestions)
            .values(
                questions.map((q: any, index: number) => ({
                    mockTestId: testId,
                    questionText: q.questionText,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    marks: q.marks,
                    questionOrder: index + 1,
                    category: q.category,
                    difficulty: q.difficulty
                }))
            )
            .returning();

        res.json(insertedQuestions);
    } catch (error: any) {
        console.error("Error adding questions to mock test:", error);
        res.status(500).send(error.message);
    }
});

// Get mock test sessions and results
app.get("/api/admin/mock-tests/:id/sessions", requireAdmin, async (req, res) => {
    try {
        const testId = parseInt(req.params.id);

        const sessions = await db
            .select({
                id: mockTestSessions.id,
                userId: mockTestSessions.userId,
                startTime: mockTestSessions.startTime,
                endTime: mockTestSessions.endTime,
                score: mockTestSessions.score,
                status: mockTestSessions.status,
                username: users.username
            })
            .from(mockTestSessions)
            .innerJoin(users, eq(users.id, mockTestSessions.userId))
            .where(eq(mockTestSessions.mockTestId, testId))
            .orderBy(desc(mockTestSessions.startTime));

        res.json(sessions);
    } catch (error: any) {
        console.error("Error fetching mock test sessions:", error);
        res.status(500).send(error.message);
    }
});


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

// Stats endpoints for role-specific dashboards
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
            .where(and(
                eq(courses.createdBy, req.user.id),
                eq(courses.published, true)
            ));

        const [mockTestsCount] = await db
            .select({ count: sql<number>`count(*)` })
            .from(mockTests)
            .where(eq(mockTests.createdBy, req.user.id));

        const [{ averageRating }] = await db
            .select({
                averageRating: sql<number>`avg(rating)::numeric(10,2)`
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
            .where(and(
                eq(studentProgress.userId, req.user.id),
                eq(studentProgress.progress, 100)
            ));

        const [activeTests] = await db
            .select({ count: sql<number>`count(*)` })
            .from(mockTestSessions)
            .where(and(
                eq(mockTestSessions.userId, req.user.id),
                eq(mockTestSessions.status, "in_progress")
            ));


        const [achievements] = await db
            .select({ count: sql<number>`count(*)` })
            .from(studentAchievements)
            .where(eq(studentAchievements.userId, req.user.id));

        const [{ averageScore }] = await db
            .select({
                averageScore: sql<number>`avg(score)::numeric(10,2)`
            })
            .from(mockTestSessions)
            .where(and(
                eq(mockTestSessions.userId, req.user.id),
                eq(mockTestSessions.status, "completed")
            ));

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

// Analytics Export Routes
app.get("/api/analytics/export", requireAdmin, async (_req, res) => {
    try {
        const [userGrowth, courseMetrics, questionAnalytics, revenueAnalytics, userEngagement] = await Promise.all([
            db.execute(sql`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as count
          FROM users
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY date
        `),
            db.execute(sql`
          WITH course_stats AS (
            SELECT 
              c.title as "courseName",
              COUNT(DISTINCT sp.user_id) as "totalEnrollments",
              AVG(sp.progress) as "averageProgress",
              COUNT(CASE WHEN sp.progress = 100 THEN 1 END)::float / 
                NULLIF(COUNT(sp.user_id), 0) * 100 as "completionRate",
              COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount::numeric ELSE 0 END), 0) as revenue
            FROM courses c
            LEFT JOIN student_progress sp ON c.id = sp.course_id
            LEFT JOIN payments p ON p.user_id = sp.user_id
            GROUP BY c.title
          )
          SELECT * FROM course_stats
          ORDER BY "totalEnrollments" DESC
        `),
            db.execute(sql`
          WITH question_stats AS (
            SELECT 
              q.difficulty,
              COUNT(*) as count,
              AVG(COALESCE(sp.attempts, 0)) as "averageAttempts",
              COUNT(CASE WHEN sp.completed THEN 1 END)::float / 
                NULLIF(COUNT(*), 0) * 100 as "successRate"
            FROM questions q
            LEFT JOIN student_progress sp ON q.id = sp.id
            GROUP BY q.difficulty
          )
          SELECT * FROM question_stats
          ORDER BY difficulty
        `),
            db.execute(sql`
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
        `),
            db.execute(sql`
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
        `)
        ]);

        const report = {
            userGrowth,
            courseMetrics,
            questionAnalytics,
            revenueAnalytics,
            userEngagement,
            generatedAt: new Date().toISOString(),
        };

        if (req.query.format === 'csv') {
            const stringifier = stringify({
                header: true,
                columns: [
                    'metric',
                    'category',
                    'value',
                    'date',
                ]
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=analytics_report.csv');

            stringifier.pipe(res);

            // Flatten the data for CSV export
            userGrowth.forEach(row => {
                stringifier.write({
                    metric: 'User Growth',
                    category: 'Daily Users',
                    value: row.count,
                    date: row.date,
                });
            });

            courseMetrics.forEach(row => {
                stringifier.write({
                    metric: 'Course Performance',
                    category: row.courseName,
                    value: row.completionRate,
                    date: new Date().toISOString().split('T')[0],
                });
            });

            questionAnalytics.forEach(row => {
                stringifier.write({
                    metric: 'Question Analytics',
                    category: row.difficulty,
                    value: row.successRate,
                    date: new Date().toISOString().split('T')[0],
                });
            });

            revenueAnalytics.forEach(row => {
                stringifier.write({
                    metric: 'Revenue Analytics',
                    category: row.period,
                    value: row.revenue,
                    date: new Date().toISOString().split('T')[0],
                });
            });

            userEngagement.forEach(row => {
                stringifier.write({
                    metric: 'User Engagement',
                    category: row.period,
                    value: row.activeUsers,
                    date: row.period,
                });
            });


            stringifier.end();
        } else {
            res.json(report);
        }
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

// Media Management Routes
app.get("/api/media", requireAuth, async (_req, res) => {
    const allMedia = await db.select().from(media).orderBy(desc(media.createdAt));
    res.json(allMedia);
});

app.post("/api/media/upload", requireAuth, upload.single("file"), async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }

    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    try {
        // Here you would typically:
        // 1. Upload the file to a storage service (e.g., S3, Cloudinary)
        // 2. Get the URL from the storage service
        // For now, we'll use a placeholder URL
        const url = `/uploads/${req.file.originalname}`;

        const [mediaFile] = await db
            .insert(media)
            .values({
                url,
                filename: req.file.originalname,
                category: req.body.category as "Mathematics" | "Science" | "Chemistry" | "Reasoning",
                createdBy: req.user.id,
            })
            .returning();

        res.json(mediaFile);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

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
        // Create initial engagement record if it doesn't exist
        const [newEngagement] = await db
            .insert(studentEngagement)
            .values({
                userId: req.user.id,
                lastLogin: new Date(),
            })
            .returning();

        return res.json(newEngagement);
    }

    // Update login streak and last login
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

    // Update engagement metrics
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

    // Check for new achievements
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

// Mock Test Management Routes
app.get("/api/mock-tests", requireAuth, async (_req, res) => {
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

app.post("/api/mock-tests", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const {
            title,
            description,
            type,
            duration,
            totalQuestions,
            rules,
            scheduledFor
        } = req.body;

        // Create the mock test
        const [mockTest] = await db
            .insert(mockTests)
            .values({
                title,
                description,
                type,
                duration,
                totalQuestions,
                rules,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                createdBy: req.user.id
            })
            .returning();

        // If it's a subject-specific test, generate questions based on rules
        if (type === "subject_specific") {
            const subjectQuestions = await db
                .select()
                .from(questions)
                .where(eq(questions.category, rules.subject))
                .limit(totalQuestions);

            // Add questions to the mock test
            await Promise.all(
                subjectQuestions.map((question, index) =>
                    db.insert(mockTestQuestions).values({
                        mockTestId: mockTest.id,
                        questionId: question.id,
                        orderNumber: index + 1,
                        marks: rules.marksPerQuestion || 1
                    })
                )
            );
        }
        // For mixed tests, handle the distribution across subjects
        else if (type === "mixed") {
            for (const [subject, count] of Object.entries(rules.subjectDistribution)) {
                const subjectQuestions = await db
                    .select()
                    .from(questions)
                    .where(eq(questions.category, subject))
                    .limit(count as number);

                await Promise.all(
                    subjectQuestions.map((question, index) =>
                        db.insert(mockTestQuestions).values({
                            mockTestId: mockTest.id,
                            questionId: question.id,
                            orderNumber: index + 1,
                            marks: rules.marksPerQuestion || 1
                        })
                    )
                );
            }
        }

        res.json(mockTest);
    } catch (error: any) {
        console.error("Error creating mock test:", error);
        res.status(500).send(error.message);
    }
});

app.get("/api/mock-tests/:id", requireAuth, async (req, res) => {
    try {
        const [mockTest] = await db
            .select()
            .from(mockTests)
            .where(eq(mockTests.id, parseInt(req.params.id)))
            .limit(1);

        if (!mockTest) {
            return res.status(404).send("Mock test not found");
        }

        const questions = await db
            .select({
                id: mockTestQuestions.id,
                orderNumber: mockTestQuestions.orderNumber,
                marks: mockTestQuestions.marks,
                question: {
                    id: questions.id,
                    title: questions.title,
                    content: questions.content,
                    category: questions.category,
                    subCategory: questions.subCategory,
                    difficulty: questions.difficulty,
                    questionType: questions.questionType,
                    contentType: questions.contentType,
                    options: questions.options
                }
            })
            .from(mockTestQuestions)
            .innerJoin(questions, eq(questions.id, mockTestQuestions.questionId))
            .where(eq(mockTestQuestions.mockTestId, mockTest.id))
            .orderBy(mockTestQuestions.orderNumber);

        res.json({ ...mockTest, questions });
    } catch (error: any) {
        console.error("Error fetching mock test:", error);
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

        // If the creator is not an attendee, register them as organizer
        await db.insert(eventParticipants).values({
            eventId: event.id,
            userId: req.user.id,
            role: "organizer",
        });

        // Send notifications to relevant users
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

        // Register the user
        const [registration] = await db
            .insert(eventParticipants)
            .values({
                eventId,
                userId: req.user.id,
                role: "attendee",
            })
            .returning();

        // Update enrolled count
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

        // Get all answers for this session
        const answers = await db
            .select({
                answer: mockTestAnswers,
                question: {
                    id: questions.id,
                    content: questions.content,
                    correctAnswer: questions.correctAnswer,
                    explanation: questions.explanation,
                },
            })
            .from(mockTestAnswers)
            .innerJoin(questions, eq(questions.id, mockTestAnswers.questionId))
            .where(eq(mockTestAnswers.sessionId, sessionId));

        let totalScore = 0;
        const processedAnswers = await Promise.all(
            answers.map(async ({ answer, question }) => {
                const isCorrect = answer.selectedOption === question.correctAnswer;
                if (isCorrect) totalScore++;

                // Generate feedback based on the answer
                const feedback = isCorrect
                    ? "Correct! " + (question.explanation || "")
                    : `Incorrect. The correct answer was option ${question.correctAnswer}. ${
                        question.explanation || ""
                    }`;

                // Update the answer with feedback
                const [updatedAnswer] = await db
                    .update(mockTestAnswers)
                    .set({
                        isCorrect,
                        feedback,
                        confidenceLevel: calculateConfidenceLevel(answer.timeSpent),
                        mistakeCategory: !isCorrect
                            ? categorizeMistake(answer.selectedOption, question.correctAnswer)
                            : null,
                    })
                    .where(eq(mockTestAnswers.id, answer.id))
                    .returning();

                return updatedAnswer;
            })
        );

        // Update session score
        const [updatedSession] = await db
            .update(mockTestSessions)
            .set({
                score: totalScore,
                status: "completed",
                endTime: new Date(),
            })
            .where(eq(mockTestSessions.id, sessionId))
            .returning();

        // Send notification about completed test
        await db.insert(notifications).values({
            userId: session.userId,
            title: "Mock Test Results Available",
            content: `Your mock test results are ready. Score: ${totalScore}/${answers.length}`,
            type: "result",
        });

        res.json({
            session: updatedSession,
            answers: processedAnswers,
        });
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
    // Time spent is in seconds
    // Quick answers might indicate high confidence
    if (timeSpent < 30) return 5;
    if (timeSpent < 60) return 4;
    if (timeSpent < 120) return 3;
    if (timeSpent < 180) return 2;
    return 1;
}

function categorizeMistake(selected: number, correct: number): string {
    // This is a simple implementation
    // In a real application, this would be more sophisticated
    // based on question type and common mistake patterns
    if (Math.abs(selected - correct) === 1) {
        return "near_miss";
    }
    return "conceptual_error";
}
// Mock Test Generation Routes
app.post("/api/mock-tests/generate", requireAuth, async (req: Request & { user?: Express.User }, res) => {
    if (!req.user) {
        return res.status(401).send("Unauthorized");
    }

    try {
        const { type, totalQuestions, rules } = req.body;

        let selectedQuestions: typeof questions.$inferSelect[] = [];

        // For subject-specific tests, select questions from one subject
        if (type === "subject_specific") {
            selectedQuestions = await db
                .select()
                .from(questions)
                .where(eq(questions.category, rules.category))
                .orderBy(sql`RANDOM()`)
                .limit(totalQuestions);
        }
        // For mixed tests, handle the distribution across subjects
        else if (type === "mixed") {
            for (const [category, count] of Object.entries(rules.categoryDistribution)) {
                // For each subject, get specified number of questions
                const subjectQuestions = await db
                    .select()
                    .from(questions)
                    .where(eq(questions.category, category))
                    .orderBy(sql`RANDOM()`)
                    .limit(count as number);

                selectedQuestions = [...selectedQuestions, ...subjectQuestions];
            }

            // If subtopic distribution is specified, ensure questions from each subtopic
            if (rules.subTopicDistribution) {
                selectedQuestions = [];
                for (const [category, subtopics] of Object.entries(rules.subTopicDistribution)) {
                    for (const [subcategory, count] of Object.entries(subtopics)) {
                        const subtopicQuestions = await db
                            .select()
                            .from(questions)
                            .where(
                                and(
                                    eq(questions.category, category),
                                    eq(questions.subCategory, subcategory)
                                )
                            )
                            .orderBy(sql`RANDOM()`)
                            .limit(count as number);

                        selectedQuestions = [...selectedQuestions, ...subtopicQuestions];
                    }
                }
            }
        }

        if (selectedQuestions.length < totalQuestions) {
            return res.status(400).send("Not enough questions available for the specified criteria");
        }

        // Create the mock test
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

        // Add questions to the mock test
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

        // Notify relevant users if the test is scheduled
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

// Get question statistics
app.get("/api/questions/stats", requireAuth, async (_req, res) => {
    try {
        // Get total question count
        const [{ total }] = await db
            .select({
                total: sql<number>`count(*)`
            })
            .from(questions);

        // Get counts by category
        const categoryCounts = await db
            .select({
                category: questions.category,
                total: sql<number>`count(*)`
            })
            .from(questions)
            .groupBy(questions.category);

        // Transform into a more convenient format
        const byCategory = Object.fromEntries(
            categoryCounts.map(({ category, total }) => [
                category,
                { total }
            ])
        );

        res.json({
            total,
            byCategory
        });
    } catch (error: any) {
        console.error("Error fetching question statistics:", error);
        res.status(500).send(error.message);
    }
});

const httpServer = createServer(app);
return httpServer;
}