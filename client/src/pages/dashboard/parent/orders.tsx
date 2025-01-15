import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Eye } from "lucide-react";

interface Order {
  id: string;
  date: string;
  status: "completed" | "processing" | "cancelled";
  total: number;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export default function ParentOrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/parent/orders"],
    queryFn: async () => {
      const response = await fetch("/api/parent/orders");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
  });

  const mockOrders: Order[] = [
    {
      id: "ORD-001",
      date: "2025-01-10",
      status: "completed",
      total: 199.99,
      items: [
        { name: "Math Course Bundle", quantity: 1, price: 199.99 }
      ]
    },
    {
      id: "ORD-002",
      date: "2025-01-05",
      status: "processing",
      total: 299.99,
      items: [
        { name: "Science Course Bundle", quantity: 1, price: 299.99 }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-blue-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-medium ${getStatusColor(order.status)} capitalize`}>
                    {order.status}
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      </div>
                      <div>£{item.price.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="font-semibold">Total</div>
                  <div className="font-semibold">£{order.total.toFixed(2)}</div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
