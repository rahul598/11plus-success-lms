import { useQuery, useMutation } from "@tanstack/react-query";
import { CalendarDays, Plus, Users, Video, Mic, MicOff, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/classes/columns";
import { useEffect, useRef, useState } from "react";
import { webRTCService } from "@/lib/webrtc-service";
import { useToast } from "@/hooks/use-toast";

export default function LiveClasses() {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map());

  const { data: classes, isLoading } = useQuery({
    queryKey: ["live-classes"],
    queryFn: async () => {
      const response = await fetch("/api/classes/live");
      if (!response.ok) throw new Error("Failed to fetch classes");
      return response.json();
    },
  });

  const joinMutation = useMutation({
    mutationFn: async (classId: string) => {
      try {
        const stream = await webRTCService.joinRoom(classId);
        if (localVideoRef.current && stream) {
          localVideoRef.current.srcObject = stream;
        }
        setIsJoined(true);
        return stream;
      } catch (error) {
        console.error("Failed to join class:", error);
        throw error;
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join class. Please check your camera and microphone permissions.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleNewPeerStream = (event: Event) => {
      const { stream, userId } = (event as CustomEvent).detail;

      // Create a new video element for the remote peer
      const videoElement = document.createElement('video');
      videoElement.autoplay = true;
      videoElement.playsInline = true;
      videoElement.srcObject = stream;

      const remoteVideosContainer = document.getElementById('remote-videos');
      if (remoteVideosContainer) {
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'relative w-full max-w-sm';
        videoWrapper.appendChild(videoElement);
        remoteVideosContainer.appendChild(videoWrapper);

        remoteVideosRef.current.set(userId, videoElement);
      }
    };

    window.addEventListener('new-peer-stream', handleNewPeerStream);

    return () => {
      window.removeEventListener('new-peer-stream', handleNewPeerStream);
      if (isJoined) {
        webRTCService.leaveRoom();
        setIsJoined(false);
      }
    };
  }, [isJoined]);

  const toggleAudio = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Live Classes</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Class
          </Button>
        </div>
      </div>

      {isJoined && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Your Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-lg"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleAudio}
                  >
                    {isAudioEnabled ? (
                      <Mic className="h-4 w-4" />
                    ) : (
                      <MicOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={toggleVideo}
                  >
                    {isVideoEnabled ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <VideoOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  id="remote-videos"
                  className="grid grid-cols-2 gap-4"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Classes</TabsTrigger>
          <TabsTrigger value="all">All Classes</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Upcoming Classes
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{classes?.upcoming || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classes?.totalStudents || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recorded Sessions
                </CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {classes?.recordedSessions || 0}
                </div>
              </CardContent>
            </Card>
          </div>
          <DataTable 
            columns={columns} 
            data={classes?.data || []}
            onJoinClass={(classId) => joinMutation.mutate(classId)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}