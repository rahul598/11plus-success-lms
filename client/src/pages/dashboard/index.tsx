import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import {
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  Award,
  Clock,
  BookMarked,
  TrendingUp,
} from "lucide-react";

interface Stats {
  users: number;
  questions: number;
  tutors: number;
  revenue: number;
}

interface StudentStats {
  completedCourses: number;
  activeTests: number;
  achievements: number;
  averageScore: number;
}

interface TutorStats {
  totalStudents: number;
  activeCourses: number;
  mockTests: number;
  averageRating: number;
}

export default function Dashboard() {
  const { user } = useUser();

  const { data: adminStats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: user?.role === "admin",
  });

  const { data: tutorStats } = useQuery<TutorStats>({
    queryKey: ["/api/tutor/stats"],
    enabled: user?.role === "tutor",
  });

  const { data: studentStats } = useQuery<StudentStats>({
    queryKey: ["/api/student/stats"],
    enabled: user?.role === "student",
  });

  const renderAdminDashboard = () => {
    const cards = [
      {
        title: "Total Users",
        value: adminStats?.users || 0,
        icon: Users,
      },
      {
        title: "Total Questions",
        value: adminStats?.questions || 0,
        icon: BookOpen,
      },
      {
        title: "Active Tutors",
        value: adminStats?.tutors || 0,
        icon: GraduationCap,
      },
      {
        title: "Revenue",
        value: `$${adminStats?.revenue || 0}`,
        icon: CreditCard,
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderTutorDashboard = () => {
    const cards = [
      {
        title: "Total Students",
        value: tutorStats?.totalStudents || 0,
        icon: Users,
      },
      {
        title: "Active Courses",
        value: tutorStats?.activeCourses || 0,
        icon: BookMarked,
      },
      {
        title: "Mock Tests Created",
        value: tutorStats?.mockTests || 0,
        icon: Clock,
      },
      {
        title: "Average Rating",
        value: tutorStats?.averageRating?.toFixed(1) || "0.0",
        icon: TrendingUp,
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderStudentDashboard = () => {
    const cards = [
      {
        title: "Completed Courses",
        value: studentStats?.completedCourses || 0,
        icon: BookMarked,
      },
      {
        title: "Active Tests",
        value: studentStats?.activeTests || 0,
        icon: Clock,
      },
      {
        title: "Achievements",
        value: studentStats?.achievements || 0,
        icon: Award,
      },
      {
        title: "Average Score",
        value: `${studentStats?.averageScore?.toFixed(1) || 0}%`,
        icon: TrendingUp,
      },
    ];

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {user?.role === "admin" && renderAdminDashboard()}
      {user?.role === "tutor" && renderTutorDashboard()}
      {user?.role === "student" && renderStudentDashboard()}
    </div>
  );
}