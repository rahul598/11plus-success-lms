import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useUser } from "@/hooks/use-user";
import { Loader2 } from "lucide-react";
import { SocketProvider } from "@/providers/socket-provider";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";
import { DashboardLayout } from "@/components/dashboard/layout";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/dashboard/users";
import Questions from "@/pages/dashboard/questions";
import Analytics from "@/pages/dashboard/analytics";
import Payments from "@/pages/dashboard/payments";
import Tutors from "@/pages/dashboard/tutors";
import Courses from "@/pages/dashboard/courses";
import Settings from "@/pages/dashboard/settings";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <AuthPage />;
  }

  return (
    <DashboardLayout>
      <Component />
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard/users" component={() => <ProtectedRoute component={Users} />} />
      <Route path="/dashboard/questions" component={() => <ProtectedRoute component={Questions} />} />
      <Route path="/dashboard/analytics" component={() => <ProtectedRoute component={Analytics} />} />
      <Route path="/dashboard/payments" component={() => <ProtectedRoute component={Payments} />} />
      <Route path="/dashboard/tutors" component={() => <ProtectedRoute component={Tutors} />} />
      <Route path="/dashboard/courses" component={() => <ProtectedRoute component={Courses} />} />
      <Route path="/dashboard/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <Router />
        <Toaster />
      </SocketProvider>
    </QueryClientProvider>
  );
}