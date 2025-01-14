import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreateMockTestForm } from "@/components/mock-tests/create-mock-test-form";

export default function MockTestsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: mockTests = [] } = useQuery({
    queryKey: ["/api/mock-tests"],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mock Tests</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Mock Test
        </Button>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Mock Test</DialogTitle>
          </DialogHeader>
          <CreateMockTestForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Total Questions</TableHead>
              <TableHead>Duration (mins)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTests.map((test: any) => (
              <TableRow key={test.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{test.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {test.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="capitalize">{test.type.replace('_', ' ')}</TableCell>
                <TableCell>{test.totalQuestions}</TableCell>
                <TableCell>{test.duration}</TableCell>
                <TableCell>
                  <div className={`capitalize inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                    ${test.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {test.isActive ? 'Active' : 'Inactive'}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
