import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload } from "lucide-react";

interface BulkOperationsDialogProps {
  entityType: "users" | "courses" | "questions" | "tutors";
  entityName: string;
}

export function BulkOperationsDialog({
  entityType,
  entityName,
}: BulkOperationsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [operation, setOperation] = useState<"import" | "export">("export");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/${entityType}/export`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to export ${entityName}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${entityType}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `${entityName} data has been exported successfully.`,
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error.message,
      });
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No File Selected",
        description: "Please select a CSV file to import.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`/api/${entityType}/import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      toast({
        title: "Import Successful",
        description: `${data.imported} ${entityName} records have been imported successfully.`,
      });

      // Refresh the data
      queryClient.invalidateQueries({ queryKey: [`/api/${entityType}`] });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Operations</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entityName} Bulk Operations</DialogTitle>
          <DialogDescription>
            Import or export {entityName.toLowerCase()} data in CSV format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={operation} onValueChange={(value: "import" | "export") => setOperation(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="import">Import</SelectItem>
              <SelectItem value="export">Export</SelectItem>
            </SelectContent>
          </Select>

          {operation === "import" ? (
            <div className="space-y-4">
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Button onClick={handleImport} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          ) : (
            <Button onClick={handleExport} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
