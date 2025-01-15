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
import { useUser } from "@/hooks/use-user";

// Parent Dashboard Pages
import ParentProfilePage from "@/pages/dashboard/parent/profile";
import ParentProgressPage from "@/pages/dashboard/parent/progress";
import ParentSchedulePage from "@/pages/dashboard/parent/schedule";
import ParentMessagesPage from "@/pages/dashboard/parent/messages";
import ParentOrdersPage from "@/pages/dashboard/parent/orders";
import ParentAddressesPage from "@/pages/dashboard/parent/addresses";
import ParentSettingsPage from "@/pages/dashboard/parent/settings";

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
              <Route path="/dashboard/student" component={StudentDashboard} />
              <Route path="/dashboard/parent" component={ParentDashboard} />
              <Route path="/dashboard/tutor" component={TutorDashboard} />

              {/* Parent Dashboard Routes */}
              <Route path="/dashboard/parent/profile" component={ParentProfilePage} />
              <Route path="/dashboard/parent/progress" component={ParentProgressPage} />
              <Route path="/dashboard/parent/schedule" component={ParentSchedulePage} />
              <Route path="/dashboard/parent/messages" component={ParentMessagesPage} />
              <Route path="/dashboard/parent/orders" component={ParentOrdersPage} />
              <Route path="/dashboard/parent/addresses" component={ParentAddressesPage} />
              <Route path="/dashboard/parent/settings" component={ParentSettingsPage} />
            </>
          ) : (
            <Route component={() => {
              window.location.href = "/auth/login";
              return null;
            }} />
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