import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type LiveClass = {
  id: number;
  title: string;
  tutorName: string;
  startTime: string;
  duration: number;
  enrolledCount: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
};

export const columns: ColumnDef<LiveClass>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "tutorName",
    header: "Tutor",
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("startTime"));
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "duration",
    header: "Duration (mins)",
  },
  {
    accessorKey: "enrolledCount",
    header: "Enrolled",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className={`capitalize ${
          status === "in_progress" ? "text-green-600" :
          status === "scheduled" ? "text-blue-600" :
          status === "completed" ? "text-gray-600" :
          "text-red-600"
        }`}>
          {status.replace("_", " ")}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const liveClass = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(liveClass.id.toString())}>
              Copy Class ID
            </DropdownMenuItem>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Send Notification</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
