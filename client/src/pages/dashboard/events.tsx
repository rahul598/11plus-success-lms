import { useState } from "react";
import { EventList } from "@/components/events/event-list";
import { EventForm } from "@/components/events/event-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function EventsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <EventForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>

        <EventList />
      </Dialog>
    </div>
  );
}
