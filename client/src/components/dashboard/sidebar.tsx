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
  Tags,
  Boxes,
  FileText,
  ShoppingCart,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

const adminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Questions", href: "/dashboard/questions", icon: BookOpen },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  {
    name: "E-Commerce",
    icon: ShoppingCart,
    children: [
      { name: "All Products", href: "/dashboard/products", icon: Package },
      { name: "Categories", href: "/dashboard/products/categories", icon: Tags },
      { name: "Inventory", href: "/dashboard/products/inventory", icon: Boxes },
      { name: "Orders", href: "/dashboard/products/orders", icon: FileText },
    ]
  },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Tutors", href: "/dashboard/tutors", icon: GraduationCap },
  { name: "Courses", href: "/dashboard/courses", icon: Library },
  { name: "Mock Tests", href: "/dashboard/mock-tests", icon: Clock },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const tutorNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Students", href: "/dashboard/students", icon: Users },
  { name: "Questions", href: "/dashboard/questions", icon: BookOpen },
  { name: "Mock Tests", href: "/dashboard/mock-tests", icon: Clock },
  { name: "Courses", href: "/dashboard/courses", icon: Library },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

const studentNavigation: NavigationItem[] = [
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
            if (item.children) {
              return (
                <div key={item.name} className="space-y-1">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium",
                    isOpen ? "justify-start" : "justify-center",
                    "text-sidebar-foreground"
                  )}>
                    <item.icon className="h-4 w-4" />
                    {isOpen && <span className="ml-3">{item.name}</span>}
                  </div>
                  <div className={cn("pl-3 space-y-1", !isOpen && "pl-0")}>
                    {item.children.map((child) => {
                      const Icon = child.icon;
                      return (
                        <Link key={child.name} href={child.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start",
                              location === child.href
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {isOpen && <span className="ml-3">{child.name}</span>}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href!}>
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