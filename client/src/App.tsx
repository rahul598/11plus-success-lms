import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import MockExamsPage from "@/pages/mock-exams";
import ReportsPage from "@/pages/reports";
import TutionPage from "@/pages/tution";
import AboutUsPage from "@/pages/about-us";
import ContactUsPage from "@/pages/contact-us";
import LoginPage from "@/pages/auth/login";
import SignupPage from "@/pages/auth/signup";
import CartPage from "@/pages/cart";
import CheckoutPage from "@/pages/checkout";
import StudentDashboard from "@/pages/dashboard/student";
import ParentDashboard from "@/pages/dashboard/parent";
import TutorDashboard from "@/pages/dashboard/tutor";
import AdminDashboard from "@/pages/dashboard/admin";
import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";
import { useLocation } from "wouter";

function getDashboardRoute(role?: string) {
  switch (role) {
    case "student":
      return "/dashboard/student";
    case "tutor":
      return "/dashboard/tutor";
    case "parent":
      return "/dashboard/parent";
    case "admin":
      return "/dashboard/admin";
    default:
      return "/auth/login";
  }
}

function Router() {
  const { user, isLoading } = useUser();
  const [location, setLocation] = useLocation();

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <Switch>
          {/* Public Routes */}
          <Route path="/" component={HomePage} />
          <Route path="/mock-exams" component={MockExamsPage} />
          <Route path="/reports" component={ReportsPage} />
          <Route path="/tution" component={TutionPage} />
          <Route path="/about-us" component={AboutUsPage} />
          <Route path="/contact-us" component={ContactUsPage} />
          <Route path="/auth/login" component={LoginPage} />
          <Route path="/auth/signup" component={SignupPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />

          {/* Protected Routes - Only accessible when logged in */}
          {user ? (
            <>
              {/* Student Dashboard */}
              {user.role === "student" && (
                <Route path="/dashboard/student" component={StudentDashboard} />
              )}

              {/* Tutor Dashboard */}
              {user.role === "tutor" && (
                <Route path="/dashboard/tutor" component={TutorDashboard} />
              )}

              {/* Parent Dashboard */}
              {user.role === "parent" && (
                <Route path="/dashboard/parent" component={ParentDashboard} />
              )}

              {/* Admin Dashboard */}
              {user.role === "admin" && (
                <Route path="/dashboard/admin" component={AdminDashboard} />
              )}

              {/* If accessing wrong dashboard routes, redirect to correct one */}
              <Route path="/dashboard/*">
                {() => {
                  const correctDashboard = getDashboardRoute(user.role);
                  if (location !== correctDashboard) {
                    setLocation(correctDashboard);
                  }
                  return null;
                }}
              </Route>
            </>
          ) : (
            // Redirect to login if not authenticated
            <Route path="/dashboard/*">
              {() => {
                setLocation("/auth/login");
                return null;
              }}
            </Route>
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