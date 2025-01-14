import { useQuery } from "@tanstack/react-query";
import { SelectTutor } from "@db/schema";
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

export default function Tutors() {
  const { data: tutors = [] } = useQuery<SelectTutor[]>({
    queryKey: ["/api/tutors"],
  });

  const activeTutors = tutors.filter((tutor) => tutor.available);
  const averageRate = tutors.reduce((sum, tutor) => sum + Number(tutor.hourlyRate), 0) / tutors.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tutors</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tutors.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeTutors.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Hourly Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${averageRate.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Hourly Rate</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tutors.map((tutor) => (
              <TableRow key={tutor.id}>
                <TableCell>{tutor.id}</TableCell>
                <TableCell>{tutor.userId}</TableCell>
                <TableCell>{tutor.specialization}</TableCell>
                <TableCell>${Number(tutor.hourlyRate).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      tutor.available
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {tutor.available ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
