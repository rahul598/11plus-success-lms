import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/shell";
import { Check, Crown } from "lucide-react";

export default function MySubscriptionPage() {
  const { subscription, tier, hasFeature } = useSubscription();

  if (!subscription) {
    return (
      <DashboardShell>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">No Active Subscription</h1>
          <p className="text-muted-foreground mb-6">
            Subscribe to get access to premium features
          </p>
          <Button>View Plans</Button>
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
            Your {subscription.plan.name}
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

          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Study Materials</h2>
            <div className="space-y-2">
              {features.studyMaterials.categories.map((category: string) => (
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
              {features.downloadAccess.enabled && (
                <div className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                  <span>
                    Download access ({features.downloadAccess.formats.join(", ")})
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
