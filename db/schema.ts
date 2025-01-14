import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: text("role", { enum: ["admin", "tutor", "student"] }).default("student").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category", { 
    enum: ["Non-Verbal Reasoning", "Verbal Reasoning", "English", "Mathematics"] 
  }).notNull(),
  subCategory: text("subcategory", {
    enum: [
      // NVR subcategories
      "Pattern Series", "Figure Analysis", "Mirror Images", "Paper Folding", 
      "Cube Construction", "Figure Matrix", "Analogy",
      // Verbal Reasoning subcategories
      "Word Relationships", "Sentence Completion", "Logical Deduction",
      "Sequence Detection", "Coding-Decoding", "Blood Relations",
      // English subcategories
      "Grammar", "Comprehension", "Vocabulary", "Writing",
      // Mathematics subcategories
      "Algebra", "Geometry", "Arithmetic", "Statistics", "Calculus"
    ]
  }).notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  questionType: text("question_type", { 
    enum: [
      "text", "math_formula", "image_based", "diagram",
      "pattern_matching", "spatial_reasoning", "sequence",
      "mixed"
    ] 
  }).notNull(),
  contentType: jsonb("content_type").notNull().default({
    hasFormula: false,
    hasImage: false,
    hasPattern: false,
    hasDiagram: false
  }),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  explanation: text("explanation"),
  hints: jsonb("hints").default([]),
  metadata: jsonb("metadata").default({}),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  published: boolean("published").default(false).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  specialization: text("specialization").notNull(),
  bio: text("bio").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).notNull(),
  available: boolean("available").default(true).notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "completed", "failed"] }).notNull(),
  type: text("type", { enum: ["course", "subscription"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentProgress = pgTable("student_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  progress: decimal("progress", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  category: text("category", {
    enum: ["Mathematics", "Science", "Chemistry", "Reasoning"]
  }).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type", {
    enum: ["login_streak", "completion", "grade", "participation"]
  }).notNull(),
  requiredValue: integer("required_value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentAchievements = pgTable("student_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").notNull().default(0),
});

export const studentEngagement = pgTable("student_engagement", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  loginStreak: integer("login_streak").notNull().default(0),
  lastLogin: timestamp("last_login").notNull(),
  totalTimeSpent: integer("total_time_spent").notNull().default(0), 
  completedLessons: integer("completed_lessons").notNull().default(0),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  participationScore: decimal("participation_score", { precision: 5, scale: 2 }).notNull().default("0"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type", {
    enum: ["badge", "certificate", "bonus_points", "special_access"]
  }).notNull(),
  requirements: jsonb("requirements").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studentRewards = pgTable("student_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rewardId: integer("reward_id").references(() => rewards.id).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
  status: text("status", {
    enum: ["active", "expired", "consumed"]
  }).notNull().default("active"),
});

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export type InsertQuestion = typeof questions.$inferInsert;
export type SelectQuestion = typeof questions.$inferSelect;

export const insertCourseSchema = createInsertSchema(courses);
export const selectCourseSchema = createSelectSchema(courses);
export type InsertCourse = typeof courses.$inferInsert;
export type SelectCourse = typeof courses.$inferSelect;

export const insertTutorSchema = createInsertSchema(tutors);
export const selectTutorSchema = createSelectSchema(tutors);
export type InsertTutor = typeof tutors.$inferInsert;
export type SelectTutor = typeof tutors.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export type InsertPayment = typeof payments.$inferInsert;
export type SelectPayment = typeof payments.$inferSelect;

export const insertProgressSchema = createInsertSchema(studentProgress);
export const selectProgressSchema = createSelectSchema(studentProgress);
export type InsertProgress = typeof studentProgress.$inferInsert;
export type SelectProgress = typeof studentProgress.$inferSelect;

export const insertMediaSchema = createInsertSchema(media);
export const selectMediaSchema = createSelectSchema(media);
export type InsertMedia = typeof media.$inferInsert;
export type SelectMedia = typeof media.$inferSelect;

export const insertAchievementSchema = createInsertSchema(achievements);
export const selectAchievementSchema = createSelectSchema(achievements);
export type InsertAchievement = typeof achievements.$inferInsert;
export type SelectAchievement = typeof achievements.$inferSelect;

export const insertStudentAchievementSchema = createInsertSchema(studentAchievements);
export const selectStudentAchievementSchema = createSelectSchema(studentAchievements);
export type InsertStudentAchievement = typeof studentAchievements.$inferInsert;
export type SelectStudentAchievement = typeof studentAchievements.$inferSelect;

export const insertEngagementSchema = createInsertSchema(studentEngagement);
export const selectEngagementSchema = createSelectSchema(studentEngagement);
export type InsertEngagement = typeof studentEngagement.$inferInsert;
export type SelectEngagement = typeof studentEngagement.$inferSelect;

export const insertRewardSchema = createInsertSchema(rewards);
export const selectRewardSchema = createSelectSchema(rewards);
export type InsertReward = typeof rewards.$inferInsert;
export type SelectReward = typeof rewards.$inferSelect;

export const insertStudentRewardSchema = createInsertSchema(studentRewards);
export const selectStudentRewardSchema = createSelectSchema(studentRewards);
export type InsertStudentReward = typeof studentRewards.$inferInsert;
export type SelectStudentReward = typeof studentRewards.$inferSelect;