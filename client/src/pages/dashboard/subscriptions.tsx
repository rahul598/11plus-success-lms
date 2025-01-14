import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Archive } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/shell";

export default function SubscriptionsPage() {
  const { data: subscriptionPlans, isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscription-plans");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardShell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
          <p className="text-muted-foreground">
            Manage subscription plans and their features
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptionPlans?.map((plan: any) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.name}</TableCell>
                <TableCell className="capitalize">{plan.tier}</TableCell>
                <TableCell>${plan.price}</TableCell>
                <TableCell>{plan.duration} days</TableCell>
                <TableCell>
                  <span className={`capitalize ${plan.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Archive className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}
