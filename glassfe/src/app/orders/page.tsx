"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { productApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { AppContext } from "@/context/AppContext";

interface OrderSummary {
  id: number;
  status: string;
  total_amount?: string;
  order_date?: string;
}

export default function OrdersPage() {
  const { user } = useContext(AppContext);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const userId = user?.id;
      if (!userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getOrders(userId);
        const mapped: OrderSummary[] = (Array.isArray(data) ? data : []).map(
          (o: any) => ({
            id: Number(o?.id ?? 0),
            status: String(o?.status ?? ""),
            total_amount: o?.total_amount,
            order_date: o?.order_date,
          })
        );
        setOrders(mapped);
      } catch (e) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Your Orders
          </h1>

          {loading ? (
            <div className="mt-8 flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading orders...
            </div>
          ) : error === "User not logged in" ? (
            // Hiển thị Card đăng nhập nếu chưa đăng nhập
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Please Sign In</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  You must be logged in to view your orders.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/login">Sign In</Link>
                </Button>
              </CardContent>
            </Card>
          ) : error ? (
            <p className="mt-8 text-red-600">{error}</p>
          ) : orders.length === 0 ? (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>No orders yet</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Place an order to see it here.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link href="/shop">Shop Now</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6">
              {orders.map((o) => (
                <Card key={o.id} className="shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Order #{o.id}
                      </div>
                      <div className="font-medium">Status: {o.status}</div>
                      <div className="text-sm">
                        Total: {o.total_amount ?? "-"}
                      </div>
                      {o.order_date && (
                        <div className="text-xs text-muted-foreground">
                          Placed: {new Date(o.order_date).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <Button asChild variant="outline">
                      <Link href={`/orders/${o.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
