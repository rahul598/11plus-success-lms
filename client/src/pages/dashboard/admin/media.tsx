import { DashboardLayout } from "@/components/dashboard/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Image, FileVideo, FileAudio, File, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchFilters, type FilterOption } from "@/components/dashboard/search-filters";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface MediaFile {
  id: number;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

const filters: FilterOption[] = [
  {
    id: "type",
    label: "File Type",
    options: [
      { value: "all", label: "All Types" },
      { value: "image", label: "Images" },
      { value: "video", label: "Videos" },
      { value: "audio", label: "Audio" },
      { value: "document", label: "Documents" },
    ],
  },
];

export default function AdminMediaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
    type: "all",
  });

  const { data: mediaFiles, isLoading } = useQuery<MediaFile[]>({
    queryKey: ["/api/admin/media", searchQuery, activeFilters],
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-4 w-4" />;
      case "video":
        return <FileVideo className="h-4 w-4" />;
      case "audio":
        return <FileAudio className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const filteredFiles = mediaFiles?.filter((file) => {
    const matchesSearch =
      !searchQuery ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      activeFilters.type === "all" || file.type === activeFilters.type;

    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Files</CardTitle>
            <CardDescription>Manage your media files</CardDescription>
          </CardHeader>
          <CardContent>
            <SearchFilters
              placeholder="Search files..."
              filters={filters}
              onSearch={handleSearch}
              onFilterChange={handleFilterChange}
            />

            <div className="rounded-md border mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles?.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="flex items-center gap-2">
                        {getFileIcon(file.type)}
                        <span>{file.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{file.type}</Badge>
                      </TableCell>
                      <TableCell>{file.size}</TableCell>
                      <TableCell>{file.uploadedBy}</TableCell>
                      <TableCell>
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
