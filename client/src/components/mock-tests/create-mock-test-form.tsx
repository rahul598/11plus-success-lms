import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  duration: z.number().int().positive("Duration must be positive"),
  totalQuestions: z.number().int().positive("Total questions must be positive"),
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

  const createMockTest = useMutation({
    mutationFn: async (data: z.infer<typeof mockTestSchema>) => {
      const response = await fetch("/api/mock-tests/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
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
    setIsSubmitting(true);
    try {
      await createMockTest.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Mock Test"}
        </Button>
      </form>
    </Form>
  );
}
