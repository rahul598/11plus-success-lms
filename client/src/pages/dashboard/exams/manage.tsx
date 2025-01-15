import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus, Upload, FilePdf, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const uploadExamSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  file: z.any(),
});

const scheduleExamSchema = z.object({
  examPdfId: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  scheduledDate: z.string(),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  targetAge: z.number().min(5, "Target age must be at least 5"),
});

type UploadExamInput = z.infer<typeof uploadExamSchema>;
type ScheduleExamInput = z.infer<typeof scheduleExamSchema>;

export default function ManageExams() {
  const [isUploading, setIsUploading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadForm = useForm<UploadExamInput>({
    resolver: zodResolver(uploadExamSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const scheduleForm = useForm<ScheduleExamInput>({
    resolver: zodResolver(scheduleExamSchema),
    defaultValues: {
      title: "",
      description: "",
      scheduledDate: "",
      duration: 60,
      targetAge: 5,
    },
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const response = await fetch("/api/exams");
      if (!response.ok) throw new Error("Failed to fetch exams");
      return response.json();
    },
  });

  const { data: examPdfs } = useQuery({
    queryKey: ["exam-pdfs"],
    queryFn: async () => {
      const response = await fetch("/api/exams/pdfs");
      if (!response.ok) throw new Error("Failed to fetch exam PDFs");
      return response.json();
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadExamInput) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("file", data.file);

      const response = await fetch("/api/exams/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to upload exam");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-pdfs"] });
      setIsUploading(false);
      toast({
        title: "Success",
        description: "Exam PDF has been uploaded successfully",
      });
      uploadForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleExamInput) => {
      const response = await fetch("/api/exams/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to schedule exam");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setIsScheduling(false);
      toast({
        title: "Success",
        description: "Exam has been scheduled successfully",
      });
      scheduleForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onUpload(data: UploadExamInput) {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate({ ...data, file });
  }

  function onSchedule(data: ScheduleExamInput) {
    if (!selectedPdf) {
      toast({
        title: "Error",
        description: "Please select an exam PDF",
        variant: "destructive",
      });
      return;
    }
    scheduleMutation.mutate({ ...data, examPdfId: selectedPdf });
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manage Exams</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isUploading} onOpenChange={setIsUploading}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Exam PDF
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Exam PDF</DialogTitle>
                <DialogDescription>
                  Upload a PDF file containing the exam questions for 5-year-old students.
                </DialogDescription>
              </DialogHeader>
              <Form {...uploadForm}>
                <form onSubmit={uploadForm.handleSubmit(onUpload)} className="space-y-4">
                  <div className="space-y-2">
                    <label>Title</label>
                    <Input {...uploadForm.register("title")} />
                    {uploadForm.formState.errors.title && (
                      <p className="text-sm text-red-500">
                        {uploadForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Description</label>
                    <Textarea {...uploadForm.register("description")} />
                    {uploadForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {uploadForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>PDF File</label>
                    <Input type="file" accept=".pdf" />
                  </div>

                  <Button type="submit" className="w-full">
                    Upload
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule Exam</DialogTitle>
                <DialogDescription>
                  Schedule an exam by selecting a PDF and setting the date and time.
                </DialogDescription>
              </DialogHeader>
              <Form {...scheduleForm}>
                <form onSubmit={scheduleForm.handleSubmit(onSchedule)} className="space-y-4">
                  <div className="space-y-2">
                    <label>Select Exam PDF</label>
                    <Select onValueChange={(value) => setSelectedPdf(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an exam PDF" />
                      </SelectTrigger>
                      <SelectContent>
                        {examPdfs?.map((pdf: any) => (
                          <SelectItem key={pdf.id} value={pdf.id.toString()}>
                            {pdf.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label>Title</label>
                    <Input {...scheduleForm.register("title")} />
                    {scheduleForm.formState.errors.title && (
                      <p className="text-sm text-red-500">
                        {scheduleForm.formState.errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Description</label>
                    <Textarea {...scheduleForm.register("description")} />
                    {scheduleForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {scheduleForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Scheduled Date</label>
                    <Input
                      type="datetime-local"
                      {...scheduleForm.register("scheduledDate")}
                    />
                    {scheduleForm.formState.errors.scheduledDate && (
                      <p className="text-sm text-red-500">
                        {scheduleForm.formState.errors.scheduledDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Duration (minutes)</label>
                    <Input
                      type="number"
                      {...scheduleForm.register("duration", { valueAsNumber: true })}
                    />
                    {scheduleForm.formState.errors.duration && (
                      <p className="text-sm text-red-500">
                        {scheduleForm.formState.errors.duration.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label>Target Age</label>
                    <Input
                      type="number"
                      {...scheduleForm.register("targetAge", { valueAsNumber: true })}
                    />
                    {scheduleForm.formState.errors.targetAge && (
                      <p className="text-sm text-red-500">
                        {scheduleForm.formState.errors.targetAge.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Schedule Exam
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-lg">Loading exams...</p>
          </div>
        ) : exams?.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No exams found</h3>
            <p className="text-muted-foreground">
              Start by uploading an exam PDF and scheduling it.
            </p>
          </div>
        ) : (
          exams?.map((exam: any) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </div>
                  <Badge variant={exam.status === 'scheduled' ? 'default' : 'secondary'}>
                    {exam.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scheduled for: {new Date(exam.scheduledDate).toLocaleString()}</span>
                    <span>Duration: {exam.duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Target Age: {exam.targetAge} years</span>
                    <span>Submissions: {exam.submissions?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <FilePdf className="mr-2 h-4 w-4" />
                  View PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  View Submissions
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}