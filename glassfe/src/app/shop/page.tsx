"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { productApi, ApiError, type ProductFilters } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Search,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// Giới hạn số lượng hiển thị cho mỗi bộ lọc
const INITIAL_DISPLAY_LIMIT = 5;

function ShopPageInner() {
  const searchParams = useSearchParams();
  const categoryFromQuery = searchParams.get("category");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const categoryMap: Record<string, string> = {
    glasses: "Kính",
    necklaces: "Vòng cổ",
    earrings: "Khuyên tai",
  };

  const normalizeCategory = (value: string) => value.trim().toLowerCase();
  const scrollToProducts = () => {
    document
      .querySelector("#shop-controls-anchor")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
    setCurrentPage(1);
    scrollToProducts();
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material],
    );
    setCurrentPage(1);
    scrollToProducts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
    setCurrentPage(1);
    scrollToProducts();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortOrder(value);
    setCurrentPage(1);
  };

  useEffect(() => {
    const nextCategories = categoryFromQuery
      ? [normalizeCategory(categoryFromQuery)]
      : [];

    setSelectedCategories((prev) => {
      const prevNormalized = prev.map(normalizeCategory);
      const unchanged =
        prevNormalized.length === nextCategories.length &&
        prevNormalized.every((value, index) => value === nextCategories[index]);

      return unchanged ? prev : nextCategories;
    });

    setCurrentPage(1);
  }, [categoryFromQuery]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: ProductFilters = {
          search: searchTerm || undefined,
          sortBy: sortOrder as any,
          brand: selectedBrands.length > 0 ? selectedBrands : undefined,
          material:
            selectedMaterials.length > 0 ? selectedMaterials : undefined,
          category:
            selectedCategories.length > 0 ? selectedCategories : undefined,
          page: currentPage,
        };

        const tasks: Promise<any>[] = [productApi.getAllProducts(filters)];

        if (!initialLoaded) {
          tasks.push(productApi.getFilterOptions());
        }

        const [productsData, filterOptions] = await Promise.all(tasks);

        setProducts(productsData.products || []);
        setTotalPages(productsData.totalPages || 1);
        setTotalProducts(productsData.totalProducts || 0);
        setCurrentPage(productsData.currentPage || 1);

        if (filterOptions) {
          setBrands(filterOptions.brands || []);
          setMaterials(filterOptions.materials || []);
          setCategories(
            (filterOptions.categories || []).map(
              (item: string) => categoryMap[item] || item,
            ),
          );
          setInitialLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(
          err instanceof ApiError ? err.message : "Không thể tải sản phẩm",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    searchTerm,
    sortOrder,
    selectedBrands,
    selectedMaterials,
    selectedCategories,
    currentPage,
    initialLoaded,
  ]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getDisplayedItems = (items: string[], showAll: boolean) => {
    return showAll ? items : items.slice(0, INITIAL_DISPLAY_LIMIT);
  };

  const FilterSection = ({
    title,
    items,
    selectedItems,
    showAll,
    onToggleShowAll,
    onItemChange,
    value,
  }: {
    title: string;
    items: string[];
    selectedItems: string[];
    showAll: boolean;
    onToggleShowAll: () => void;
    onItemChange: (item: string) => void;
    value: string;
  }) => {
    const displayedItems = getDisplayedItems(items, showAll);
    const hasMore = items.length > INITIAL_DISPLAY_LIMIT;

    return (
      <AccordionItem
        value={value}
        className="border-b border-primary/10 last:border-b-0"
      >
        <AccordionTrigger className="px-3 py-4 font-headline text-lg transition-colors duration-300 hover:text-primary hover:no-underline">
          <span className="font-semibold text-gray-900">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="px-3 pb-4 pt-2">
          <div className="space-y-3">
            {displayedItems.map((item) => (
              <div
                key={item}
                className="group flex items-center space-x-3 rounded-xl px-2 py-2 transition-all duration-200 hover:bg-accent/8"
              >
                <Checkbox
                  id={`${value}-${item}`}
                  onCheckedChange={() => onItemChange(item)}
                  checked={selectedItems.includes(item)}
                  className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <Label
                  htmlFor={`${value}-${item}`}
                  className="cursor-pointer font-normal text-gray-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                >
                  {item}
                </Label>
              </div>
            ))}
          </div>
          {hasMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleShowAll}
              className="mt-3 w-full justify-center rounded-xl font-medium text-primary hover:bg-primary/8 hover:text-primary"
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Thu gọn
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Xem thêm ({items.length - INITIAL_DISPLAY_LIMIT})
                </>
              )}
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="border-b border-primary/10 bg-[radial-gradient(circle_at_top,hsl(var(--accent)/0.18),transparent_30%),linear-gradient(90deg,hsl(var(--primary)/0.08),transparent_55%)]">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="mb-3 font-headline text-5xl font-bold text-primary">
              Khám phá sản phẩm
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-lg text-gray-600">
              Khám phá kính, vòng cổ và khuyên tai phù hợp với phong cách và nhu
              cầu của bạn.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <aside className="self-start">
              <div className="overflow-hidden rounded-2xl border border-primary/10 bg-white/95 shadow-[0_22px_50px_-32px_hsl(var(--primary)/0.34)] backdrop-blur">
                <div className="border-b border-primary/10 bg-[linear-gradient(135deg,hsl(var(--primary)/0.08),hsl(var(--accent)/0.08))] p-4">
                  <h2 className="font-headline text-xl font-bold text-gray-900">
                    Bộ lọc
                  </h2>
                </div>
                <Accordion
                  type="multiple"
                  defaultValue={["category", "brand", "material"]}
                  className="w-full"
                >
                  <FilterSection
                    title="Danh mục"
                    items={categories}
                    selectedItems={selectedCategories}
                    showAll={showAllCategories}
                    onToggleShowAll={() =>
                      setShowAllCategories(!showAllCategories)
                    }
                    onItemChange={handleCategoryChange}
                    value="category"
                  />
                  <FilterSection
                    title="Thương hiệu"
                    items={brands}
                    selectedItems={selectedBrands}
                    showAll={showAllBrands}
                    onToggleShowAll={() => setShowAllBrands(!showAllBrands)}
                    onItemChange={handleBrandChange}
                    value="brand"
                  />
                  <FilterSection
                    title="Chất liệu"
                    items={materials}
                    selectedItems={selectedMaterials}
                    showAll={showAllMaterials}
                    onToggleShowAll={() =>
                      setShowAllMaterials(!showAllMaterials)
                    }
                    onItemChange={handleMaterialChange}
                    value="material"
                  />
                </Accordion>
                <div
                  aria-hidden
                  className="pointer-events-none h-10 bg-gradient-to-b from-white via-white/88 to-transparent"
                />
              </div>
            </aside>

            <div
              id="product-listing"
              className="flex min-w-0 self-start flex-col"
            >
              <div id="shop-controls-anchor" className="h-0 scroll-mt-24" />
              <div
                id="shop-controls"
                className="mb-6 rounded-2xl border border-primary/10 bg-white/95 p-4 shadow-[0_22px_50px_-34px_hsl(var(--primary)/0.3)] backdrop-blur"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/45" />
                      <Input
                        placeholder="Tìm kính, vòng cổ, khuyên tai..."
                        className="h-11 w-full rounded-xl border-primary/15 bg-background/95 pl-12 pr-4 text-base shadow-[0_16px_30px_-24px_hsl(var(--primary)/0.28)] placeholder:text-muted-foreground/80"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải sản phẩm...
                        </span>
                      ) : (
                        <span>
                          Hiển thị{" "}
                          <span className="font-bold text-gray-900">
                            {totalProducts}
                          </span>{" "}
                          sản phẩm
                        </span>
                      )}
                    </p>
                  </div>
                  <Select
                    value={sortOrder}
                    onValueChange={handleSortChange}
                    disabled={loading}
                  >
                    <SelectTrigger className="w-full rounded-xl border-primary/15 bg-background/90 shadow-[0_12px_26px_-22px_hsl(var(--primary)/0.32)] md:w-[220px]">
                      <SelectValue placeholder="Sắp xếp theo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Nổi bật</SelectItem>
                      <SelectItem value="price-asc">
                        Giá: Thấp đến cao
                      </SelectItem>
                      <SelectItem value="price-desc">
                        Giá: Cao đến thấp
                      </SelectItem>
                      <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div id="product-scroll" className="-mt-3 space-y-8 pt-3">
                {error && (
                  <Alert className="rounded-2xl border-red-200 bg-red-50 shadow-[0_18px_32px_-26px_rgba(220,38,38,0.35)]">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {loading ? (
                  <div className="flex items-center justify-center rounded-2xl border border-primary/10 bg-white/95 py-20 shadow-[0_24px_55px_-36px_hsl(var(--primary)/0.32)]">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-gray-600">
                        Đang tải sản phẩm...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {!loading && !error && products.length === 0 && (
                  <div className="rounded-2xl border border-primary/10 bg-white/95 py-20 text-center shadow-[0_24px_55px_-36px_hsl(var(--primary)/0.3)]">
                    <div className="mx-auto max-w-md">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 shadow-[0_18px_36px_-24px_hsl(var(--accent)/0.55)]">
                        <Search className="h-8 w-8 text-primary/55" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        Không tìm thấy sản phẩm
                      </h3>
                      <p className="text-gray-600">
                        Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                      </p>
                    </div>
                  </div>
                )}

                {!loading && totalPages > 1 && (
                  <Pagination className="pb-2">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage - 1);
                          }}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "rounded-xl border border-transparent hover:border-primary/15 hover:bg-primary hover:text-white"
                          }
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === page}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(page);
                                }}
                                className={
                                  currentPage === page
                                    ? "rounded-xl bg-primary text-white shadow-[0_18px_34px_-22px_hsl(var(--primary)/0.7)] hover:bg-primary/90"
                                    : "rounded-xl hover:bg-accent/10 hover:text-primary"
                                }
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(currentPage + 1);
                          }}
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "rounded-xl border border-transparent hover:border-primary/15 hover:bg-primary hover:text-white"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageInner />
    </Suspense>
  );
}
