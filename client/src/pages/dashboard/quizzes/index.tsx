import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, BookOpen } from "lucide-react";

interface Quiz {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function QuizzesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quizzes = [], isLoading: isLoadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["quizzes"],
    queryFn: async () => {
      const response = await fetch("/api/quizzes");
      if (!response.ok) throw new Error("Failed to fetch quizzes");
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/questions/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: async (quiz: Omit<Quiz, "id" | "createdAt" | "updatedAt">) => {
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });
      if (!response.ok) throw new Error("Failed to create quiz");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateQuizMutation = useMutation({
    mutationFn: async (quiz: Quiz) => {
      const response = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quiz),
      });
      if (!response.ok) throw new Error("Failed to update quiz");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Success",
        description: "Quiz updated successfully",
      });
      setEditingQuiz(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: number) => {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete quiz");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const quiz = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: parseInt(formData.get("categoryId") as string),
      difficulty: formData.get("difficulty") as "easy" | "medium" | "hard",
      timeLimit: parseInt(formData.get("timeLimit") as string),
      passingScore: parseInt(formData.get("passingScore") as string),
      isActive: true,
    };
    createQuizMutation.mutate(quiz);
  };

  const handleUpdateQuiz = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingQuiz) return;

    const formData = new FormData(event.currentTarget);
    const updatedQuiz = {
      ...editingQuiz,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      categoryId: parseInt(formData.get("categoryId") as string),
      difficulty: formData.get("difficulty") as "easy" | "medium" | "hard",
      timeLimit: parseInt(formData.get("timeLimit") as string),
      passingScore: parseInt(formData.get("passingScore") as string),
    };
    updateQuizMutation.mutate(updatedQuiz);
  };

  const handleDeleteQuiz = (quiz: Quiz) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      deleteQuizMutation.mutate(quiz.id);
    }
  };

  const QuizForm = ({ quiz }: { quiz?: Quiz }) => (
    <form onSubmit={quiz ? handleUpdateQuiz : handleCreateQuiz} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          defaultValue={quiz?.title}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          name="description"
          defaultValue={quiz?.description}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select name="categoryId" defaultValue={quiz?.categoryId?.toString()}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select name="difficulty" defaultValue={quiz?.difficulty}>
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
        <Input
          id="timeLimit"
          name="timeLimit"
          type="number"
          min="1"
          defaultValue={quiz?.timeLimit}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passingScore">Passing Score (%)</Label>
        <Input
          id="passingScore"
          name="passingScore"
          type="number"
          min="0"
          max="100"
          defaultValue={quiz?.passingScore}
          required
        />
      </div>
      <Button type="submit" className="w-full">
        {quiz ? "Update Quiz" : "Create Quiz"}
      </Button>
    </form>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Create and manage your quizzes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Quiz</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new quiz.
              </DialogDescription>
            </DialogHeader>
            <QuizForm />
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingQuizzes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                  {categories.find((c) => c.id === quiz.categoryId)?.name} •{" "}
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {quiz.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingQuiz(quiz)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuiz(quiz)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                    className="ml-auto"
                  >
                    <a href={`/dashboard/quizzes/${quiz.id}/questions`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Questions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Quiz</DialogTitle>
            <DialogDescription>
              Update the quiz details below.
            </DialogDescription>
          </DialogHeader>
          {editingQuiz && <QuizForm quiz={editingQuiz} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
