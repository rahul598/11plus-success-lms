import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Upload, FileText, Check, AlertCircle } from "lucide-react";
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

const submitExamSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  file: z.any(),
});

type SubmitExamInput = z.infer<typeof submitExamSchema>;

export default function ParentExamView() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const submitForm = useForm<SubmitExamInput>({
    resolver: zodResolver(submitExamSchema),
  });

  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const response = await fetch("/api/exams");
      if (!response.ok) throw new Error("Failed to fetch exams");
      return response.json();
    },
  });

  const { data: students } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await fetch("/api/parent/students");
      if (!response.ok) throw new Error("Failed to fetch students");
      return response.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: SubmitExamInput }) => {
      const formData = new FormData();
      formData.append("studentId", data.studentId);
      formData.append("file", data.file);

      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to submit exam");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setIsSubmitting(false);
      toast({
        title: "Success",
        description: "Exam has been submitted successfully",
      });
      submitForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: SubmitExamInput) {
    if (!selectedExam) {
      toast({
        title: "Error",
        description: "Please select an exam to submit",
        variant: "destructive",
      });
      return;
    }

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

    submitMutation.mutate({ examId: selectedExam, data: { ...data, file } });
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Student Exams</h2>
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
            <h3 className="mt-2 text-lg font-semibold">No exams available</h3>
            <p className="text-muted-foreground">
              There are no exams scheduled for your students at this time.
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
                  <Badge variant={exam.isSubmitted ? "secondary" : "default"}>
                    {exam.isSubmitted ? "Submitted" : "Pending"}
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
                    {exam.score && <span>Score: {exam.score}%</span>}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                {!exam.isSubmitted && (
                  <Dialog open={isSubmitting && selectedExam === exam.id} onOpenChange={(open) => {
                    setIsSubmitting(open);
                    setSelectedExam(open ? exam.id : null);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Submit Exam
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit Exam</DialogTitle>
                        <DialogDescription>
                          Upload a scanned copy of the completed exam paper.
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...submitForm}>
                        <form onSubmit={submitForm.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="space-y-2">
                            <label>Select Student</label>
                            <Select onValueChange={(value) => submitForm.setValue("studentId", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a student" />
                              </SelectTrigger>
                              <SelectContent>
                                {students?.map((student: any) => (
                                  <SelectItem key={student.id} value={student.id.toString()}>
                                    {student.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {submitForm.formState.errors.studentId && (
                              <p className="text-sm text-red-500">
                                {submitForm.formState.errors.studentId.message}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label>Scanned Exam Paper</label>
                            <Input type="file" accept="image/*,.pdf" />
                          </div>

                          <Button type="submit" className="w-full">
                            Upload and Submit
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
