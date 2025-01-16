import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: text("role", { enum: ["admin", "tutor", "parent", "student"] }).default("student").notNull(),
  avatar: text("avatar"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  rating: decimal("rating", { precision: 3, scale: 2 }),
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
  tutorId: integer("tutor_id").references(() => tutors.id),
  courseId: integer("course_id").references(() => courses.id),
  progress: integer("progress").default(0).notNull(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["exam", "workshop", "deadline", "other"] }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"),
  capacity: integer("capacity"),
  enrolledCount: integer("enrolled_count").default(0),
  status: text("status", { enum: ["scheduled", "in_progress", "completed", "cancelled"] }).default("scheduled").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role", { enum: ["attendee", "presenter", "organizer"] }).default("attendee").notNull(),
  status: text("status", { enum: ["registered", "attended", "cancelled", "no_show"] }).default("registered").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["subject_specific", "mixed"] }).notNull(),
  duration: integer("duration").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  rules: jsonb("rules").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  scheduledFor: timestamp("scheduled_for"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mockTestQuestions = pgTable("mock_test_questions", {
  id: serial("id").primaryKey(),
  mockTestId: integer("mock_test_id").references(() => mockTests.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  orderNumber: integer("order_number").notNull(),
  marks: integer("marks").default(1).notNull(),
});

export const mockTestSessions = pgTable("mock_test_sessions", {
  id: serial("id").primaryKey(),
  mockTestId: integer("mock_test_id").references(() => mockTests.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status", { enum: ["in_progress", "completed", "abandoned"] }).default("in_progress").notNull(),
  score: integer("score"),
});

export const mockTestAnswers = pgTable("mock_test_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => mockTestSessions.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  selectedOption: integer("selected_option"),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type", { enum: ["login_streak", "completion", "grade", "participation"] }).notNull(),
  requiredValue: integer("required_value").notNull(),
});

export const studentAchievements = pgTable("student_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  progress: integer("progress").default(0).notNull(),
});

export const studentEngagement = pgTable("student_engagement", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  loginStreak: integer("login_streak").default(0).notNull(),
  lastLogin: timestamp("last_login").notNull(),
  totalTimeSpent: integer("total_time_spent").default(0).notNull(),
  completedLessons: integer("completed_lessons").default(0).notNull(),
  questionsAnswered: integer("questions_answered").default(0).notNull(),
  correctAnswers: integer("correct_answers").default(0).notNull(),
  participationScore: decimal("participation_score", { precision: 5, scale: 2 }).default("0").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", { enum: ["event", "result", "system", "message"] }).notNull(),
  status: text("status", { enum: ["unread", "read", "archived"] }).default("unread").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type", { enum: ["badge", "certificate", "bonus_points", "special_access"] }).notNull(),
  requirements: jsonb("requirements").notNull(),
});

export const examPDFs = pgTable("exam_pdfs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduledExams = pgTable("scheduled_exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  examPdfId: integer("exam_pdf_id").references(() => examPDFs.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(), 
  totalMarks: integer("total_marks").notNull(),
  status: text("status", { enum: ["scheduled", "in_progress", "completed", "cancelled"] }).default("scheduled").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => scheduledExams.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  submissionUrl: text("submission_url").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  marksObtained: integer("marks_obtained"),
  status: text("status", { enum: ["submitted", "graded", "late"] }).default("submitted").notNull(),
  feedback: text("feedback"),
});

export const parentStudentRelations = pgTable("parent_student_relations", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  relation: text("relation").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  category: text("category").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const liveClasses = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  tutorId: integer("tutor_id").references(() => tutors.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  maxParticipants: integer("max_participants"),
  status: text("status", { enum: ["scheduled", "in_progress", "completed", "cancelled"] }).default("scheduled").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const classParticipants = pgTable("class_participants", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => liveClasses.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status", { enum: ["registered", "attended", "cancelled"] }).default("registered").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const recordedVideos = pgTable("recorded_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  classId: integer("class_id").references(() => liveClasses.id),
  tutorId: integer("tutor_id").references(() => tutors.id).notNull(),
  duration: integer("duration").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export type InsertPayment = typeof payments.$inferInsert;
export type SelectPayment = typeof payments.$inferSelect;

export const insertCourseSchema = createInsertSchema(courses);
export const selectCourseSchema = createSelectSchema(courses);
export type InsertCourse = typeof courses.$inferInsert;
export type SelectCourse = typeof courses.$inferSelect;

export const insertQuestionSchema = createInsertSchema(questions);
export const selectQuestionSchema = createSelectSchema(questions);
export type InsertQuestion = typeof questions.$inferInsert;
export type SelectQuestion = typeof questions.$inferSelect;

export const insertMockTestSchema = createInsertSchema(mockTests);
export const selectMockTestSchema = createSelectSchema(mockTests);
export type InsertMockTest = typeof mockTests.$inferInsert;
export type SelectMockTest = typeof mockTests.$inferSelect;

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const selectSubscriptionPlanSchema = createSelectSchema(subscriptionPlans);
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions);
export const selectUserSubscriptionSchema = createSelectSchema(userSubscriptions);
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type SelectUserSubscription = typeof userSubscriptions.$inferSelect;

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = typeof events.$inferInsert;
export type SelectEvent = typeof events.$inferSelect;

export const insertEventParticipantSchema = createInsertSchema(eventParticipants);
export const selectEventParticipantSchema = createSelectSchema(eventParticipants);
export type InsertEventParticipant = typeof eventParticipants.$inferInsert;
export type SelectEventParticipant = typeof eventParticipants.$inferSelect;

export const insertNotificationSchema = createInsertSchema(notifications);
export const selectNotificationSchema = createSelectSchema(notifications);
export type InsertNotification = typeof notifications.$inferInsert;
export type SelectNotification = typeof notifications.$inferSelect;

export const insertLiveClassSchema = createInsertSchema(liveClasses);
export const selectLiveClassSchema = createSelectSchema(liveClasses);
export type InsertLiveClass = typeof liveClasses.$inferInsert;
export type SelectLiveClass = typeof liveClasses.$inferSelect;

export const insertClassParticipantSchema = createInsertSchema(classParticipants);
export const selectClassParticipantSchema = createSelectSchema(classParticipants);
export type InsertClassParticipant = typeof classParticipants.$inferInsert;
export type SelectClassParticipant = typeof classParticipants.$inferSelect;

export const insertRecordedVideoSchema = createInsertSchema(recordedVideos);
export const selectRecordedVideoSchema = createSelectSchema(recordedVideos);
export type InsertRecordedVideo = typeof recordedVideos.$inferInsert;
export type SelectRecordedVideo = typeof recordedVideos.$inferSelect;

export const insertMediaSchema = createInsertSchema(media);
export const selectMediaSchema = createSelectSchema(media);
export type InsertMedia = typeof media.$inferInsert;
export type SelectMedia = typeof media.$inferSelect;

export const insertExamPDFSchema = createInsertSchema(examPDFs);
export const selectExamPDFSchema = createSelectSchema(examPDFs);
export type InsertExamPDF = typeof examPDFs.$inferInsert;
export type SelectExamPDF = typeof examPDFs.$inferSelect;

export const insertScheduledExamSchema = createInsertSchema(scheduledExams);
export const selectScheduledExamSchema = createSelectSchema(scheduledExams);
export type InsertScheduledExam = typeof scheduledExams.$inferInsert;
export type SelectScheduledExam = typeof scheduledExams.$inferSelect;

export const insertExamSubmissionSchema = createInsertSchema(examSubmissions);
export const selectExamSubmissionSchema = createSelectSchema(examSubmissions);
export type InsertExamSubmission = typeof examSubmissions.$inferInsert;
export type SelectExamSubmission = typeof examSubmissions.$inferSelect;

export const insertParentStudentRelationSchema = createInsertSchema(parentStudentRelations);
export const selectParentStudentRelationSchema = createSelectSchema(parentStudentRelations);
export type InsertParentStudentRelation = typeof parentStudentRelations.$inferInsert;
export type SelectParentStudentRelation = typeof parentStudentRelations.$inferSelect;