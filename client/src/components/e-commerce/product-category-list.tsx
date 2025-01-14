import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function ProductCategoryList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Product Categories</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      <Card className="p-6">
        <div className="text-muted-foreground">
          Product categories will be shown here.
        </div>
      </Card>
    </div>
  );
}
