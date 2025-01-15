import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";

interface AnalyticsData {
  revenue: {
    total: number;
    monthly: number[];
  };
  users: {
    total: number;
    newThisMonth: number;
    activeThisMonth: number;
    growthRate: number;
  };
}

export function Overview() {
  const { data } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/overview"],
  });

  const chartData = data?.revenue.monthly.map((value, index) => ({
    revenue: value,
    month: `Month ${index + 1}`,
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData}>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Revenue
                      </span>
                      <span className="font-bold text-muted-foreground">
                        ${payload[0].value}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "var(--theme-primary)", opacity: 0.8 },
          }}
          style={{
            stroke: "var(--theme-primary)",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}