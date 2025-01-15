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
import Payments from "@/pages/dashboard/payments";
import Tutors from "@/pages/dashboard/tutors";
import Courses from "@/pages/dashboard/courses";
import Settings from "@/pages/dashboard/settings";
import MockTests from "@/pages/dashboard/mock-tests";
import Products from "@/pages/dashboard/products";
import ProductCategories from "@/pages/dashboard/products/categories";
import ProductOrders from "@/pages/dashboard/products/orders";
import Subscriptions from "@/pages/dashboard/subscriptions";
import MySubscription from "@/pages/dashboard/my-subscription";
import Media from "@/pages/dashboard/media";
import LiveClasses from "@/pages/dashboard/classes/live";
import RecordedClasses from "@/pages/dashboard/classes/recorded";
import ClassSchedule from "@/pages/dashboard/classes/schedule";
import Quizzes from "@/pages/dashboard/quizzes";
import QuizQuestions from "@/pages/dashboard/quizzes/[id]/questions";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
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
      <Route path="/dashboard/payments" component={() => <ProtectedRoute component={Payments} />} />
      <Route path="/dashboard/tutors" component={() => <ProtectedRoute component={Tutors} />} />
      <Route path="/dashboard/courses" component={() => <ProtectedRoute component={Courses} />} />
      <Route path="/dashboard/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/dashboard/mock-tests" component={() => <ProtectedRoute component={MockTests} />} />
      <Route path="/dashboard/products" component={() => <ProtectedRoute component={Products} />} />
      <Route path="/dashboard/products/categories" component={() => <ProtectedRoute component={ProductCategories} />} />
      <Route path="/dashboard/products/orders" component={() => <ProtectedRoute component={ProductOrders} />} />
      <Route path="/dashboard/subscriptions" component={() => <ProtectedRoute component={Subscriptions} />} />
      <Route path="/dashboard/my-subscription" component={() => <ProtectedRoute component={MySubscription} />} />
      <Route path="/dashboard/media" component={() => <ProtectedRoute component={Media} />} />
      <Route path="/dashboard/classes/live" component={() => <ProtectedRoute component={LiveClasses} />} />
      <Route path="/dashboard/classes/recorded" component={() => <ProtectedRoute component={RecordedClasses} />} />
      <Route path="/dashboard/classes/schedule" component={() => <ProtectedRoute component={ClassSchedule} />} />
      <Route path="/dashboard/quizzes" component={() => <ProtectedRoute component={Quizzes} />} />
      <Route path="/dashboard/quizzes/:id/questions" component={() => <ProtectedRoute component={QuizQuestions} />} />
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