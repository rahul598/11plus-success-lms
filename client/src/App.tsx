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


function Router() {
  return (
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

      {/* Admin Dashboard Routes */}
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

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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