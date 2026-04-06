"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productApi, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
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
          console.error("API response is not an array:", products);
          setError("Received invalid data from the server.");
        }
      } catch (err) {
        console.error("Failed to load featured products:", err);
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load featured products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);
  return (
    <section id="featured" className="bg-primary/5 py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Featured Styles
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Handpicked for you, discover our most popular frames.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="mt-12 flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading featured products...</span>
            </div>
          </div>
        ) : (
          !error && ( // Also, don't show products if there was an error
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )
        )}

        <div className="mt-12 text-center">
          <Button
            asChild
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/shop">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
