import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
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

// Parent Dashboard Pages
import ParentProfilePage from "@/pages/dashboard/parent/profile";
import ParentProgressPage from "@/pages/dashboard/parent/progress";
import ParentSchedulePage from "@/pages/dashboard/parent/schedule";
import ParentMessagesPage from "@/pages/dashboard/parent/messages";
import ParentOrdersPage from "@/pages/dashboard/parent/orders";
import ParentAddressesPage from "@/pages/dashboard/parent/addresses";
import ParentSettingsPage from "@/pages/dashboard/parent/settings";

// Admin Dashboard Pages
import AdminUsersPage from "@/pages/dashboard/admin/users";
import AdminReportsPage from "@/pages/dashboard/admin/reports";
import AdminAnalyticsPage from "@/pages/dashboard/admin/analytics";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
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
                <>
                  <Route path="/dashboard/parent" component={ParentDashboard} />
                  <Route path="/dashboard/parent/profile" component={ParentProfilePage} />
                  <Route path="/dashboard/parent/progress" component={ParentProgressPage} />
                  <Route path="/dashboard/parent/schedule" component={ParentSchedulePage} />
                  <Route path="/dashboard/parent/messages" component={ParentMessagesPage} />
                  <Route path="/dashboard/parent/orders" component={ParentOrdersPage} />
                  <Route path="/dashboard/parent/addresses" component={ParentAddressesPage} />
                  <Route path="/dashboard/parent/settings" component={ParentSettingsPage} />
                </>
              )}

              {/* Admin Dashboard */}
              {user.role === "admin" && (
                <>
                  <Route path="/dashboard/admin" component={AdminDashboard} />
                  <Route path="/dashboard/admin/users" component={AdminUsersPage} />
                  <Route path="/dashboard/admin/reports" component={AdminReportsPage} />
                  <Route path="/dashboard/admin/analytics" component={AdminAnalyticsPage} />
                </>
              )}

              {/* Redirect to appropriate dashboard if role doesn't match */}
              <Route>
                {() => {
                  window.location.href = getDashboardRoute(user.role);
                  return null;
                }}
              </Route>
            </>
          ) : (
            <Route>
              {() => {
                window.location.href = "/auth/login";
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