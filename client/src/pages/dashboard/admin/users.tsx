import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const filters: FilterOption[] = [
  {
    id: "role",
    label: "Role",
    options: [
      { value: "all", label: "All Roles" },
      { value: "student", label: "Student" },
      { value: "tutor", label: "Tutor" },
      { value: "parent", label: "Parent" },
      { value: "admin", label: "Admin" },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { value: "all", label: "All Status" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
];

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    role: "all",
    status: "all",
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users", searchQuery, activeFilters],
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const filteredUsers = users?.filter((user) => {
    const matchesSearch =
      !searchQuery ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      activeFilters.role === "all" || user.role === activeFilters.role;
    const matchesStatus =
      activeFilters.status === "all" || user.status === activeFilters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">User Management</h1>
          <Button>Add User</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <SearchFilters
              placeholder="Search users..."
              filters={filters}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : user.status === "inactive"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
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