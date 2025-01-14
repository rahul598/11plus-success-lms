import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useUser } from "@/hooks/use-user";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart2,
  CreditCard,
  GraduationCap,
  Library,
  Settings,
  ChevronLeft,
  Award,
  Clock,
  BookMarked,
  UserCircle,
  Package,
} from "lucide-react";

const adminNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Questions", href: "/dashboard/questions", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Products", href: "/dashboard/products", icon: Package },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Tutors", href: "/dashboard/tutors", icon: GraduationCap },
  { name: "Courses", href: "/dashboard/courses", icon: Library },
  { name: "Mock Tests", href: "/dashboard/mock-tests", icon: Clock },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const tutorNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Students", href: "/dashboard/students", icon: Users },
  { name: "Questions", href: "/dashboard/questions", icon: BookOpen },
  { name: "Mock Tests", href: "/dashboard/mock-tests", icon: Clock },
  { name: "Courses", href: "/dashboard/courses", icon: Library },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

const studentNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Courses", href: "/dashboard/my-courses", icon: BookMarked },
  { name: "Mock Tests", href: "/dashboard/mock-tests", icon: Clock },
  { name: "Progress", href: "/dashboard/progress", icon: BarChart2 },
  { name: "Achievements", href: "/dashboard/achievements", icon: Award },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isOpen, toggle } = useSidebar();
  const { user } = useUser();

  const navigation = user?.role === "admin"
    ? adminNavigation
    : user?.role === "tutor"
      ? tutorNavigation
      : studentNavigation;

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={toggle}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !isOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}