import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  tier: z.enum(["basic", "standard", "premium", "enterprise"]),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  price: z.string().min(1, "Price is required"),
  features: z.object({
    mockTests: z.object({
      enabled: z.boolean(),
      limit: z.number(),
    }),
    liveClasses: z.object({
      enabled: z.boolean(),
      limit: z.number(),
    }),
    studyMaterials: z.object({
      enabled: z.boolean(),
      categories: z.array(z.string()),
    }),
    tutorSupport: z.object({
      enabled: z.boolean(),
      hoursPerMonth: z.number(),
    }),
    analysisReports: z.object({
      enabled: z.boolean(),
      detailed: z.boolean(),
    }),
  }),
});

type SubscriptionPlan = {
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
  };
  isActive: boolean;
};

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      tier: "basic",
      duration: 30,
      price: "",
      features: {
        mockTests: { enabled: true, limit: 5 },
        liveClasses: { enabled: false, limit: 0 },
        studyMaterials: { enabled: true, categories: [] },
        tutorSupport: { enabled: false, hoursPerMonth: 0 },
        analysisReports: { enabled: true, detailed: false },
      },
    },
  });

  const { data: plans = [], isLoading, error } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscription-plans");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: z.infer<typeof planSchema>) => {
      const response = await fetch("/api/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({ title: "Plan created successfully" });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating plan",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: z.infer<typeof planSchema>;
    }) => {
      const response = await fetch(`/api/subscription-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({ title: "Plan updated successfully" });
      setIsOpen(false);
      setEditingPlan(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating plan",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const togglePlanStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await fetch(`/api/subscription-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subscription-plans"] });
      toast({ title: "Plan status updated successfully" });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating plan status",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    },
  });

  const onSubmit = async (data: z.infer<typeof planSchema>) => {
    if (editingPlan) {
      await updatePlanMutation.mutateAsync({ id: editingPlan.id, data });
    } else {
      await createPlanMutation.mutateAsync(data);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    form.reset({
      name: plan.name,
      description: plan.description,
      tier: plan.tier,
      duration: plan.duration,
      price: plan.price,
      features: plan.features,
    });
    setIsOpen(true);
  };

  const handleToggleStatus = async (plan: SubscriptionPlan) => {
    await togglePlanStatusMutation.mutateAsync({
      id: plan.id,
      isActive: !plan.isActive,
    });
  };

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
          <Button onClick={() => {
            setEditingPlan(null);
            form.reset();
            setIsOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
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
    return (
      <DashboardShell>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
            <p className="text-muted-foreground">
              Manage subscription plans and their features
            </p>
          </div>
          <Button onClick={() => {
            setEditingPlan(null);
            form.reset();
            setIsOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Plan
          </Button>
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center text-red-500">
            Error loading subscription plans: {error.message}
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
        <Button onClick={() => {
          setEditingPlan(null);
          form.reset();
          setIsOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlan ? "Edit Plan" : "Add New Plan"}
            </DialogTitle>
            <DialogDescription>
              {editingPlan 
                ? "Edit the subscription plan details below."
                : "Create a new subscription plan by filling out the form below."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tier</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">
                {editingPlan ? "Update Plan" : "Create Plan"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No subscription plans found. Click the Add Plan button to create one.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="capitalize">{plan.tier}</TableCell>
                  <TableCell>{plan.duration} days</TableCell>
                  <TableCell>${plan.price}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        plan.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(plan)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleToggleStatus(plan)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
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