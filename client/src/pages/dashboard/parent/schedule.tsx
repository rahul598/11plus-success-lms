import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, Clock, BookOpen, GraduationCap } from "lucide-react";
import { format } from "date-fns";

export default function ParentSchedulePage() {
  const { data: scheduleData, isLoading } = useQuery({
    queryKey: ["/api/parent/schedule"],
    queryFn: async () => {
      const response = await fetch("/api/parent/schedule");
      if (!response.ok) {
        throw new Error("Failed to fetch schedule data");
      }
      return response.json();
    },
  });

  const mockUpcomingEvents = [
    {
      id: 1,
      title: "Math Mock Test",
      date: "2025-01-20",
      type: "test",
      subject: "Mathematics",
      duration: "2 hours"
    },
    {
      id: 2,
      title: "English Comprehension",
      date: "2025-01-22",
      type: "class",
      subject: "English",
      duration: "1 hour"
    },
    {
      id: 3,
      title: "Science Quiz",
      date: "2025-01-25",
      type: "quiz",
      subject: "Science",
      duration: "30 minutes"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Academic Schedule</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockUpcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start space-x-4 p-4 rounded-lg border"
                >
                  <div className="p-2 rounded-full bg-primary/10">
                    {event.type === 'test' && <BookOpen className="h-5 w-5 text-primary" />}
                    {event.type === 'class' && <GraduationCap className="h-5 w-5 text-primary" />}
                    {event.type === 'quiz' && <Clock className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.date), 'PPP')}
                    </p>
                    <div className="mt-1 flex items-center text-sm text-muted-foreground">
                      <span className="mr-2">{event.subject}</span>
                      <span>•</span>
                      <span className="ml-2">{event.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
