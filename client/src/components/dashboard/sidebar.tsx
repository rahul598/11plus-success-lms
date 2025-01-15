import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/hooks/use-sidebar";
import { useUser } from "@/hooks/use-user";
import { useSubscription } from "@/hooks/use-subscription";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
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
  FileText,
  ShoppingCart,
  LineChart,
  Crown,
  ChevronDown,
  ChevronRight,
  Video,
  Calendar,
  Image
} from "lucide-react";

interface SubscriptionFeatures {
  mockTests?: boolean;
  studyMaterials?: boolean;
  analysisReports?: boolean;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredFeature?: keyof SubscriptionFeatures;
  children?: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    requiredFeature?: keyof SubscriptionFeatures;
  }>;
}

const adminNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Users", href: "/dashboard/users", icon: Users },
  { name: "Questions", href: "/dashboard/questions", icon: BookOpen },
  {
    name: "Class Management",
    icon: Calendar,
    children: [
      { name: "Live Classes", href: "/dashboard/classes/live", icon: Video },
      { name: "Recorded Videos", href: "/dashboard/classes/recorded", icon: Video },
      { name: "Schedule", href: "/dashboard/classes/schedule", icon: Calendar }
    ]
  },
  {
    name: "E-Commerce",
    icon: ShoppingCart,
    children: [
      { name: "All Products", href: "/dashboard/products", icon: Package },
      { name: "Categories", href: "/dashboard/products/categories", icon: Tags },
      { name: "Orders", href: "/dashboard/products/orders", icon: FileText }
    ]
  },
  { name: "Media Library", href: "/dashboard/media", icon: Image },
  { name: "Subscriptions", href: "/dashboard/subscriptions", icon: Crown },
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
  {
    name: "Mock Tests",
    href: "/dashboard/mock-tests",
    icon: Clock,
    requiredFeature: "mockTests"
  },
  { name: "Courses", href: "/dashboard/courses", icon: Library },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

const studentNavigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "My Courses",
    href: "/dashboard/my-courses",
    icon: BookMarked,
    requiredFeature: "studyMaterials"
  },
  {
    name: "Mock Tests",
    href: "/dashboard/mock-tests",
    icon: Clock,
    requiredFeature: "mockTests"
  },
  {
    name: "Progress",
    href: "/dashboard/progress",
    icon: LineChart,
    requiredFeature: "analysisReports"
  },
  {
    name: "Achievements",
    href: "/dashboard/achievements",
    icon: Award
  },
  { name: "My Subscription", href: "/dashboard/my-subscription", icon: Crown },
  { name: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isOpen, toggle } = useSidebar();
  const { user } = useUser();
  const { hasFeature } = useSubscription();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const navigation = user?.role === "admin"
    ? adminNavigation
    : user?.role === "tutor"
      ? tutorNavigation
      : studentNavigation;

  const toggleMenu = (menuName: string) => {
    setOpenMenus(prev =>
      prev.includes(menuName)
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const renderNavItem = (item: NavigationItem) => {
    if (item.requiredFeature && !hasFeature(item.requiredFeature)) {
      return null;
    }

    const isMenuOpen = openMenus.includes(item.name);

    if (item.children) {
      return (
        <div key={item.name} className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between",
              isOpen ? "px-3" : "px-2",
              "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
            onClick={() => toggleMenu(item.name)}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="h-4 w-4" />}
              {isOpen && <span className="ml-3">{item.name}</span>}
            </div>
            {isOpen && (
              <div className="transition-transform duration-200">
                {isMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            )}
          </Button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              isMenuOpen ? "max-h-96" : "max-h-0",
              isOpen ? "pl-3" : "pl-0"
            )}
          >
            {item.children.map((child) => {
              if (child.requiredFeature && !hasFeature(child.requiredFeature)) {
                return null;
              }

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
                    {Icon && <Icon className="h-4 w-4" />}
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
          {Icon && <Icon className="h-4 w-4" />}
          {isOpen && <span className="ml-3">{item.name}</span>}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        <div className={cn("overflow-hidden transition-all duration-300",
          isOpen ? "w-40" : "w-0")}>
          <img
            src="https://vinsonedge.com/wp-content/uploads/2025/01/Logo-3.png"
            alt="Vinsonedge Logo"
            className="h-8 brightness-0 invert"
          />
        </div>
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
          {navigation.map(renderNavItem)}
        </nav>
      </ScrollArea>
    </div>
  );
}