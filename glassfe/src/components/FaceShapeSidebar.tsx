"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { productApi } from "@/lib/api";
import { Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import { FaceShape } from "@/utils/faceShapeClassifier";
import { Loader2 } from "lucide-react";

interface FaceShapeSidebarProps {
  shape: FaceShape | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function FaceShapeSidebar({ shape, isOpen, onClose }: FaceShapeSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecommended = async () => {
      if (!shape) return;
      setLoading(true);
      try {
        const shapeStr = shape;
        const res = await productApi.getAllProducts({ face_suitable: shapeStr });
        setProducts(res.products);
      } catch (err) {
        console.error("Error fetching recommended products:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && shape) {
      fetchRecommended();
    }
  }, [isOpen, shape]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            Gợi ý từ AI
          </SheetTitle>
          <SheetDescription>
            Dựa trên dáng khuôn mặt <span className="font-bold text-primary">{shape}</span> của bạn, những mẫu gọng này sẽ phù hợp nhất.
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Chưa tìm thấy mẫu kính phù hợp riêng cho dáng mặt {shape}.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
