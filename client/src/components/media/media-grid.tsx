import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Search, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SUBJECT_CATEGORIES = [
  "Mathematics",
  "Science",
  "Chemistry",
  "Reasoning",
  "All"
];

interface MediaFile {
  id: number;
  url: string;
  filename: string;
  category: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export function MediaGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["media-files"],
    queryFn: async () => {
      const response = await fetch("/api/media");
      if (!response.ok) throw new Error("Failed to fetch media files");
      return response.json();
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/media/${fileId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete media file");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({
        title: "Media deleted",
        description: "The media file has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", selectedCategory === "All" ? "Mathematics" : selectedCategory);

    setUploading(true);
    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const newFile = await response.json();
      queryClient.invalidateQueries({ queryKey: ["media-files"] });
      toast({
        title: "Upload successful",
        description: "The media file has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDeleteMedia = (fileId: number) => {
    if (window.confirm("Are you sure you want to delete this media file?")) {
      deleteMediaMutation.mutate(fileId);
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      (selectedCategory === "All" || file.category === selectedCategory) &&
      (searchQuery === "" ||
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Media Library</h2>
        <Button disabled={uploading}>
          <Input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center cursor-pointer"
          >
            {uploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {uploading ? "Uploading..." : "Upload Image"}
          </label>
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={file.url}
                    alt={file.filename}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMedia(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-muted-foreground">{file.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-semibold">No media files found</h3>
          <p className="text-muted-foreground">
            Upload your first image to get started.
          </p>
        </div>
      )}
    </div>
  );
}