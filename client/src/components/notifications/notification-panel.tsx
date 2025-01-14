import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/hooks/use-user";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell } from "lucide-react";

interface Notification {
  message: string;
  type: string;
  timestamp: string;
}

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUser();

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    if (user) {
      newSocket.emit("authenticate", user);
    }

    newSocket.on("notification", (notification) => {
      setNotifications((prev) => [
        {
          ...notification,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-lg border p-4"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center text-muted-foreground">
                No notifications yet
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
