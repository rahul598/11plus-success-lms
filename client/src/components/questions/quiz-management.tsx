import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Question } from "@db/schema";

const quizSchema = z.object({
  title: z.string().min(1, "Quiz title is required"),
  description: z.string().optional(),
  categoryId: z.number().min(1, "Category is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  timeLimit: z.number().min(1, "Time limit is required"),
  passingScore: z.number().min(0, "Passing score is required"),
});

type QuizFormData = z.infer<typeof quizSchema>;

interface Quiz {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  createdBy: number;
  createdAt: string;
  lastModified?: string;
}

export function QuizManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: 0,
      difficulty: "medium",
      timeLimit: 60,
      passingScore: 60,
    },
  });

  const { data: quizzes = [], isLoading } = useQuery<Quiz[]>({
    queryKey: ["/api/quizzes"],
    queryFn: async () => {
      const response = await fetch("/api/quizzes");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/questions/categories"],
    queryFn: async () => {
      const response = await fetch("/api/questions/categories");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: QuizFormData) => {
      const response = await fetch("/api/quizzes", {
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
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({ title: "Quiz created successfully" });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating quiz",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: QuizFormData & { id: number }) => {
      const response = await fetch(`/api/quizzes/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({ title: "Quiz updated successfully" });
      setIsOpen(false);
      setEditingQuiz(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating quiz",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (quizId: number) => {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({ title: "Quiz deleted successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting quiz",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });

  const onSubmit = async (data: QuizFormData) => {
    if (editingQuiz) {
      await updateMutation.mutateAsync({ ...data, id: editingQuiz.id });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (quizId: number) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      await deleteMutation.mutateAsync(quizId);
    }
  };

  if (isLoading) {
    return <div>Loading quizzes...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quizzes</h2>
        <Button onClick={() => {
          setEditingQuiz(null);
          form.reset();
          setIsOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Quiz
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingQuiz ? "Edit Quiz" : "Add New Quiz"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
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
                name="passingScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Score (%)</FormLabel>
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
              <Button type="submit">
                {editingQuiz ? "Update" : "Create"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Time Limit</TableHead>
              <TableHead>Passing Score</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!quizzes?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No quizzes found
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell>{quiz.title}</TableCell>
                  <TableCell>
                    {categories?.find((c: any) => c.id === quiz.categoryId)?.name}
                  </TableCell>
                  <TableCell className="capitalize">{quiz.difficulty}</TableCell>
                  <TableCell>{quiz.timeLimit} minutes</TableCell>
                  <TableCell>{quiz.passingScore}%</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingQuiz(quiz);
                        form.reset({
                          title: quiz.title,
                          description: quiz.description,
                          categoryId: quiz.categoryId,
                          difficulty: quiz.difficulty,
                          timeLimit: quiz.timeLimit,
                          passingScore: quiz.passingScore,
                        });
                        setIsOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a href={`/quizzes/${quiz.id}`}>
                        <Eye className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}