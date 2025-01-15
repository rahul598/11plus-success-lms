import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isParent: boolean;
}

interface Tutor {
  id: number;
  name: string;
  subject: string;
  avatar?: string;
}

export default function ParentMessagesPage() {
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const mockTutors: Tutor[] = [
    { id: 1, name: "John Smith", subject: "Mathematics" },
    { id: 2, name: "Sarah Wilson", subject: "English" },
    { id: 3, name: "David Brown", subject: "Science" },
  ];

  const mockMessages: Message[] = [
    {
      id: 1,
      sender: "John Smith",
      content: "Hello! How can I help you today?",
      timestamp: "10:00 AM",
      isParent: false,
    },
    {
      id: 2,
      sender: "You",
      content: "I'd like to discuss my child's progress in mathematics.",
      timestamp: "10:05 AM",
      isParent: true,
    },
  ];

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/parent/messages", selectedTutor?.id],
    enabled: !!selectedTutor,
    queryFn: async () => {
      const response = await fetch(`/api/parent/messages?tutorId=${selectedTutor?.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      return response.json();
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedTutor) return;
    // Here you would typically make an API call to send the message
    console.log("Sending message:", messageInput, "to tutor:", selectedTutor.id);
    setMessageInput("");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Tutors List */}
        <Card>
          <CardHeader>
            <CardTitle>Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockTutors.map((tutor) => (
                <button
                  key={tutor.id}
                  onClick={() => setSelectedTutor(tutor)}
                  className={`w-full p-3 flex items-center space-x-3 rounded-lg transition-colors ${
                    selectedTutor?.id === tutor.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Avatar>
                    <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{tutor.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {tutor.subject}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTutor ? `Chat with ${selectedTutor.name}` : "Select a tutor"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedTutor ? (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {mockMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.isParent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isParent
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="text-sm font-medium">
                            {message.sender}
                          </div>
                          <div>{message.content}</div>
                          <div className="text-xs mt-1 opacity-70">
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Select a tutor to start messaging
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
