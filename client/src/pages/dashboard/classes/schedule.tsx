import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

const scheduleClassSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startTime: z.string(),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  maxParticipants: z.number().min(1, "Must allow at least 1 participant"),
});

type ScheduleClassInput = z.infer<typeof scheduleClassSchema>;

export default function ClassSchedule() {
  const [isScheduling, setIsScheduling] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<ScheduleClassInput>({
    resolver: zodResolver(scheduleClassSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      duration: 60,
      maxParticipants: 30,
    },
  });

  const { data: scheduledClasses, isLoading } = useQuery({
    queryKey: ["scheduled-classes"],
    queryFn: async () => {
      const response = await fetch("/api/classes/schedule");
      if (!response.ok) throw new Error("Failed to fetch scheduled classes");
      return response.json();
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleClassInput) => {
      const response = await fetch("/api/classes/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to schedule class");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-classes"] });
      setIsScheduling(false);
      toast({
        title: "Success",
        description: "Class has been scheduled successfully",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ScheduleClassInput) {
    scheduleMutation.mutate(data);
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Class Schedule</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule a New Class</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <label>Title</label>
                    <Input {...form.register("title")} />
                    {form.formState.errors.title && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.title.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label>Description</label>
                    <Input {...form.register("description")} />
                    {form.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label>Start Time</label>
                    <Input type="datetime-local" {...form.register("startTime")} />
                    {form.formState.errors.startTime && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.startTime.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label>Duration (minutes)</label>
                    <Input 
                      type="number" 
                      {...form.register("duration", { valueAsNumber: true })} 
                    />
                    {form.formState.errors.duration && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.duration.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label>Max Participants</label>
                    <Input 
                      type="number" 
                      {...form.register("maxParticipants", { valueAsNumber: true })} 
                    />
                    {form.formState.errors.maxParticipants && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.maxParticipants.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Schedule Class
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
            <p className="mt-2 text-lg">Loading scheduled classes...</p>
          </div>
        ) : scheduledClasses?.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No classes scheduled</h3>
            <p className="text-muted-foreground">
              Get started by scheduling your first class.
            </p>
          </div>
        ) : (
          scheduledClasses?.map((classItem: any) => (
            <Card key={classItem.id}>
              <CardHeader>
                <CardTitle>{classItem.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {classItem.description}
                </p>
                <div className="flex justify-between text-sm">
                  <span>Start: {new Date(classItem.startTime).toLocaleString()}</span>
                  <span>Duration: {classItem.duration} minutes</span>
                  <span>Participants: {classItem.enrolledCount}/{classItem.maxParticipants}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
