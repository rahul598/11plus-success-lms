import { DashboardLayout } from "@/components/dashboard/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
} from "lucide-react";

interface Stats {
  users: number;
  questions: number;
  tutors: number;
  revenue: number;
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const cards = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: Users,
    },
    {
      title: "Total Questions",
      value: stats?.questions || 0,
      icon: BookOpen,
    },
    {
      title: "Active Tutors",
      value: stats?.tutors || 0,
      icon: GraduationCap,
    },
    {
      title: "Revenue",
      value: `$${stats?.revenue || 0}`,
      icon: CreditCard,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
      </div>
    </DashboardLayout>
  );
}