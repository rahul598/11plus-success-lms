import { DashboardLayout } from "@/components/dashboard/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilters, type FilterOption } from "@/components/dashboard/search-filters";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  title: string;
  subject: string;
  difficulty: string;
  type: string;
  createdAt: string;
}

const filters: FilterOption[] = [
  {
    id: "subject",
    label: "Subject",
    options: [
      { value: "all", label: "All Subjects" },
      { value: "mathematics", label: "Mathematics" },
      { value: "science", label: "Science" },
      { value: "english", label: "English" },
      { value: "history", label: "History" },
    ],
  },
  {
    id: "difficulty",
    label: "Difficulty",
    options: [
      { value: "all", label: "All Levels" },
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
  },
];

export default function AdminQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    subject: "all",
    difficulty: "all",
  });

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/admin/questions", searchQuery, activeFilters],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const filteredQuestions = questions?.filter((question) => {
    const matchesSearch =
      !searchQuery ||
      question.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      activeFilters.subject === "all" || question.subject === activeFilters.subject;
    const matchesDifficulty =
      activeFilters.difficulty === "all" || question.difficulty === activeFilters.difficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Questions Bank</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Questions</CardTitle>
            <CardDescription>Manage your question bank</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchFilters
              placeholder="Search questions..."
              filters={filters}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />

            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions?.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>{question.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            question.difficulty === "easy"
                              ? "default"
                              : question.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {question.difficulty}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.type}</TableCell>
                      <TableCell>
                        {new Date(question.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
