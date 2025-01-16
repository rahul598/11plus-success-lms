import { DashboardLayout } from "@/components/dashboard/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Plus } from "lucide-react";
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

interface ClassSchedule {
  id: number;
  title: string;
  tutor: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  students: number;
  status: string;
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
    id: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Status" },
      { value: "scheduled", label: "Scheduled" },
      { value: "cancelled", label: "Cancelled" },
      { value: "completed", label: "Completed" },
    ],
  },
];

export default function AdminClassSchedulePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    subject: "all",
    status: "all",
  });

  const { data: schedules, isLoading } = useQuery<ClassSchedule[]>({
    queryKey: ["/api/admin/classes/schedule", searchQuery, activeFilters],
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

  const filteredSchedules = schedules?.filter((schedule) => {
    const matchesSearch =
      !searchQuery ||
      schedule.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.tutor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      activeFilters.subject === "all" || schedule.subject === activeFilters.subject;
    const matchesStatus =
      activeFilters.status === "all" || schedule.status === activeFilters.status;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Class Schedule</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Schedule</CardTitle>
            <CardDescription>Manage class schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchFilters
              placeholder="Search schedules..."
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
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules?.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>{schedule.title}</TableCell>
                      <TableCell>{schedule.tutor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{schedule.subject}</Badge>
                      </TableCell>
                      <TableCell>{schedule.date}</TableCell>
                      <TableCell>{schedule.time}</TableCell>
                      <TableCell>{schedule.duration}</TableCell>
                      <TableCell>{schedule.students}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            schedule.status === "scheduled"
                              ? "default"
                              : schedule.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {schedule.status}
                        </Badge>
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
