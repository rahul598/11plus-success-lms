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
import { useToast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  tier: "basic" | "standard" | "premium" | "enterprise";
  duration: number;
  price: string;
  features: {
    mockTests: { enabled: boolean; limit: number };
    liveClasses: { enabled: boolean; limit: number };
    studyMaterials: { enabled: boolean; categories: string[] };
    tutorSupport: { enabled: boolean; hoursPerMonth: number };
    analysisReports: { enabled: boolean; detailed: boolean };
    downloadAccess: { enabled: boolean; formats: string[] };
    customization: { enabled: boolean; features: string[] };
  };
  isActive: boolean;
}

export default function SubscriptionsPage() {
  const { toast } = useToast();

  const { data: plans, isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscription-plans");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
            <p className="text-muted-foreground">
              Manage subscription plans and their features
            </p>
          </div>
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">
            Loading subscription plans...
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (error instanceof Error) {
    toast({
      variant: "destructive",
      title: "Error loading subscription plans",
      description: error.message
    });

    return (
      <DashboardShell>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
            <p className="text-muted-foreground">
              Manage subscription plans and their features
            </p>
          </div>
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center text-red-500">
            Failed to load subscription plans. Please try again later.
          </div>
        </div>
      </DashboardShell>
    );
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
            {!plans?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No subscription plans found
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
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
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardShell>
  );
}