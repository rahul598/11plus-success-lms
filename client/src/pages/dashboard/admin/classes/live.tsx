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

interface LiveClass {
  id: number;
  title: string;
  tutor: string;
  subject: string;
  status: string;
  scheduledFor: string;
  students: number;
}

const filters: FilterOption[] = [
  {
    id: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Status" },
      { value: "scheduled", label: "Scheduled" },
      { value: "live", label: "Live Now" },
      { value: "completed", label: "Completed" },
    ],
  },
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

export default function AdminClassLivePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    status: "all",
    subject: "all",
  });

  const { data: liveClasses, isLoading } = useQuery<LiveClass[]>({
    queryKey: ["/api/admin/classes/live", searchQuery, activeFilters],
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

  const filteredClasses = liveClasses?.filter((liveClass) => {
    const matchesSearch =
      !searchQuery ||
      liveClass.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      liveClass.tutor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      activeFilters.status === "all" || liveClass.status === activeFilters.status;
    const matchesSubject =
      activeFilters.subject === "all" || liveClass.subject === activeFilters.subject;

    return matchesSearch && matchesStatus && matchesSubject;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Live Classes</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Class
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Classes</CardTitle>
            <CardDescription>Manage live class sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchFilters
              placeholder="Search classes..."
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
                    <TableHead>Status</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses?.map((liveClass) => (
                    <TableRow key={liveClass.id}>
                      <TableCell>{liveClass.title}</TableCell>
                      <TableCell>{liveClass.tutor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{liveClass.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            liveClass.status === "live"
                              ? "default"
                              : liveClass.status === "scheduled"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {liveClass.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(liveClass.scheduledFor).toLocaleString()}
                      </TableCell>
                      <TableCell>{liveClass.students}</TableCell>
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
