"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";
import type { Product } from "@/lib/types";
import { productApi } from "@/lib/api";
// Bá» import <Card>, <CardContent>, <CardFooter>
import { Heart, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// THAY Äá»”I: Import tá»‡p CSS má»›i cá»§a báº¡n
import "./ProductCard.css"; // Giáº£ sá»­ tá»‡p CSS á»Ÿ cĂ¹ng thÆ° má»¥c

// Helper function to optimize Cloudinary image URLs for performance
const optimizeImageUrl = (url: string): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/f_auto,q_auto,w_800/${parts[1]}`;
  }
  return url;
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // ToĂ n bá»™ logic bĂªn trong component Ä‘Æ°á»£c giá»¯ nguyĂªn
  const { addToCart, toggleFavorite, favorites } = useContext(AppContext);
  const { toast } = useToast();
  const isFavorite = favorites.includes(product.id);

  const [firstVariantId, setFirstVariantId] = useState<number | null>(null);

  const imageUrls = Array.isArray(product.picUrl) ? product.picUrl : [];
  const primaryImageUrl = optimizeImageUrl(imageUrls[0] ?? "/placeholder.svg");

  useEffect(() => {
    let isCancelled = false;
    (async () => {
      try {
        const variants = await productApi.getProductVariants(product.id);
        if (isCancelled) return;
        if (Array.isArray(variants) && variants.length > 0) {
          setFirstVariantId(Number(variants[0]?.id ?? null));
        }
        // ChĂºng ta khĂ´ng hiá»ƒn thá»‹ mĂ u sáº¯c trong thiáº¿t káº¿ má»›i,
        // nhÆ°ng logic nĂ y váº«n quan trá»ng Ä‘á»ƒ thĂªm Ä‘Ăºng biáº¿n thá»ƒ vĂ o giá» hĂ ng
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
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} hiện đã có trong giỏ hàng của bạn.`,
    });
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id);
    toast({
      title: isFavorite ? "Đã xóa khỏi yêu thích" : "Đã thêm vào yêu thích",
      description: `${product.name} đã được ${
        isFavorite ? "xóa khỏi" : "thêm vào"
      } danh sách yêu thích của bạn.`,
    });
  };

  // THAY Äá»”I: TĂ¡i cáº¥u trĂºc toĂ n bá»™ JSX
  return (
    <Link
      href={`/shop/${product.id}`}
      className="product-card-ref" // Lá»›p CSS gá»‘c má»›i
    >
      <div className="card__shine"></div>
      <div className="card__glow"></div>
      <div className="card__content">
        {/* Badge: Sá»­ dá»¥ng logic tá»« ProductCard.tsx */}
        {imageUrls.length > 1 && (
          <div className="card__badge">+{imageUrls.length - 1} áº£nh</div>
        )}

        {/* Image: Sá»­ dá»¥ng Next/Image bĂªn trong div cá»§a ref */}
        <div className="card__image">
          <Image
            src={primaryImageUrl}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 190px"
          />
        </div>

        {/* Text: Sá»­ dá»¥ng dá»¯ liá»‡u tá»« product */}
        <div className="card__text">
          <p className="card__title">{product.name}</p>

          <div className="card__meta">
            <div className="card__rating">
              {Array.from({ length: 5 }, (_, index) => {
                const fillPercent = Math.max(
                  0,
                  Math.min(1, product.rating - index),
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
        </div>

        {/* Footer: Sá»­ dá»¥ng dá»¯ liá»‡u tá»« product vĂ  2 nĂºt */}
        <div className="card__footer">
          <div className="card__price-block">
            <div className="card__price">
              ${Number(product.price ?? 0).toFixed(2)}
            </div>
          </div>

          <div className="card__actions">
            {/* NĂºt YĂªu thĂ­ch */}
            <button
              className={cn(
                "card__button card__button--favorite",
                // Thay Ä‘á»•i style khi Ä‘Æ°á»£c yĂªu thĂ­ch
                isFavorite && "bg-white hover:bg-red-100",
              )}
              onClick={handleToggleFavorite}
              aria-label="Báº­t hoáº·c táº¯t yĂªu thĂ­ch"
            >
              <Heart
                className={cn(
                  "h-4 w-4", // KĂ­ch thÆ°á»›c icon tá»« ref.css lĂ  16px
                  isFavorite ? "fill-red-500 text-red-500" : "text-white", // Lá»›p .card__button sáº½ Ä‘áº·t mĂ u nĂ y
                )}
              />
            </button>

            {/* NĂºt ThĂªm vĂ o giá» hĂ ng */}
            <button
              className="card__button card__button--cart add-to-cart-button" // ThĂªm lá»›p Ä‘á»ƒ CSS nháº¯m má»¥c
              onClick={handleAddToCart}
              aria-label="ThĂªm vĂ o giá» hĂ ng"
            >
              <ShoppingCart className="h-4 w-4 text-white" />
              <span className="card__button-label">Mua</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

