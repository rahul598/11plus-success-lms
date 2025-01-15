import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

interface Question {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
}

interface QuizQuestion {
  id: number;
  question: Question;
  orderNumber: number;
  marks: number;
}

export default function QuizQuestionsPage() {
  const { id: quizId } = useParams();
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quizQuestions = [], isLoading } = useQuery<QuizQuestion[]>({
    queryKey: ["quiz-questions", quizId],
    queryFn: async () => {
      const response = await fetch(`/api/quizzes/${quizId}/questions`);
      if (!response.ok) throw new Error("Failed to fetch quiz questions");
      return response.json();
    },
  });

  const { data: questionBank = [] } = useQuery<Question[]>({
    queryKey: ["questions"],
    queryFn: async () => {
      const response = await fetch("/api/questions");
      if (!response.ok) throw new Error("Failed to fetch questions");
      return response.json();
    },
    enabled: showQuestionBank,
  });

  const addQuestionsMutation = useMutation({
    mutationFn: async (data: { questionIds: number[]; marks: number[] }) => {
      const response = await fetch(`/api/quizzes/${quizId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add questions");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      setShowQuestionBank(false);
      setSelectedQuestions([]);
      toast({
        title: "Success",
        description: "Questions added successfully",
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

  const removeQuestionMutation = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
      toast({
        title: "Success",
        description: "Question removed successfully",
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

  const reorderQuestionMutation = useMutation({
    mutationFn: async ({
      questionId,
      newOrder,
    }: {
      questionId: number;
      newOrder: number;
    }) => {
      const response = await fetch(
        `/api/quizzes/${quizId}/questions/${questionId}/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber: newOrder }),
        }
      );
      if (!response.ok) throw new Error("Failed to reorder question");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-questions", quizId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddQuestions = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const marks = selectedQuestions.map(
      (id) => parseInt(formData.get(`marks-${id}`) as string) || 1
    );
    addQuestionsMutation.mutate({
      questionIds: selectedQuestions,
      marks,
    });
  };

  const handleMoveQuestion = (questionId: number, direction: "up" | "down") => {
    const currentIndex = quizQuestions.findIndex((qq) => qq.id === questionId);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === quizQuestions.length - 1)
    ) {
      return;
    }

    const newOrder =
      direction === "up"
        ? quizQuestions[currentIndex - 1].orderNumber
        : quizQuestions[currentIndex + 1].orderNumber;

    reorderQuestionMutation.mutate({ questionId, newOrder });
  };

  const handleRemoveQuestion = (questionId: number) => {
    if (window.confirm("Are you sure you want to remove this question?")) {
      removeQuestionMutation.mutate(questionId);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quiz Questions</h1>
          <p className="text-muted-foreground">
            Manage questions for this quiz
          </p>
        </div>
        <Dialog open={showQuestionBank} onOpenChange={setShowQuestionBank}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Questions
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Add Questions from Question Bank</DialogTitle>
              <DialogDescription>
                Select questions to add to your quiz.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddQuestions} className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="w-24">Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionBank.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={(checked) => {
                            setSelectedQuestions((prev) =>
                              checked
                                ? [...prev, question.id]
                                : prev.filter((id) => id !== question.id)
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>{question.category}</TableCell>
                      <TableCell>{question.difficulty}</TableCell>
                      <TableCell>
                        <Input
                          name={`marks-${question.id}`}
                          type="number"
                          min="1"
                          defaultValue="1"
                          disabled={!selectedQuestions.includes(question.id)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="submit"
                disabled={selectedQuestions.length === 0}
                className="w-full"
              >
                Add Selected Questions
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-muted rounded" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="w-24">Marks</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizQuestions.map((quizQuestion, index) => (
              <TableRow key={quizQuestion.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{quizQuestion.question.title}</TableCell>
                <TableCell>{quizQuestion.question.category}</TableCell>
                <TableCell>{quizQuestion.question.difficulty}</TableCell>
                <TableCell>{quizQuestion.marks}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index === 0}
                      onClick={() => handleMoveQuestion(quizQuestion.id, "up")}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={index === quizQuestions.length - 1}
                      onClick={() => handleMoveQuestion(quizQuestion.id, "down")}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveQuestion(quizQuestion.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
