import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, date, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Existing users table with updated role enum
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
  email: text("email").unique().notNull(),
  role: text("role", { enum: ["admin", "tutor", "parent", "student"] }).default("student").notNull(),
  fcmToken: text("fcm_token"),
  hasActiveSubscription: boolean("has_active_subscription").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
});

// New table for parent-student relationships
export const parentStudentRelations = pgTable("parent_student_relations", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").references(() => users.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  relationship: text("relationship", { 
    enum: ["father", "mother", "guardian"] 
  }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for exam PDFs
export const examPDFs = pgTable("exam_pdfs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New table for scheduled exams
export const scheduledExams = pgTable("scheduled_exams", {
  id: serial("id").primaryKey(),
  examPdfId: integer("exam_pdf_id").references(() => examPDFs.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  targetAge: integer("target_age").notNull(), // for 5-year-olds
  status: text("status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled"]
  }).default("scheduled").notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New table for exam submissions
export const examSubmissions = pgTable("exam_submissions", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").references(() => scheduledExams.id).notNull(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  submittedBy: integer("submitted_by").references(() => users.id).notNull(), // parent who submitted
  scannedFileUrl: text("scanned_file_url").notNull(),
  status: text("status", {
    enum: ["submitted", "processing", "graded", "error"]
  }).default("submitted").notNull(),
  submissionTime: timestamp("submission_time").defaultNow().notNull(),
  ocrResults: jsonb("ocr_results"),
  score: decimal("score", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New table for student performance tracking
export const studentPerformance = pgTable("student_performance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  examId: integer("exam_id").references(() => scheduledExams.id).notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  timeSpent: integer("time_spent"), // in minutes
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }),
  strengths: jsonb("strengths").default([]),
  weaknesses: jsonb("weaknesses").default([]),
  recommendations: jsonb("recommendations").default([]),
  parentFeedback: text("parent_feedback"),
  tutorFeedback: text("tutor_feedback"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Create schemas for new tables
export const insertParentStudentRelationSchema = createInsertSchema(parentStudentRelations);
export const selectParentStudentRelationSchema = createSelectSchema(parentStudentRelations);
export type InsertParentStudentRelation = typeof parentStudentRelations.$inferInsert;
export type SelectParentStudentRelation = typeof parentStudentRelations.$inferSelect;

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

export const insertStudentPerformanceSchema = createInsertSchema(studentPerformance);
export const selectStudentPerformanceSchema = createSelectSchema(studentPerformance);
export type InsertStudentPerformance = typeof studentPerformance.$inferInsert;
export type SelectStudentPerformance = typeof studentPerformance.$inferSelect;

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

export const questionCategories = pgTable("question_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  parentId: integer("parent_id").references(() => questionCategories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuestionCategorySchema = createInsertSchema(questionCategories);
export const selectQuestionCategorySchema = createSelectSchema(questionCategories);
export type InsertQuestionCategory = typeof questionCategories.$inferInsert;
export type SelectQuestionCategory = typeof questionCategories.$inferSelect;

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

export const mockTests = pgTable("mock_tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", {
    enum: ["subject_specific", "mixed"]
  }).notNull(),
  duration: integer("duration").notNull(), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  rules: jsonb("rules").notNull().default({
    subjectDistribution: {},
    subTopicDistribution: {},
    difficultyDistribution: {}
  }),
  isActive: boolean("is_active").default(true).notNull(),
  scheduledFor: date("scheduled_for"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const mockTestQuestions = pgTable("mock_test_questions", {
  id: serial("id").primaryKey(),
  mockTestId: integer("mock_test_id").references(() => mockTests.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  orderNumber: integer("order_number").notNull(),
  marks: integer("marks").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mockTestSessions = pgTable("mock_test_sessions", {
  id: serial("id").primaryKey(),
  mockTestId: integer("mock_test_id").references(() => mockTests.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  status: text("status", {
    enum: ["in_progress", "completed", "abandoned"]
  }).notNull().default("in_progress"),
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mockTestAnswers = pgTable("mock_test_answers", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => mockTestSessions.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  selectedOption: integer("selected_option"),
  isCorrect: boolean("is_correct"),
  timeSpent: integer("time_spent"), // in seconds
  feedback: text("feedback"), // Automated feedback for the answer
  confidenceLevel: integer("confidence_level"), // 1-5 scale
  mistakeCategory: text("mistake_category"), // Categorize type of mistake for better feedback
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", {
    enum: ["exam", "workshop", "deadline", "other"]
  }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  location: text("location"), // Can be physical location or virtual meeting link
  capacity: integer("capacity"),
  enrolledCount: integer("enrolled_count").default(0),
  status: text("status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled"]
  }).notNull().default("scheduled"),
  notifications: jsonb("notifications").default({
    reminderSent: false,
    startingSoon: false,
    completed: false
  }),
  metadata: jsonb("metadata").default({}),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role", {
    enum: ["attendee", "presenter", "organizer"]
  }).notNull().default("attendee"),
  status: text("status", {
    enum: ["registered", "attended", "cancelled", "no_show"]
  }).notNull().default("registered"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  checkedInAt: timestamp("checked_in_at"),
  feedback: jsonb("feedback").default({}),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type", {
    enum: ["event", "result", "system", "message"]
  }).notNull(),
  status: text("status", {
    enum: ["unread", "read", "archived"]
  }).notNull().default("unread"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  fileUrl: text("file_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  status: text("status", {
    enum: ["pending", "paid", "failed", "refunded"]
  }).notNull().default("pending"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "paypal"]
  }).notNull(),
  paymentId: text("payment_id"), // External payment provider's transaction ID
  downloadUrl: text("download_url"), // Secure, time-limited download URL
  downloadExpiry: timestamp("download_expiry"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status", {
    enum: ["pending", "succeeded", "failed", "refunded"]
  }).notNull(),
  paymentMethod: text("payment_method", {
    enum: ["stripe", "paypal"]
  }).notNull(),
  paymentIntentId: text("payment_intent_id"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tier: text("tier", {
    enum: ["basic", "standard", "premium", "enterprise"]
  }).notNull().default("basic"),
  duration: integer("duration").notNull(), // in days
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: jsonb("features").notNull().default({
    mockTests: {
      enabled: false,
      limit: 0 // 0 means disabled, -1 means unlimited
    },
    liveClasses: {
      enabled: false,
      limit: 0
    },
    studyMaterials: {
      enabled: false,
      categories: [] // empty means no access
    },
    tutorSupport: {
      enabled: false,
      hoursPerMonth: 0
    },
    analysisReports: {
      enabled: false,
      detailed: false
    },
    downloadAccess: {
      enabled: false,
      formats: [] // supported formats for downloads
    },
    customization: {
      enabled: false,
      features: [] // customizable features
    }
  }),
  maxMockTests: integer("max_mock_tests"), // null means unlimited
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", {
    enum: ["active", "expired", "cancelled"]
  }).notNull().default("active"),
  paymentId: integer("payment_id").references(() => payments.id),
  usedMockTests: integer("used_mock_tests").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export const insertMockTestSchema = createInsertSchema(mockTests);
export const selectMockTestSchema = createSelectSchema(mockTests);
export type InsertMockTest = typeof mockTests.$inferInsert;
export type SelectMockTest = typeof mockTests.$inferSelect;

export const insertMockTestQuestionSchema = createInsertSchema(mockTestQuestions);
export const selectMockTestQuestionSchema = createSelectSchema(mockTestQuestions);
export type InsertMockTestQuestion = typeof mockTestQuestions.$inferInsert;
export type SelectMockTestQuestion = typeof mockTestQuestions.$inferSelect;

export const insertMockTestSessionSchema = createInsertSchema(mockTestSessions);
export const selectMockTestSessionSchema = createSelectSchema(mockTestSessions);
export type InsertMockTestSession = typeof mockTestSessions.$inferInsert;
export type SelectMockTestSession = typeof mockTestSessions.$inferSelect;

export const insertMockTestAnswerSchema = createInsertSchema(mockTestAnswers);
export const selectMockTestAnswerSchema = createSelectSchema(mockTestAnswers);
export type InsertMockTestAnswer = typeof mockTestAnswers.$inferInsert;
export type SelectMockTestAnswer = typeof mockTestAnswers.$inferSelect;

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

export const insertProductSchema = createInsertSchema(products);
export const selectProductSchema = createSelectSchema(products);
export type InsertProduct = typeof products.$inferInsert;
export type SelectProduct = typeof products.$inferSelect;

export const insertOrderSchema = createInsertSchema(orders);
export const selectOrderSchema = createSelectSchema(orders);
export type InsertOrder = typeof orders.$inferInsert;
export type SelectOrder = typeof orders.$inferSelect;

export const insertTransactionSchema = createInsertSchema(transactions);
export const selectTransactionSchema = createSelectSchema(transactions);
export type InsertTransaction = typeof transactions.$inferInsert;
export type SelectTransaction = typeof transactions.$inferSelect;

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const selectSubscriptionPlanSchema = createSelectSchema(subscriptionPlans);
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type SelectSubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions);
export const selectUserSubscriptionSchema = createSelectSchema(userSubscriptions);
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;
export type SelectUserSubscription = typeof userSubscriptions.$inferSelect;

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => questionCategories.id),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull(),
  timeLimit: integer("time_limit").notNull(), // in minutes
  passingScore: integer("passing_score").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  orderNumber: integer("order_number").notNull(),
  marks: integer("marks").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzes);
export const selectQuizSchema = createSelectSchema(quizzes);
export type InsertQuiz = typeof quizzes.$inferInsert;
export type SelectQuiz = typeof quizzes.$inferSelect;

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions);
export const selectQuizQuestionSchema = createSelectSchema(quizQuestions);
export type InsertQuizQuestion = typeof quizQuestions.$inferInsert;
export type SelectQuizQuestion = typeof quizQuestions.$inferSelect;


export const liveClasses = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  tutorId: integer("tutor_id").references(() => tutors.id).notNull(),
  courseId: integer("course_id").references(() => courses.id),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  meetingLink: text("meeting_link"),
  googleCalendarEventId: text("google_calendar_event_id"),
  status: text("status", {
    enum: ["scheduled", "in_progress", "completed", "cancelled"]
  }).notNull().default("scheduled"),
  recordingUrl: text("recording_url"),
  maxParticipants: integer("max_participants"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const classParticipants = pgTable("class_participants", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => liveClasses.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: text("status", {
    enum: ["registered", "attended", "absent"]
  }).notNull().default("registered"),
  notificationSent: boolean("notification_sent").default(false).notNull(),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  feedback: text("feedback"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recordedVideos = pgTable("recorded_videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  tutorId: integer("tutor_id").references(() => tutors.id).notNull(),
  courseId: integer("course_id").references(() => courses.id),
  videoUrl: text("video_url").notNull(),
  duration: integer("duration"), // in seconds
  thumbnail: text("thumbnail"),
  isPublic: boolean("is_public").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

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