"use client";

import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";
import { productApi, ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { User, Heart, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FavoritesPage() {
  const { user, favorites } = useContext(AppContext);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavoriteProducts = async () => {
      if (!user) {
        setLoading(false);
        setFavoriteProducts([]); // Đảm bảo danh sách rỗng nếu đã đăng xuất
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const userId = user?.id; // TODO: implement proper auth context
        const prods = await productApi.getFavoriteProducts(userId);
        // If local favorites differ, still filter down to local selection for safety
        const filtered =
          favorites.length > 0
            ? prods.filter((p) => favorites.includes(p.id))
            : prods;
        setFavoriteProducts(filtered);
      } catch (err) {
        console.error("Failed to load favorite products:", err);
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load favorite products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFavoriteProducts();
  }, [favorites]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Your Favorites
          </h1>

          {!user ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <User className="mx-auto h-16 w-16 text-gray-400" />
              <h2 className="mt-6 text-xl font-semibold">
                Log in to see your favorites
              </h2>
              <p className="mt-2 text-muted-foreground">
                Create an account or log in to save the styles you love.
              </p>
              <Button
                asChild
                className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/login">Log In / Sign Up</Link>
              </Button>
            </div>
          ) : loading ? (
            <div className="mt-8 flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading your favorites...</span>
              </div>
            </div>
          ) : error ? (
            <div className="mt-8">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          ) : favoriteProducts.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <Heart className="mx-auto h-16 w-16 text-gray-400" />
              <h2 className="mt-6 text-xl font-semibold">No favorites yet</h2>
              <p className="mt-2 text-muted-foreground">
                Click the heart icon on any product to save it here.
              </p>
              <Button
                asChild
                className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/shop">Find Your Perfect Pair</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
