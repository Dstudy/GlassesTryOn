"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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

// Giới hạn số lượng hiển thị cho mỗi filter
const INITIAL_DISPLAY_LIMIT = 5;

export default function ShopPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("featured");
  const [selectedShapes, setSelectedShapes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // State để điều khiển việc hiển thị đầy đủ hay giới hạn
  const [showAllShapes, setShowAllShapes] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);

  // API state
  const [products, setProducts] = useState<Product[]>([]);
  const [shapes, setShapes] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const handleShapeChange = (shape: string) => {
    setSelectedShapes((prev) =>
      prev.includes(shape) ? prev.filter((s) => s !== shape) : [...prev, shape]
    );
    setCurrentPage(1);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
    setCurrentPage(1);
  };

  const handleColorChange = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
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
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters: ProductFilters = {
          search: searchTerm || undefined,
          sortBy: sortOrder as any,
          shape: selectedShapes.length > 0 ? selectedShapes[0] : undefined,
          color: selectedColors.length > 0 ? selectedColors[0] : undefined,
          brand: selectedBrands.length > 0 ? selectedBrands[0] : undefined,
          material:
            selectedMaterials.length > 0 ? selectedMaterials[0] : undefined,
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
          setShapes(filterOptions.shapes || []);
          setBrands(filterOptions.brands || []);
          setMaterials(filterOptions.materials || []);
          setColors(filterOptions.colors || []);
          setInitialLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(
          err instanceof ApiError ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    searchTerm,
    sortOrder,
    selectedShapes,
    selectedBrands,
    selectedMaterials,
    selectedColors,
    currentPage,
  ]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document
        .querySelector(".lg\\:col-span-3")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Hàm để lấy danh sách giới hạn
  const getDisplayedItems = (items: string[], showAll: boolean) => {
    return showAll ? items : items.slice(0, INITIAL_DISPLAY_LIMIT);
  };

  // Component để render filter section với "Show more/less"
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
      <AccordionItem value={value} className="border-b border-gray-200">
        <AccordionTrigger className="font-headline text-lg hover:no-underline py-4 px-3">
          <span className="font-semibold text-gray-900">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-4 px-3">
          <div className="space-y-3">
            {displayedItems.map((item) => (
              <div key={item} className="flex items-center space-x-3 group">
                <Checkbox
                  id={`${value}-${item}`}
                  onCheckedChange={() => onItemChange(item)}
                  checked={selectedItems.includes(item)}
                  className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`${value}-${item}`}
                  className="font-normal text-gray-700 cursor-pointer group-hover:text-primary transition-colors"
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
              className="mt-3 w-full text-primary hover:text-primary hover:bg-primary/5 font-medium"
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show More ({items.length - INITIAL_DISPLAY_LIMIT})
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
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="font-headline text-5xl font-bold text-primary mb-3">
              Shop Our Collection
            </h1>
            <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect pair of glasses to match your style and vision.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Search Box - Enhanced */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 border-gray-300 focus:border-primary focus:ring-primary"
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                {/* Filters - Enhanced Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="font-headline text-xl font-bold text-gray-900">
                      Filters
                    </h2>
                  </div>
                  <Accordion
                    type="multiple"
                    defaultValue={["shape", "brand", "material", "color"]}
                    className="w-full"
                  >
                    <FilterSection
                      title="Hình dáng"
                      items={shapes}
                      selectedItems={selectedShapes}
                      showAll={showAllShapes}
                      onToggleShowAll={() => setShowAllShapes(!showAllShapes)}
                      onItemChange={handleShapeChange}
                      value="shape"
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
                    <FilterSection
                      title="Màu sắc"
                      items={colors}
                      selectedItems={selectedColors}
                      showAll={showAllColors}
                      onToggleShowAll={() => setShowAllColors(!showAllColors)}
                      onItemChange={handleColorChange}
                      value="color"
                    />
                  </Accordion>
                </div>
              </div>
            </aside>

            <div className="lg:col-span-3">
              {/* Results Header - Enhanced */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-gray-200 bg-white rounded-lg shadow-sm p-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading products...
                      </span>
                    ) : (
                      <span>
                        Showing{" "}
                        <span className="font-bold text-gray-900">
                          {totalProducts}
                        </span>{" "}
                        products
                      </span>
                    )}
                  </p>
                </div>
                <Select
                  value={sortOrder}
                  onValueChange={handleSortChange}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[200px] border-gray-300">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Highest Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="mt-8 flex items-center justify-center py-20 bg-white rounded-lg shadow-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-gray-600">Loading products...</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {!loading && !error && products.length === 0 && (
                <div className="mt-8 text-center py-20 bg-white rounded-lg shadow-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your filters or search terms
                    </p>
                  </div>
                </div>
              )}

              {!loading && totalPages > 1 && (
                <Pagination className="mt-12">
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
                            : "hover:bg-primary hover:text-white"
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
                                  ? "bg-primary text-white hover:bg-primary/90"
                                  : "hover:bg-gray-100"
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
                            : "hover:bg-primary hover:text-white"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
