import { Router } from "express";
import { db } from "@db";
import { 
  users,
  examPDFs,
  scheduledExams,
  examSubmissions,
  parentStudentRelations,
  type SelectUser 
} from "@db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import multer from "multer";
import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

const router = Router();

// Get all exams based on user role
router.get("/api/exams", async (req, res) => {
  try {
    const user = req.user as SelectUser;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    let exams;
    switch (user.role) {
      case "admin":
      case "tutor":
        // Get all exams with their PDFs and submission counts
        exams = await db.query.scheduledExams.findMany({
          orderBy: [desc(scheduledExams.createdAt)],
          with: {
            examPdf: true,
            submissions: true,
          },
        });
        break;

      case "parent":
        // Get exams for linked students with submission status
        const studentIds = await db.query.parentStudentRelations.findMany({
          where: eq(parentStudentRelations.parentId, user.id),
          columns: {
            studentId: true,
          },
        });

        exams = await db.query.scheduledExams.findMany({
          where: gte(scheduledExams.startTime, new Date()),
          with: {
            examPdf: true,
            submissions: {
              where: eq(examSubmissions.studentId, user.id),
            },
          },
        });

        // Filter exams based on student age and add submission status
        exams = exams.map(exam => ({
          ...exam,
          canSubmit: exam.submissions.length === 0,
          isSubmitted: exam.submissions.length > 0,
        }));
        break;

      case "student":
        // Get assigned exams for student with performance data
        exams = await db.query.scheduledExams.findMany({
          where: gte(scheduledExams.startTime, new Date()),
          with: {
            examPdf: true,
            submissions: {
              where: eq(examSubmissions.studentId, user.id),
            },
          },
        });
        break;

      default:
        return res.status(403).json({ error: "Invalid user role" });
    }

    res.json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
});

// Get exam PDFs (admin/tutor only)
router.get("/api/exams/pdfs", async (req, res) => {
  try {
    const user = req.user as SelectUser;
    if (!user || !["admin", "tutor"].includes(user.role)) {
      return res.status(403).json({ error: "Only admins and tutors can view exam PDFs" });
    }

    const pdfs = await db.query.examPDFs.findMany({
      orderBy: [desc(examPDFs.createdAt)],
    });

    res.json(pdfs);
  } catch (error) {
    console.error("Error fetching exam PDFs:", error);
    res.status(500).json({ error: "Failed to fetch exam PDFs" });
  }
});

// Upload exam PDF (admin/tutor only)
router.post("/api/exams/pdf", upload.single("file"), async (req, res) => {
  try {
    const user = req.user as SelectUser;
    if (!user || !["admin", "tutor"].includes(user.role)) {
      return res.status(403).json({ error: "Only admins and tutors can upload exams" });
    }

    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // TODO: Upload file to storage service and get URL
    const fileUrl = "temporary_url"; // Replace with actual file upload

    const [examPdf] = await db.insert(examPDFs).values({
      title,
      description,
      url: fileUrl,
      createdBy: user.id,
    }).returning();

    res.status(201).json(examPdf);
  } catch (error) {
    console.error("Error uploading exam PDF:", error);
    res.status(500).json({ error: "Failed to upload exam PDF" });
  }
});

// Schedule an exam (admin/tutor only)
router.post("/api/exams/schedule", async (req, res) => {
  try {
    const user = req.user as SelectUser;
    if (!user || !["admin", "tutor"].includes(user.role)) {
      return res.status(403).json({ error: "Only admins and tutors can schedule exams" });
    }

    const { examPdfId, title, description, startTime, duration, totalMarks } = req.body;

    const [exam] = await db.insert(scheduledExams).values({
      examPdfId,
      title,
      description,
      startTime: new Date(startTime),
      duration,
      totalMarks,
      createdBy: user.id,
    }).returning();

    res.status(201).json(exam);
  } catch (error) {
    console.error("Error scheduling exam:", error);
    res.status(500).json({ error: "Failed to schedule exam" });
  }
});

// Submit exam (parent only)
router.post("/api/exams/:examId/submit", upload.single("file"), async (req, res) => {
  try {
    const user = req.user as SelectUser;
    if (!user || user.role !== "parent") {
      return res.status(403).json({ error: "Only parents can submit exams" });
    }

    const { examId } = req.params;
    const { studentId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Verify parent-student relationship
    const relation = await db.query.parentStudentRelations.findFirst({
      where: and(
        eq(parentStudentRelations.parentId, user.id),
        eq(parentStudentRelations.studentId, parseInt(studentId))
      ),
    });

    if (!relation) {
      return res.status(403).json({ error: "Not authorized to submit for this student" });
    }

    // TODO: Upload scanned file to storage service and get URL
    const submissionUrl = "temporary_url"; // Replace with actual file upload

    // Create submission
    const [submission] = await db.insert(examSubmissions).values({
      examId: parseInt(examId),
      studentId: parseInt(studentId),
      submissionUrl,
      status: "submitted",
    }).returning();

    // Process OCR in background
    processOCR(submission.id, file.buffer).catch(console.error);

    res.status(201).json(submission);
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ error: "Failed to submit exam" });
  }
});

// Process OCR using AWS Textract
async function processOCR(submissionId: number, fileBuffer: Buffer) {
  try {
    // Using test credentials for development
    const textract = new TextractClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: "test-key-id",
        secretAccessKey: "test-secret-key",
      },
    });

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: fileBuffer,
      },
    });

    const response = await textract.send(command);
    const extractedText = response.Blocks?.filter(block => block.BlockType === "LINE")
      .map(block => block.Text)
      .join("\n") || "";

    // Update submission with OCR results
    await db
      .update(examSubmissions)
      .set({
        status: "submitted",
        feedback: extractedText,
      })
      .where(eq(examSubmissions.id, submissionId));

    // For testing, auto-grade with simple matching
    const score = calculateTestScore(extractedText);
    await db
      .update(examSubmissions)
      .set({
        status: "graded",
        marksObtained: score,
      })
      .where(eq(examSubmissions.id, submissionId));

  } catch (error) {
    console.error("Error processing OCR:", error);
    await db
      .update(examSubmissions)
      .set({
        status: "submitted",
        feedback: "Error processing OCR: " + (error as Error).message,
      })
      .where(eq(examSubmissions.id, submissionId));
  }
}

// Simple test scoring function
function calculateTestScore(text: string): number {
  // This is a placeholder scoring logic for testing
  const keywords = ["correct", "right", "good"];
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter(word => keywords.includes(word)).length;
  return Math.floor((matches / keywords.length) * 100);
}

// Get exam submissions (admin/tutor/parent only)
router.get("/api/exams/:examId/submissions", async (req, res) => {
  try {
    const user = req.user as SelectUser;
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { examId } = req.params;

    let submissions;
    if (["admin", "tutor"].includes(user.role)) {
      // Get all submissions for the exam
      submissions = await db.query.examSubmissions.findMany({
        where: eq(examSubmissions.examId, parseInt(examId)),
        with: {
          student: true,
        },
        orderBy: [desc(examSubmissions.submittedAt)],
      });
    } else if (user.role === "parent") {
      // Get submissions only for linked students
      const studentIds = await db.query.parentStudentRelations.findMany({
        where: eq(parentStudentRelations.parentId, user.id),
        columns: {
          studentId: true,
        },
      });

      submissions = await db.query.examSubmissions.findMany({
        where: and(
          eq(examSubmissions.examId, parseInt(examId)),
          eq(examSubmissions.studentId, user.id)
        ),
        with: {
          student: true,
        },
        orderBy: [desc(examSubmissions.submittedAt)],
      });
    } else {
      return res.status(403).json({ error: "Not authorized to view submissions" });
    }

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

export default router;