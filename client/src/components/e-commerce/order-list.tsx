import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function OrderList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <Button variant="outline">
          Export Orders
        </Button>
      </div>
      <Card className="p-6">
        <div className="text-muted-foreground">
          Order list will be shown here.
        </div>
      </Card>
    </div>
  );
}
