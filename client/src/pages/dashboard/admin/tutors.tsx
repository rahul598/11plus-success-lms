import { DashboardLayout } from "@/components/dashboard/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Clock, BookOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Tutor {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
  rating: number;
  students: number;
  joinedAt: string;
}

interface TutorStats {
  activeTutors: number;
  totalHours: number;
  totalClasses: number;
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
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending Approval" },
    ],
  },
];

export default function AdminTutorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    subject: "all",
    status: "all",
  });

  const { data: stats } = useQuery<TutorStats>({
    queryKey: ["/api/admin/tutors/stats"],
  });

  const { data: tutors, isLoading } = useQuery<Tutor[]>({
    queryKey: ["/api/admin/tutors", searchQuery, activeFilters],
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

  const filteredTutors = tutors?.filter((tutor) => {
    const matchesSearch =
      !searchQuery ||
      tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      activeFilters.subject === "all" || tutor.subject === activeFilters.subject;
    const matchesStatus =
      activeFilters.status === "all" || tutor.status === activeFilters.status;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Tutors</h2>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Tutor
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.activeTutors || 0}</div>
                  <p className="text-xs text-muted-foreground">Currently teaching</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalHours || 0}</div>
                  <p className="text-xs text-muted-foreground">Teaching hours completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
                  <p className="text-xs text-muted-foreground">Classes conducted</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Tutors</CardTitle>
                <CardDescription>Manage your tutors and their assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilters
                  placeholder="Search tutors..."
                  filters={filters}
                  onSearch={handleSearch}
                  onFilterChange={handleFilterChange}
                />

                <div className="rounded-md border mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTutors?.map((tutor) => (
                        <TableRow key={tutor.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{tutor.name}</p>
                              <p className="text-sm text-muted-foreground">{tutor.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tutor.subject}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tutor.status === "active"
                                  ? "default"
                                  : tutor.status === "inactive"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {tutor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{tutor.rating}/5</TableCell>
                          <TableCell>{tutor.students}</TableCell>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}