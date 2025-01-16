import { DashboardLayout } from "@/components/dashboard/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Video, Plus } from "lucide-react";
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

interface RecordedClass {
  id: number;
  title: string;
  tutor: string;
  subject: string;
  duration: string;
  views: number;
  uploadedAt: string;
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
];

export default function AdminClassRecordedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    subject: "all",
  });

  const { data: recordedClasses, isLoading } = useQuery<RecordedClass[]>({
    queryKey: ["/api/admin/classes/recorded", searchQuery, activeFilters],
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

  const filteredClasses = recordedClasses?.filter((recordedClass) => {
    const matchesSearch =
      !searchQuery ||
      recordedClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recordedClass.tutor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      activeFilters.subject === "all" || recordedClass.subject === activeFilters.subject;

    return matchesSearch && matchesSubject;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Recorded Classes</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Video
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Recorded Classes</CardTitle>
            <CardDescription>Manage recorded class videos</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchFilters
              placeholder="Search videos..."
              filters={filters}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />

            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses?.map((recordedClass) => (
                    <TableRow key={recordedClass.id}>
                      <TableCell>{recordedClass.title}</TableCell>
                      <TableCell>{recordedClass.tutor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{recordedClass.subject}</Badge>
                      </TableCell>
                      <TableCell>{recordedClass.duration}</TableCell>
                      <TableCell>{recordedClass.views}</TableCell>
                      <TableCell>
                        {new Date(recordedClass.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
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
