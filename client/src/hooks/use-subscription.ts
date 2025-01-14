import { useQuery } from "@tanstack/react-query";

export interface SubscriptionFeatures {
  mockTests: {
    enabled: boolean;
    limit: number;
  };
  liveClasses: {
    enabled: boolean;
    limit: number;
  };
  studyMaterials: {
    enabled: boolean;
    categories: string[];
  };
  tutorSupport: {
    enabled: boolean;
    hoursPerMonth: number;
  };
  analysisReports: {
    enabled: boolean;
    detailed: boolean;
  };
  downloadAccess: {
    enabled: boolean;
    formats: string[];
  };
  customization: {
    enabled: boolean;
    features: string[];
  };
}

interface Subscription {
  subscription: {
    id: number;
    startDate: string;
    endDate: string;
    status: "active" | "expired" | "cancelled";
  };
  plan: {
    id: number;
    name: string;
    tier: "basic" | "standard" | "premium" | "enterprise";
    features: SubscriptionFeatures;
  };
}

export function useSubscription() {
  const { data: activeSubscription, isLoading } = useQuery<Subscription>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions");
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch subscription");
      }
      const subscriptions = await response.json();
      return subscriptions[0] || null; // Get the first active subscription
    },
  });

  const hasFeature = (feature: keyof SubscriptionFeatures) => {
    if (!activeSubscription) return false;
    return activeSubscription.plan.features[feature]?.enabled || false;
  };

  const getFeatureLimit = (feature: keyof SubscriptionFeatures) => {
    if (!activeSubscription) return 0;
    return (activeSubscription.plan.features[feature] as any)?.limit || 0;
  };

  return {
    subscription: activeSubscription,
    isLoading,
    hasFeature,
    getFeatureLimit,
    tier: activeSubscription?.plan.tier || "basic",
  };
}
