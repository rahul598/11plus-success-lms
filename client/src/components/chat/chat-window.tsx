import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, UserPlus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  message: string;
  from: string;
  to?: string;
  timestamp: string;
}

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const { user } = useUser();

  useEffect(() => {
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    if (user) {
      newSocket.emit("authenticate", user);
    }

    newSocket.on("chatMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("notification", (data) => {
      // Handle notifications if needed
      console.log("Notification:", data);
    });

    return () => {
      newSocket.close();
    };
  }, [user]);

  const sendMessage = () => {
    if (inputMessage.trim() && socket) {
      socket.emit("sendMessage", inputMessage, selectedUser || undefined);
      setInputMessage("");
    }
  };

  const isPrivateMessage = (msg: Message) => 
    msg.to && (msg.to === user?.id.toString() || msg.from === user?.username);

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <h3 className="font-semibold">Chat</h3>
          {selectedUser && <span className="text-xs text-muted-foreground">(Private)</span>}
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Everyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Everyone</SelectItem>
              {/* Add online users here */}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-52">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${
                  msg.from === user?.username ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] ${
                    msg.from === user?.username
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  } ${isPrivateMessage(msg) ? "border-2 border-primary/20" : ""}`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {msg.from} • {new Date(msg.timestamp).toLocaleTimeString()}
                  {isPrivateMessage(msg) && 
                    <span className="ml-1">(Private)</span>
                  }
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex w-full gap-2"
        >
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${selectedUser ? 'privately' : 'everyone'}...`}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}