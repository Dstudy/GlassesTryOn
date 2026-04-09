"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { productApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AppContext } from "@/context/AppContext";

interface OrderItemView {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  productId?: number;
  variantId?: number;
  colorName?: string;
  colorHex?: string;
  currentPrice?: number;
}

export default function OrderDetailPage() {
  const { user } = useContext(AppContext);
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

    const userId = user?.id;
    if (!userId) {
      setError("Người dùng chưa đăng nhập");
      setLoading(false);
      return;
    }

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
          const images = Array.isArray(pv?.ProductImages) ? pv.ProductImages : [];
          const firstUrl = images.length ? String(images[0]?.pic_url) : undefined;

          return {
            id: Number(oi?.id ?? 0),
            name: String(p?.name ?? "Sản phẩm"),
            quantity: Number(oi?.quantity ?? 1),
            price: Number(oi?.price_at_purchase ?? 0),
            image: firstUrl,
            productId: Number(p?.id ?? 0),
            variantId: Number(oi?.product_variation_id ?? pv?.id ?? 0),
          };
        });

        const enriched: OrderItemView[] = await Promise.all(
          mappedBase.map(async (it) => {
            try {
              if (!it.productId || !it.variantId) return it;

              const variants = await productApi.getProductVariants(it.productId);
              const v = variants.find((vv) => Number(vv.id) === Number(it.variantId));
              if (!v) return it;

              const image = (Array.isArray(v.images) && v.images[0]) || it.image;
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
          }),
        );

        setItems(enriched);
      } catch {
        setError("Không thể tải chi tiết đơn hàng");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, user]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50/50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link
            href="/orders"
            className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Quay lại đơn hàng
          </Link>

          <h1 className="mb-6 font-headline text-4xl font-bold text-primary md:text-5xl">
            Đơn hàng #{orderId}
          </h1>

          {loading ? (
            <div className="mt-8 flex items-center gap-3 text-base font-medium">
              <Loader2 className="h-6 w-6 animate-spin" /> Đang tải đơn hàng...
            </div>
          ) : error ? (
            <p className="mt-8 text-red-600">{error}</p>
          ) : (
            <>
              <Card className="mb-6 border-primary/10 shadow-[0_20px_45px_-34px_hsl(var(--primary)/0.35)]">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Tóm tắt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl bg-primary/5 p-4">
                      <span className="text-sm font-medium text-muted-foreground">Trạng thái:</span>
                      <span className="block pt-2 text-lg font-semibold text-foreground">
                        {summary?.status}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-accent/10 p-4">
                      <span className="text-sm font-medium text-muted-foreground">Tổng tiền:</span>
                      <span className="block pt-2 text-2xl font-bold text-primary">
                        {summary?.total_amount ?? "-"}
                      </span>
                    </div>
                    <div className="rounded-2xl bg-primary/5 p-4">
                      <span className="text-sm font-medium text-muted-foreground">Ngày đặt:</span>
                      <span className="block pt-2 text-base font-semibold text-foreground">
                        {summary?.order_date
                          ? new Date(summary.order_date).toLocaleString()
                          : "-"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 shadow-[0_20px_45px_-34px_hsl(var(--primary)/0.35)]">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Sản phẩm</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {items.map((it) => (
                      <li key={it.id} className="flex items-center gap-4 py-5">
                        <div className="h-20 w-20 overflow-hidden rounded-xl border bg-white shadow-sm">
                          <Image
                            src={it.image || "/placeholder.svg"}
                            alt={it.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="text-lg font-semibold text-foreground">{it.name}</div>
                          <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                            <span>Số lượng: {it.quantity}</span>
                            {it.colorName && (
                              <span className="inline-flex items-center gap-1">
                                <span>Màu: {it.colorName}</span>
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

                        <div className="text-right">
                          <div className="text-2xl font-bold tracking-tight text-primary">
                            ${it.price.toFixed(2)}
                          </div>
                          {typeof it.currentPrice === "number" &&
                            it.currentPrice !== it.price && (
                              <div className="mt-1 text-sm font-medium text-muted-foreground">
                                Giá hiện tại: ${it.currentPrice.toFixed(2)}
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
