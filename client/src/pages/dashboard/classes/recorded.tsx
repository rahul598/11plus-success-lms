import { useQuery } from "@tanstack/react-query";
import { Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecordedVideo {
  id: number;
  title: string;
  description: string;
  tutorId: number;
  courseId: number;
  videoUrl: string;
  duration: number;
  thumbnail: string;
  viewCount: number;
  createdAt: string;
}

export default function RecordedVideos() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["recorded-videos"],
    queryFn: async () => {
      const response = await fetch("/api/classes/recorded");
      if (!response.ok) throw new Error("Failed to fetch videos");
      return response.json();
    },
  });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Recorded Videos</h2>
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          videos?.map((video: RecordedVideo) => (
            <Card key={video.id}>
              <CardHeader className="relative">
                {video.thumbnail ? (
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="aspect-video w-full rounded-t-lg object-cover"
                  />
                ) : (
                  <div className="aspect-video w-full rounded-t-lg bg-muted flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <CardTitle className="line-clamp-1">{video.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {video.description}
                </CardDescription>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')} mins
                  </div>
                  <div>{video.viewCount} views</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {videos?.length === 0 && (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No videos uploaded</h3>
          <p className="text-muted-foreground">
            Get started by uploading your first video.
          </p>
        </div>
      )}
    </div>
  );
}
