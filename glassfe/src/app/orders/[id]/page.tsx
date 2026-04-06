"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { productApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

interface OrderItemView {
  id: number;
  name: string;
  quantity: number;
  price: number; // price at purchase
  image?: string;
  productId?: number;
  variantId?: number;
  colorName?: string;
  colorHex?: string;
  currentPrice?: number;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<{
    status: string;
    total_amount?: string;
    order_date?: string;
  } | null>(null);
  const [items, setItems] = useState<OrderItemView[]>([]);

  useEffect(() => {
    if (!orderId) return;
    const userId = user?.id; // TODO: implement proper auth context
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await productApi.getOrderDetail(userId, orderId);
        const status = String(data?.status ?? "");
        const total_amount = data?.total_amount;
        const order_date = data?.order_date;
        setSummary({ status, total_amount, order_date });
        const orderItems = Array.isArray(data?.OrderItems)
          ? data.OrderItems
          : Array.isArray(data?.orderItems)
          ? data.orderItems
          : [];
        const mappedBase: OrderItemView[] = orderItems.map((oi: any) => {
          const pv = oi?.ProductVariation ?? {};
          const p = pv?.Product ?? {};
          const images = Array.isArray(pv?.ProductImages)
            ? pv.ProductImages
            : [];
          const firstUrl = images.length
            ? String(images[0]?.pic_url)
            : undefined;
          return {
            id: Number(oi?.id ?? 0),
            name: String(p?.name ?? "Product"),
            quantity: Number(oi?.quantity ?? 1),
            price: Number(oi?.price_at_purchase ?? 0),
            image: firstUrl,
            productId: Number(p?.id ?? 0),
            variantId: Number(oi?.product_variation_id ?? pv?.id ?? 0),
          };
        });
        // Enrich items with variant data: color, images, current price
        const enriched: OrderItemView[] = await Promise.all(
          mappedBase.map(async (it) => {
            try {
              if (!it.productId || !it.variantId) return it;
              const variants = await productApi.getProductVariants(
                it.productId
              );
              const v = variants.find(
                (vv) => Number(vv.id) === Number(it.variantId)
              );
              if (!v) return it;
              const image =
                (Array.isArray(v.images) && v.images[0]) || it.image;

              // Get product details to use product price instead of variant price
              const product = await productApi.getProductById(it.productId);
              const currentPrice = product?.price ?? it.price;

              return {
                ...it,
                image,
                colorName: v.colorName,
                colorHex: v.colorHex,
                currentPrice: Number(currentPrice),
              };
            } catch {
              return it;
            }
          })
        );
        setItems(enriched);
      } catch (e) {
        setError("Failed to load order detail");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link
            href="/orders"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to orders
          </Link>
          <h1 className="font-headline text-3xl font-bold text-primary mb-6">
            Order #{orderId}
          </h1>

          {loading ? (
            <div className="mt-8 flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" /> Loading order...
            </div>
          ) : error ? (
            <p className="mt-8 text-red-600">{error}</p>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status:</span>{" "}
                      <span className="font-medium">{summary?.status}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>{" "}
                      <span className="font-medium">
                        {summary?.total_amount ?? "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Placed:</span>{" "}
                      <span className="font-medium">
                        {summary?.order_date
                          ? new Date(summary.order_date).toLocaleString()
                          : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {items.map((it) => (
                      <li key={it.id} className="py-4 flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded border">
                          <Image
                            src={it.image || "/placeholder.svg"}
                            alt={it.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{it.name}</div>
                          <div className="text-sm text-muted-foreground flex flex-wrap gap-3">
                            <span>Qty: {it.quantity}</span>
                            {it.colorName && (
                              <span className="inline-flex items-center gap-1">
                                <span>Color: {it.colorName}</span>
                                {it.colorHex && (
                                  <span
                                    className="inline-block h-3 w-3 rounded-full border"
                                    style={{ backgroundColor: it.colorHex }}
                                  />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">
                            ${it.price.toFixed(2)}
                          </div>
                          {typeof it.currentPrice === "number" &&
                            it.currentPrice !== it.price && (
                              <div className="text-xs text-muted-foreground">
                                Current: ${it.currentPrice.toFixed(2)}
                              </div>
                            )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
