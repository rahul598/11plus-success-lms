import { Avatar } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";

interface Sale {
  id: number;
  customerName: string;
  customerEmail: string;
  amount: number;
  date: string;
  avatar: string;
}

export function RecentSales() {
  const { data: sales } = useQuery<Sale[]>({
    queryKey: ["/api/sales/recent"],
  });

  if (!sales) {
    return (
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
            <div className="ml-4 space-y-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="ml-auto h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sales.map((sale) => (
        <div key={sale.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <img
              alt={`${sale.customerName}'s avatar`}
              src={sale.avatar}
              width={40}
              height={40}
            />
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.customerName}</p>
            <p className="text-sm text-muted-foreground">{sale.customerEmail}</p>
          </div>
          <div className="ml-auto font-medium">
            +${sale.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}