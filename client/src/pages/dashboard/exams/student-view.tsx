import { useQuery } from "@tanstack/react-query";
import { Calendar, FileText, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentExamView() {
  const { data: exams, isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
      const response = await fetch("/api/exams");
      if (!response.ok) throw new Error("Failed to fetch exams");
      return response.json();
    },
  });

  const { data: performance } = useQuery({
    queryKey: ["performance"],
    queryFn: async () => {
      const response = await fetch("/api/student/performance");
      if (!response.ok) throw new Error("Failed to fetch performance data");
      return response.json();
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Exams</h2>
      </div>

      {performance && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.averageScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.completedExams}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-lg">Loading exams...</p>
          </div>
        ) : exams?.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No exams available</h3>
            <p className="text-muted-foreground">
              You don't have any exams scheduled at this time.
            </p>
          </div>
        ) : (
          exams?.map((exam: any) => (
            <Card key={exam.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={
                      exam.submissions?.[0]?.status === "graded" ? "secondary" :
                      exam.submissions?.length > 0 ? "outline" : "default"
                    }
                  >
                    {exam.submissions?.[0]?.status === "graded" ? "Graded" :
                     exam.submissions?.length > 0 ? "Submitted" : "Upcoming"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Scheduled for: {new Date(exam.scheduledDate).toLocaleString()}</span>
                    <span>Duration: {exam.duration} minutes</span>
                  </div>
                  {exam.submissions?.[0]?.status === "graded" && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Results</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-lg font-bold">{exam.submissions[0].score}%</p>
                        </div>
                        <div className="bg-secondary p-3 rounded-lg">
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="text-lg font-bold">
                            {new Date(exam.submissions[0].submissionTime).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View Exam
                </Button>
                {exam.submissions?.[0]?.status === "graded" && (
                  <Button variant="outline" size="sm">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    View Analysis
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
