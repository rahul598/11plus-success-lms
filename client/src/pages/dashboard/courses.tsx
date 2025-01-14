import { useQuery } from "@tanstack/react-query";
import { SelectCourse } from "@db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkOperationsDialog } from "@/components/bulk-operations/bulk-operations-dialog";

export default function Courses() {
  const { data: courses = [] } = useQuery<SelectCourse[]>({
    queryKey: ["/api/courses"],
  });

  const publishedCourses = courses.filter((course) => course.published);
  const totalRevenue = courses.reduce((sum, course) => sum + Number(course.price), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <BulkOperationsDialog entityType="courses" entityName="Courses" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{courses.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Published Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedCourses.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell>{course.title}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {course.description}
                </TableCell>
                <TableCell>${Number(course.price).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      course.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {course.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}