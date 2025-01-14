import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  Plus,
  Users,
  MapPin,
  ChevronRight,
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  type: "exam" | "workshop" | "deadline" | "other";
  startTime: string;
  endTime: string | null;
  location: string | null;
  capacity: number | null;
  enrolledCount: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
}

export function EventList() {
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");

  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const eventStart = new Date(event.startTime);
    return filter === "upcoming" ? eventStart >= now : eventStart < now;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Events</h1>
        <div className="flex items-center gap-4">
          <Button onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
          <div className="flex rounded-lg border p-1">
            <Button
              variant={filter === "upcoming" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === "past" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("past")}
            >
              Past
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{event.type}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(event.startTime).toLocaleDateString()}
                      <br />
                      {new Date(event.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {event.location && (
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      {event.location}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    {event.enrolledCount}/{event.capacity || "∞"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`capitalize inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${event.status === 'completed' ? 'bg-green-100 text-green-800' :
                    event.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'}`}>
                    {event.status.replace('_', ' ')}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
