import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SelectQuestion } from "@db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function Questions() {
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: questions = [] } = useQuery<SelectQuestion[]>({
    queryKey: ["/api/questions"],
  });

  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = question.title.toLowerCase().includes(search.toLowerCase()) ||
      question.content.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || question.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Questions</h1>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuestions.map((question) => (
              <TableRow key={question.id}>
                <TableCell>{question.title}</TableCell>
                <TableCell>{question.category}</TableCell>
                <TableCell>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {question.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(question.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
