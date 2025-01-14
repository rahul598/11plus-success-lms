import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AnalyticsData {
  userGrowth: {
    date: string;
    count: number;
  }[];
  courseMetrics: {
    courseName: string;
    completionRate: number;
    averageProgress: number;
    totalEnrollments: number;
    revenue: number;
  }[];
  questionAnalytics: {
    difficulty: string;
    count: number;
    averageAttempts: number;
    successRate: number;
  }[];
  revenueAnalytics: {
    period: string;
    revenue: number;
    transactionCount: number;
  }[];
  userEngagement: {
    period: string;
    activeUsers: number;
    averageTimeSpent: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const TIME_RANGES = ['7d', '30d', '90d', '1y'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", timeRange],
  });

  const handleExport = async (format: 'json' | 'csv') => {
    const response = await fetch(`/api/analytics/export?format=${format}`);
    if (format === 'csv') {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      const json = await response.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-14rem)]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((range) => (
                <SelectItem key={range} value={range}>
                  {range === '7d' ? 'Last 7 days' :
                    range === '30d' ? 'Last 30 days' :
                    range === '90d' ? 'Last 90 days' :
                    'Last year'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Summary Cards */}
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data.userGrowth.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              +{data.userGrowth[data.userGrowth.length - 1]?.count || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data.revenueAnalytics.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {data.revenueAnalytics[0]?.transactionCount || 0} transactions this month
            </p>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>User Growth Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="New Users"
                    stroke="var(--primary)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.courseMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="courseName" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    fill="var(--primary)"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="totalEnrollments"
                    name="Total Enrollments"
                    fill="var(--secondary)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Question Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Question Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.questionAnalytics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.questionAnalytics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate by Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.questionAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="successRate"
                    name="Success Rate (%)"
                    fill="var(--primary)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trends */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="var(--primary)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="transactionCount"
                    name="Transactions"
                    stroke="var(--secondary)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.userEngagement}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Users"
                    stroke="var(--primary)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="averageTimeSpent"
                    name="Avg. Time (min)"
                    stroke="var(--secondary)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}