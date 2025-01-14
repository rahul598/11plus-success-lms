import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Pencil, Trash2 } from "lucide-react";

interface Question {
  id: number;
  title: string;
  options: string[];
  type: "Fill in the Blanks" | "Text Only";
  quizName: string;
}

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Title A-Z", value: "title_asc" },
  { label: "Title Z-A", value: "title_desc" },
];

export function QuestionList() {
  const [sortBy, setSortBy] = useState("newest");

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const sortedQuestions = [...questions].sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.id - b.id;
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      default:
        return b.id - a.id; // newest first
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Questions</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import Questions
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question Title</TableHead>
              <TableHead>Options</TableHead>
              <TableHead>Question Type</TableHead>
              <TableHead>Quiz Name</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>{question.title}</TableCell>
                <TableCell>
                  {Array.isArray(question.options) ? (
                    <span className="text-muted-foreground">
                      [{question.options.join(", ")}]
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>{question.type}</TableCell>
                <TableCell>{question.quizName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}