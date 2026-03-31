"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";
import type { Product } from "@/lib/types";
import { productApi } from "@/lib/api";
// Bỏ import <Card>, <CardContent>, <CardFooter>
import { Heart, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// THAY ĐỔI: Import tệp CSS mới của bạn
import "./ProductCard.css"; // Giả sử tệp CSS ở cùng thư mục

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Toàn bộ logic bên trong component được giữ nguyên
  const { addToCart, toggleFavorite, favorites } = useContext(AppContext);
  const { toast } = useToast();
  const isFavorite = favorites.includes(product.id);

  const [firstVariantId, setFirstVariantId] = useState<number | null>(null);

  const imageUrls = Array.isArray(product.picUrl) ? product.picUrl : [];
  const primaryImageUrl = imageUrls[0] ?? "/placeholder.svg";

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const variants = await productApi.getProductVariants(product.id);
        if (isCancelled) return;
        if (Array.isArray(variants) && variants.length > 0) {
          setFirstVariantId(Number(variants[0]?.id ?? null));
        }
        // Chúng ta không hiển thị màu sắc trong thiết kế mới,
        // nhưng logic này vẫn quan trọng để thêm đúng biến thể vào giỏ hàng
      } catch (error) {
        console.error("Error fetching product variants:", error);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, {
      productVariationId: firstVariantId ?? undefined,
      quantity: 1,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} is now in your cart.`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: `${product.name} has been ${
        isFavorite ? "removed from" : "added to"
      } your favorites.`,
    });
  };

  // THAY ĐỔI: Tái cấu trúc toàn bộ JSX
  return (
    <Link
      href={`/shop/${product.id}`}
      className="product-card-ref" // Lớp CSS gốc mới
    >
      <div className="card__shine"></div>
      <div className="card__glow"></div>
      <div className="card__content">
        {/* Badge: Sử dụng logic từ ProductCard.tsx */}
        {imageUrls.length > 1 && (
          <div className="card__badge">+{imageUrls.length - 1} ảnh</div>
        )}

        {/* Image: Sử dụng Next/Image bên trong div của ref */}
        <div className="card__image">
          <Image
            src={primaryImageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 190px"
          />
        </div>

        {/* Text: Sử dụng dữ liệu từ product */}
        <div className="card__text">
          <p className="card__title">{product.name}</p>

          <div className="card__rating">
            {Array.from({ length: 5 }, (_, index) => {
              const fillPercent = Math.max(
                0,
                Math.min(1, product.rating - index)
              );
              return (
                <span
                  key={index}
                  className="card__rating-star"
                  style={{
                    background: `linear-gradient(90deg, gold ${
                      fillPercent * 100
                    }%, #ddd ${fillPercent * 100}%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  ★
                </span>
              );
            })}
          </div>

          <p className="card__description">
            {product.shape} | {product.brand}
          </p>
        </div>

        {/* Footer: Sử dụng dữ liệu từ product và 2 nút */}
        <div className="card__footer">
          <div className="card__price">
            ${Number(product.price ?? 0).toFixed(2)}
          </div>

          <div className="flex items-center gap-1">
            {/* Nút Yêu thích */}
            <button
              className={cn(
                "card__button",
                // Thay đổi style khi được yêu thích
                isFavorite && "bg-white hover:bg-red-100"
              )}
              onClick={handleToggleFavorite}
              aria-label="Toggle Favorite"
            >
              <Heart
                className={cn(
                  "h-4 w-4", // Kích thước icon từ ref.css là 16px
                  isFavorite ? "fill-red-500 text-red-500" : "text-white" // Lớp .card__button sẽ đặt màu này
                )}
              />
            </button>

            {/* Nút Thêm vào giỏ hàng */}
            <button
              className="card__button add-to-cart-button" // Thêm lớp để CSS nhắm mục
              onClick={handleAddToCart}
              aria-label="Add to Cart"
            >
              <ShoppingCart className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
