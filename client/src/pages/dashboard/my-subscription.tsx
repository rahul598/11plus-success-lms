import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/shell";
import { Crown, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "wouter";

type Subscription = {
  id: number;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  plan: {
    id: number;
    name: string;
    tier: string;
    features: {
      mockTests: { enabled: boolean; limit: number };
      liveClasses: { enabled: boolean; limit: number };
      studyMaterials: { enabled: boolean; categories: string[] };
      tutorSupport: { enabled: boolean; hoursPerMonth: number };
      analysisReports: { enabled: boolean; detailed: boolean };
    };
  };
};

export default function MySubscriptionPage() {
  const { toast } = useToast();
  const [_, navigate] = useRouter();

  const { data: subscription, isLoading, error } = useQuery<Subscription>({
    queryKey: ["/api/subscriptions"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      return data[0]; // Get the first active subscription
    },
  });

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardShell>
    );
  }

  if (error instanceof Error) {
    return (
      <DashboardShell>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Subscription</h1>
          <p className="text-muted-foreground mb-6">
            {error.message}
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (!subscription) {
    return (
      <DashboardShell>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">No Active Subscription</h1>
          <p className="text-muted-foreground mb-6">
            Subscribe to get access to premium features
          </p>
          <Button onClick={() => navigate("/dashboard/subscriptions")}>View Plans</Button>
        </div>
      </DashboardShell>
    );
  }

  const features = subscription.plan.features;

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Crown className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">
            {subscription.plan.name} Plan
          </h1>
          <p className="text-muted-foreground">
            Valid until {new Date(subscription.endDate).toLocaleDateString()}
          </p>
        </div>

        <div className="grid gap-6">
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Mock Tests</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                <span>
                  {features.mockTests.limit === -1
                    ? "Unlimited mock tests"
                    : `${features.mockTests.limit} mock tests per month`}
                </span>
              </div>
            </div>
          </div>

          {features.liveClasses.enabled && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Live Classes</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    {features.liveClasses.limit === -1
                      ? "Unlimited live classes"
                      : `${features.liveClasses.limit} live classes per month`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Study Materials</h2>
            <div className="space-y-2">
              {features.studyMaterials.categories.map((category) => (
                <div key={category} className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span className="capitalize">{category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Features</h2>
            <div className="space-y-2">
              {features.tutorSupport.enabled && (
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    {features.tutorSupport.hoursPerMonth} hours of tutor support
                    per month
                  </span>
                </div>
              )}
              {features.analysisReports.enabled && (
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    {features.analysisReports.detailed
                      ? "Detailed analysis reports"
                      : "Basic analysis reports"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}