import { useState } from "react";
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
import { Upload, Search } from "lucide-react";

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
  createdAt: string;
}

export function MediaGrid() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);

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
        throw new Error("Upload failed");
      }

      const newFile = await response.json();
      setFiles((prev) => [...prev, newFile]);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      (selectedCategory === "All" || file.category === selectedCategory) &&
      (searchQuery === "" ||
        file.filename.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <Upload className="mr-2 h-4 w-4" />
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={file.url}
                alt={file.filename}
                className="w-full h-48 object-cover"
              />
              <div className="p-3">
                <p className="text-sm font-medium truncate">{file.filename}</p>
                <p className="text-xs text-muted-foreground">{file.category}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No media files found</p>
        </div>
      )}
    </div>
  );
}
