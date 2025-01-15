import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { useUser } from "@/hooks/use-user";
import LoginPage from "@/pages/auth/login";
import AdminDashboard from "@/pages/dashboard/admin";
import AdminAnalyticsPage from "@/pages/dashboard/admin/analytics";
import AdminReportsPage from "@/pages/dashboard/admin/reports";
import AdminUsersPage from "@/pages/dashboard/admin/users";
import AdminProductsPage from "@/pages/dashboard/admin/products";
import AdminSubscriptionsPage from "@/pages/dashboard/admin/subscriptions";
import AdminPaymentsPage from "@/pages/dashboard/admin/payments";
import AdminTutorsPage from "@/pages/dashboard/admin/tutors";
import AdminCoursesPage from "@/pages/dashboard/admin/courses";
import AdminMockTestsPage from "@/pages/dashboard/admin/mock-tests";
import AdminSettingsPage from "@/pages/dashboard/admin/settings";
import HomePage from "@/pages/home";
import { useEffect } from "react";

function getDashboardRoute(role?: string) {
  switch (role) {
    case "admin":
      return "/dashboard/admin";
    case "tutor":
      return "/dashboard/tutor";
    case "parent":
      return "/dashboard/parent";
    case "student":
      return "/dashboard/student";
    default:
      return "/auth/login";
  }
}

function Router() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

  // Redirect to appropriate dashboard after login
  useEffect(() => {
    if (user) {
      const dashboardRoute = getDashboardRoute(user.role);
      if (location === "/" || location === "/auth/login") {
        setLocation(dashboardRoute);
      }
    }
  }, [user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Redirect to login if not logged in
  if (!user && location !== "/auth/login") {
    setLocation("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={HomePage} />
          <Route path="/auth/login" component={LoginPage} />

          {/* Protected Routes */}
          {user && (
            <>
              {/* Admin Routes */}
              {user.role === "admin" && (
                <>
                  <Route path="/dashboard/admin" component={AdminDashboard} />
                  <Route path="/dashboard/admin/analytics" component={AdminAnalyticsPage} />
                  <Route path="/dashboard/admin/reports" component={AdminReportsPage} />
                  <Route path="/dashboard/admin/users" component={AdminUsersPage} />
                  <Route path="/dashboard/admin/products" component={AdminProductsPage} />
                  <Route path="/dashboard/admin/subscriptions" component={AdminSubscriptionsPage} />
                  <Route path="/dashboard/admin/payments" component={AdminPaymentsPage} />
                  <Route path="/dashboard/admin/tutors" component={AdminTutorsPage} />
                  <Route path="/dashboard/admin/courses" component={AdminCoursesPage} />
                  <Route path="/dashboard/admin/mock-tests" component={AdminMockTestsPage} />
                  <Route path="/dashboard/admin/settings" component={AdminSettingsPage} />
                </>
              )}

              {/* Redirect to appropriate dashboard if accessing wrong routes */}
              <Route path="/dashboard/*">
                {() => {
                  const correctDashboard = getDashboardRoute(user.role);
                  if (!location.startsWith(correctDashboard)) {
                    setLocation(correctDashboard);
                  }
                  return null;
                }}
              </Route>
            </>
          )}

          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}