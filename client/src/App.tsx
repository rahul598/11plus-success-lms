import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { SocketProvider } from "@/providers/socket-provider";
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

// Parent Dashboard Pages
import ParentProfilePage from "@/pages/dashboard/parent/profile";
import ParentProgressPage from "@/pages/dashboard/parent/progress";
import ParentSchedulePage from "@/pages/dashboard/parent/schedule";
import ParentMessagesPage from "@/pages/dashboard/parent/messages";
import ParentOrdersPage from "@/pages/dashboard/parent/orders";
import ParentAddressesPage from "@/pages/dashboard/parent/addresses";
import ParentSettingsPage from "@/pages/dashboard/parent/settings";

function Router() {
  return (
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