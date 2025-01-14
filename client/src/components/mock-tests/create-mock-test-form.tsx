import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as z from "zod";

const mockTestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  type: z.enum(["subject_specific", "mixed"]),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  totalQuestions: z.number().int().min(1, "Must have at least 1 question"),
  rules: z.object({
    category: z.string().optional(),
    categoryDistribution: z.record(z.number()).optional(),
    subTopicDistribution: z.record(z.record(z.number())).optional(),
    marksDistribution: z.record(z.number()).optional(),
  }),
  scheduledFor: z.date().optional(),
});

interface CreateMockTestFormProps {
  onSuccess?: () => void;
}

export function CreateMockTestForm({ onSuccess }: CreateMockTestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to check available questions count
  const { data: questionStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/questions/stats"],
    queryFn: async () => {
      const response = await fetch("/api/questions/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch question statistics");
      }
      return response.json();
    },
  });

  const form = useForm<z.infer<typeof mockTestSchema>>({
    resolver: zodResolver(mockTestSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "subject_specific",
      duration: 60,
      totalQuestions: 10,
      rules: {
        category: "Mathematics",
        categoryDistribution: {},
        subTopicDistribution: {},
        marksDistribution: {
          easy: 1,
          medium: 2,
          hard: 3,
        },
      },
    },
  });

  // Watch form values for validation
  const selectedCategory = form.watch("rules.category");
  const totalQuestions = form.watch("totalQuestions");
  const testType = form.watch("type");

  // Validate question availability
  const validateQuestionAvailability = () => {
    if (!questionStats) return false;

    if (testType === "subject_specific") {
      const categoryStats = questionStats.byCategory[selectedCategory];
      return categoryStats && categoryStats.total >= totalQuestions;
    }

    return questionStats.total >= totalQuestions;
  };

  const getAvailableQuestionCount = () => {
    if (!questionStats) return 0;

    if (testType === "subject_specific") {
      return questionStats.byCategory[selectedCategory]?.total || 0;
    }

    return questionStats.total;
  };

  const createMockTest = useMutation({
    mutationFn: async (data: z.infer<typeof mockTestSchema>) => {
      const response = await fetch("/api/mock-tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mock-tests"] });
      toast({
        title: "Mock Test Created",
        description: "The mock test has been created successfully.",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof mockTestSchema>) => {
    if (!validateQuestionAvailability()) {
      const available = getAvailableQuestionCount();
      toast({
        title: "Not Enough Questions",
        description: `Only ${available} questions available for the selected criteria. Please reduce the number of questions or add more questions to the question bank.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createMockTest.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStats) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Mock Test Title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Test description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="subject_specific">Subject Specific</SelectItem>
                  <SelectItem value="mixed">Mixed Subjects</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalQuestions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Questions</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Available questions: {getAvailableQuestionCount()}
                  {!validateQuestionAvailability() && (
                    <p className="text-destructive text-sm mt-1">
                      Not enough questions available
                    </p>
                  )}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("type") === "subject_specific" && (
          <FormField
            control={form.control}
            name="rules.category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Non-Verbal Reasoning">Non-Verbal Reasoning</SelectItem>
                    <SelectItem value="Verbal Reasoning">Verbal Reasoning</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting || !validateQuestionAvailability()}
        >
          {isSubmitting ? "Creating..." : "Create Mock Test"}
        </Button>
      </form>
    </Form>
  );
}