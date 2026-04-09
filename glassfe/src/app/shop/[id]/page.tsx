"use client";

import {
  useContext,
  useState,
  useEffect,
  AwaitedReactNode,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ThreeViewer from "@/components/ThreeViewer";
import { AppContext } from "@/context/AppContext";
import { productApi, ApiError } from "@/lib/api";
import type { Product, ProductVariant } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Heart, ArrowLeft, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Lens } from "@/components/ui/lens";
import StarRating from "@/components/ui/star-rating";

import FaceShapeModal from "@/components/FaceShapeModal";
import { FaceShape } from "@/utils/faceShapeClassifier";

// Helper function to optimize Cloudinary image URLs for performance
const optimizeImageUrl = (url: string): string => {
  if (!url || !url.includes("cloudinary.com")) return url;
  const parts = url.split("/upload/");
  if (parts.length === 2) {
    return `${parts[0]}/upload/f_auto,q_auto,w_800/${parts[1]}`;
  }
  return url;
};

export default function ProductDetailPage() {
  const { id } = useParams();
  const productId = parseInt(id as string, 10);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [show3DModel, setShow3DModel] = useState<boolean>(false);
  const [reviewText, setReviewText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, toggleFavorite, favorites, user } = useContext(AppContext);
  const { toast } = useToast();
  const router = useRouter();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [detectedShape, setDetectedShape] = useState<FaceShape | null>(null);

  const [productRating, setProductRating] = useState(0); // Mặc định là 0 sao

  const handleRatingChange = (newRating: number) => {
    setProductRating(newRating);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productDataRaw, variantsRaw] = await Promise.all([
          productApi.getProductById(productId),
          productApi.getProductVariants(productId),
        ]);

        const productData = productDataRaw as Product;
        setProduct(productData);
        setShow3DModel(false); // default to image view; 3D view only when modelUrl exists and user toggles

        // Fetch related products by shape (smaller payload than getAllProducts)
        const relatedByShape = await productApi.getProductsByShape(
          productData.shape,
        );
        const relatedSource = Array.isArray(relatedByShape)
          ? relatedByShape
          : Array.isArray((relatedByShape as any)?.data)
            ? (relatedByShape as any).data
            : [];
        const related = relatedSource
          .filter(
            (p: any) =>
              p && typeof p.id === "number" && p.id !== productData.id,
          )
          .slice(0, 4);
        setRelatedProducts(related);

        const variantArray = Array.isArray(variantsRaw)
          ? (variantsRaw as ProductVariant[])
          : [];
        setVariants(variantArray);
        if (variantArray.length > 0) {
          setSelectedVariantId(variantArray[0].id);
          const initialVariantImages = Array.isArray(variantArray[0].images)
            ? variantArray[0].images
            : [];
          const fallback = Array.isArray(productData.picUrl)
            ? productData.picUrl
            : [];
          const first =
            (initialVariantImages[0] || fallback[0]) ?? "/placeholder.svg";
          setSelectedImageUrl(optimizeImageUrl(first));
        } else {
          const fallback = Array.isArray(productData.picUrl)
            ? productData.picUrl
            : [];
          const first = fallback[0] ?? "/placeholder.svg";
          setSelectedImageUrl(optimizeImageUrl(first));
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setError(
          err instanceof ApiError ? err.message : "Failed to load product",
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50/50">
          <div className="container mx-auto px-4 py-8 md:py-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading product...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50/50">
          <div className="container mx-auto px-4 py-8 md:py-12 text-center">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
              {error ? "Error Loading Product" : "Product Not Found"}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {error ||
                "Sorry, we couldn't find the product you're looking for."}
            </p>
            <Button
              asChild
              className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/shop">Back to Shop</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isFavorite = favorites.includes(product.id);
  const modelUrl = product?.modelUrl || null;
  const has3DModel = Boolean(modelUrl);
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) || null;

  // Aggregate all variant images (fallback to product images)
  const allVariantImages: string[] = Array.isArray(variants)
    ? Array.from(
        new Set(
          variants
            .flatMap((v) => (Array.isArray(v.images) ? v.images : []))
            .filter((u) => typeof u === "string" && u.length > 0),
        ),
      )
    : [];
  const fallbackImages = Array.isArray(product.picUrl) ? product.picUrl : [];
  const galleryImages =
    allVariantImages.length > 0 ? allVariantImages : fallbackImages;

  // Optimize image URLs for performance
  const optimizedGalleryImages = galleryImages.map(optimizeImageUrl);
  const optimizedSelectedImageUrl = selectedImageUrl
    ? optimizeImageUrl(selectedImageUrl)
    : null;

  // Removed extra useEffect to avoid changing hook order; initial image is set in loadProduct

  const primaryImageUrl =
    optimizedSelectedImageUrl ??
    optimizedGalleryImages[0] ??
    "/placeholder.svg";

  const handleAddToCart = () => {
    const variant = selectedVariantId
      ? variants.find((v) => v.id === selectedVariantId)
      : null;
    addToCart(product, {
      productVariationId: variant ? variant.id : undefined,
      quantity: 1,
    });
    toast({
      title: "Added to Cart",
      description: `${product.name} is now in your cart.`,
    });
  };

  const handleToggleFavorite = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    } else {
      toggleFavorite(product.id);
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: `${product.name} has been ${
          isFavorite ? "removed from" : "added to"
        } your favorites.`,
      });
    }
  };

  const handleReviewSubmit = () => {
    // Implement review submission logic here
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    // (Tùy chọn) Kiểm tra xem người dùng đã nhập đủ thông tin chưa
    if (!reviewText.trim() || productRating === 0) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn số sao và viết nội dung đánh giá.",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting review:", productRating, reviewText);
    productApi
      .updateReview(user.id, product.id, productRating, reviewText)
      .then(() => {
        toast({
          title: "Review Submitted",
          description: "Thank you for your feedback!",
        });

        // *** THAY ĐỔI CHÍNH: CẬP NHẬT UI NGAY LẬP TỨC ***

        // 1. Tạo đối tượng review mới dựa trên thông tin vừa gửi
        // Chúng ta cần thêm thông tin 'User' từ context để khớp với cấu trúc dữ liệu
        const newReview = {
          User: {
            id: user.id,
            fullname: user.name || "You",
          },
          rating: productRating,
          review_text: reviewText,
        };
        // 2. Cập nhật state 'product'
        setProduct((prevProduct) => {
          if (!prevProduct) return null; // Trường hợp dự phòng

          // Trả về một đối tượng product mới
          return {
            ...prevProduct,
            // Thêm đánh giá mới vào đầu danh sách reviews
            reviews: [newReview, ...prevProduct.reviews],
          };
        });

        // 3. Xóa nội dung form sau khi đã cập nhật state
        setProductRating(0);
        setReviewText("");
      })
      .catch((err) => {
        console.error("Failed to submit review:", err);
        toast({
          title: "Error",
          description:
            err instanceof ApiError
              ? err.message
              : "Failed to submit your review.",
          variant: "destructive",
        });
      });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link
            href="/shop"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all products
          </Link>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-16">
            <div className="space-y-4">
              <div className="rounded-lg flex  overflow-hidden items-center border shadow-lg relative aspect-square">
                {show3DModel && has3DModel ? (
                  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white absolute inset-0">
                    <ThreeViewer modelUrl={modelUrl!} />
                  </div>
                ) : (
                  <Lens
                    zoomFactor={1.5}
                    lensSize={150}
                    isStatic={false}
                    ariaLabel="Zoom Area"
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <Image
                        src={primaryImageUrl}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="max-h-full w-auto object-contain"
                        data-ai-hint="product photo"
                      />
                    </div>
                  </Lens>
                )}
              </div>
              {galleryImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {optimizedGalleryImages.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedImageUrl(optimizeImageUrl(url));
                        setShow3DModel(false);
                      }}
                      className={cn(
                        "rounded-lg overflow-hidden border focus:outline-none",
                        selectedImageUrl === url && !show3DModel
                          ? "ring-2 ring-primary border-primary"
                          : "hover:border-primary/50",
                      )}
                      aria-label={`View image ${index + 1}`}
                      title={`View image ${index + 1}`}
                    >
                      <Image
                        src={url}
                        alt={`${product.name} view ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-20 object-contain"
                      />
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      if (!has3DModel) return;
                      setShow3DModel((prev) => !prev);
                    }}
                    disabled={!has3DModel}
                    className={cn(
                      "rounded-lg overflow-hidden border focus:outline-none flex items-center justify-center transition-colors h-20",
                      !has3DModel
                        ? "cursor-not-allowed bg-gray-200 text-gray-400"
                        : show3DModel
                          ? "ring-2 ring-primary border-primary bg-primary text-primary-foreground"
                          : "bg-gray-100 hover:border-primary/50 text-gray-700",
                    )}
                    aria-label="View 3D Model"
                    title={
                      has3DModel ? "View 3D Model" : "No 3D model available"
                    }
                  >
                    <div className="text-center">
                      <svg
                        className="w-6 h-6 mx-auto mb-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                        />
                      </svg>
                      <span className="text-[10px] font-medium">3D</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            <div>
              <h1 className="font-headline text-4xl font-bold text-primary md:text-5xl">
                {product.name}
              </h1>
              <div className="mt-2 flex items-center gap-4">
                <p className="text-3xl font-bold text-primary">
                  ${Number(product.price ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Hình dáng:</span>
                  <span className="text-muted-foreground">{product.shape}</span>
                </div>
                {product.face_suitable &&
                  product.face_suitable.trim() !== "" && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Phù hợp khuôn mặt:</span>
                      <span className="text-muted-foreground">
                        {product.face_suitable}
                      </span>
                    </div>
                  )}
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Thương hiệu:</span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    {product.brand}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Chất liệu:</span>
                  <span className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded text-sm">
                    {product.material}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Màu sắc:</span>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          const imgs = Array.isArray(v.images) ? v.images : [];
                          if (imgs.length > 0)
                            setSelectedImageUrl(optimizeImageUrl(imgs[0]));
                        }}
                        className={cn(
                          "h-8 px-3 rounded-full border flex items-center gap-2 text-sm",
                          selectedVariantId === v.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-input bg-background text-foreground hover:bg-muted",
                        )}
                        title={v.colorName}
                        aria-label={`Select color ${v.colorName}`}
                      >
                        {v.colorHex && (
                          <span
                            className="inline-block h-3 w-3 rounded-full border"
                            style={{ backgroundColor: v.colorHex }}
                          />
                        )}
                        <span>{v.colorName || "Color"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <p className="text-lg text-muted-foreground leading-relaxed">
                {product.description}
              </p>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Chiều ngang kính:
                    </span>
                    <span className="font-medium">
                      {product.dimensions.width}mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Chiều dài kính:
                    </span>
                    <span className="font-medium">
                      {product.dimensions.length}mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Độ rộng tròng:
                    </span>
                    <span className="font-medium">
                      {product.dimensions.lensWidth}mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Độ cao tròng:</span>
                    <span className="font-medium">
                      {product.dimensions.lensHeight}mm
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cầu mũi:</span>
                    <span className="font-medium">
                      {product.dimensions.bridge}mm
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 flex-1"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={handleToggleFavorite}
                >
                  <Heart
                    className={cn(
                      "mr-2 h-5 w-5",
                      isFavorite && "fill-red-500 text-red-500",
                    )}
                  />
                  {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </div>
              <div className="mt-4">
                <Button
                  size="lg"
                  className="w-full flex tracking-wide items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md shadow-blue-500/20"
                  onClick={() => setShowFaceModal(true)}
                >
                  <Camera className="w-5 h-5 shrink-0" /> AI Face Shape Try-On
                </Button>
              </div>
            </div>
          </div>
        </div>

        {true && (
          <div className="bg-gray-50/50 py-12 md:py-24">
            <div className="container mx-auto px-4">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center">
                Customer Reviews
              </h2>
              <div className="mt-8 space-y-6 max-w-3xl mx-auto">
                {product.reviews.map(
                  (
                    review: {
                      User: {
                        id: number;
                        fullname: string;
                      };
                      rating: number;
                      review_text: string | null;
                    },
                    index: Key | null | undefined,
                  ) => (
                    <div
                      key={review.User.id || index}
                      className="border-b pb-4 last:border-0 last:pb-0"
                    >
                      <h4 className="reviewerName">
                        {review.User ? review.User.fullname : "Anonymous"}
                      </h4>
                      <div className="flex items-center mb-2">
                        {Array.from({ length: 5 }, (_, starIndex) => {
                          const fillPercent = Math.max(
                            0,
                            Math.min(1, review.rating - starIndex),
                          );
                          return (
                            <span
                              key={starIndex}
                              className="text-sm"
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
                      <p className="text-muted-foreground">
                        {review.review_text}
                      </p>
                    </div>
                  ),
                )}
              </div>

              <div className="">
                <h3 className="mt-12 mb-4 text-xl font-semibold">
                  Write a Review
                </h3>
                <div>
                  <StarRating
                    rating={productRating}
                    onRatingChange={handleRatingChange}
                    size={30} // 30px
                  />
                </div>
                <textarea
                  className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                ></textarea>
                <div className="flex justify-end mt-2">
                  <Button onClick={handleReviewSubmit}>Submit Review</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="bg-primary/5 py-12 md:py-24">
            <div className="container mx-auto px-4">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary sm:text-4xl text-center">
                You Might Also Like
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <AlertDialog open={showAuthModal} onOpenChange={setShowAuthModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign In Required</AlertDialogTitle>
              <AlertDialogDescription>
                You must be logged in to add products to your favorites.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => router.push("/login")}>
                Sign In
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <FaceShapeModal
          isOpen={showFaceModal}
          onClose={() => {
            setShowFaceModal(false);
            setDetectedShape(null);
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
