import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
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
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Questions", href: "/dashboard/questions", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Tutors", href: "/dashboard/tutors", icon: GraduationCap },
  { name: "Courses", href: "/dashboard/courses", icon: Library },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isOpen, toggle } = useSidebar();

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
                <a
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {isOpen && <span>{item.name}</span>}
                </a>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
