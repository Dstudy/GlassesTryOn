"use client"

import Link from "next/link";
import { useState, useEffect } from "react";
import { productApi, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const products = await productApi.getFeaturedProducts();
        if (Array.isArray(products)) {
          setFeaturedProducts(products.slice(0, 4));
        } else {
          setError("Dữ liệu nhận từ máy chủ không hợp lệ.");
        }
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Không thể tải sản phẩm nổi bật");
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  return (
    <section id="featured" className="relative overflow-hidden border-y border-primary/10 bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--background))_22%,hsl(var(--primary)/0.04)_100%),radial-gradient(circle_at_top_left,hsl(var(--accent)/0.12),transparent_30%),linear-gradient(135deg,hsl(var(--accent)/0.08),transparent_40%)] py-16 md:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Bộ sưu tập chọn lọc
          </p>
          <h2 className="mt-4 font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Mẫu nổi bật
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Những thiết kế kính, vòng cổ và khuyên tai được yêu thích nhất, dễ chọn cho cả phong cách thanh lịch lẫn cá tính.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mx-auto mt-8 max-w-2xl rounded-2xl shadow-[0_18px_35px_-26px_rgba(220,38,38,0.35)]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="mt-12 flex items-center justify-center py-14">
            <div className="flex items-center gap-3 rounded-full border border-primary/10 bg-background/90 px-5 py-3 shadow-[0_18px_35px_-28px_hsl(var(--primary)/0.35)]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Đang tải sản phẩm nổi bật...</span>
            </div>
          </div>
        ) : !error ? (
          <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : null}

        <div className="mt-14 text-center">
          <Button asChild size="lg" className="group rounded-full px-8">
            <Link href="/shop">
              Xem tất cả sản phẩm
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
