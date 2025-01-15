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
import { Plus, Calendar, FileText, Users, BarChart } from "lucide-react";
import { format } from "date-fns";

interface MockTest {
  id: number;
  title: string;
  description: string;
  type: "subject_specific" | "mixed";
  duration: number;
  totalQuestions: number;
  scheduledFor: string;
  isActive: boolean;
  createdAt: string;
}

export default function MockTestsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mockTests = [], isLoading } = useQuery<MockTest[]>({
    queryKey: ["mock-tests"],
    queryFn: async () => {
      const response = await fetch("/api/mock-tests");
      if (!response.ok) throw new Error("Failed to fetch mock tests");
      return response.json();
    },
  });

  const createMockTestMutation = useMutation({
    mutationFn: async (mockTest: Omit<MockTest, "id" | "createdAt">) => {
      const response = await fetch("/api/mock-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockTest),
      });
      if (!response.ok) throw new Error("Failed to create mock test");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mock-tests"] });
      toast({
        title: "Success",
        description: "Mock test created successfully",
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

  const handleCreateMockTest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const mockTest = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as "subject_specific" | "mixed",
      duration: parseInt(formData.get("duration") as string),
      totalQuestions: parseInt(formData.get("totalQuestions") as string),
      scheduledFor: formData.get("scheduledFor") as string,
      isActive: true,
    };
    createMockTestMutation.mutate(mockTest);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mock Tests</h1>
          <p className="text-muted-foreground">
            Create and manage mock tests
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Mock Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Mock Test</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new mock test.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateMockTest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subject_specific">Subject Specific</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalQuestions">Total Questions</Label>
                <Input
                  id="totalQuestions"
                  name="totalQuestions"
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledFor">Scheduled For</Label>
                <Input
                  id="scheduledFor"
                  name="scheduledFor"
                  type="datetime-local"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Create Mock Test
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
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
          {mockTests.map((test) => (
            <Card key={test.id}>
              <CardHeader>
                <CardTitle>{test.title}</CardTitle>
                <CardDescription>
                  {test.type.charAt(0).toUpperCase() + test.type.slice(1)} • {test.duration} minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {test.description}
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(test.scheduledFor), "PPp")}
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {test.totalQuestions} questions
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/dashboard/mock-tests/${test.id}/questions`}>
                      <FileText className="h-4 w-4 mr-2" />
                      Questions
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/dashboard/mock-tests/${test.id}/participants`}>
                      <Users className="h-4 w-4 mr-2" />
                      Participants
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/dashboard/mock-tests/${test.id}/results`}>
                      <BarChart className="h-4 w-4 mr-2" />
                      Results
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
