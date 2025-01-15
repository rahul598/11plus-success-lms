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