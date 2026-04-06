"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { productApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// Import AlertDialog components
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
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  Eye,
  Package,
  DollarSign,
  Calendar,
  Power,
  PowerOff,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  active: boolean;
  Brand?: { id: number; name: string };
  Shape?: { id: number; name: string };
  Material?: { id: number; name: string };
  ProductVariations?: Array<{
    id: number;
    Color: { name: string; hex_code: string };
    ProductImages: Array<{ pic_url: string }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [filteredItems, setFilteredItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "created">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // --- New state for confirmation dialog ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [items, searchTerm, sortBy, sortOrder]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.adminListProducts();
      // console.log("🔄 Admin products data:", data);
      const processedData = Array.isArray(data) ? data : [];
      setItems(processedData);
      setFilteredItems(processedData);
    } catch (e) {
      console.error("❌ Error loading products:", e);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Shape?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "price":
          aValue = a.price;
          bValue = b.price;
          break;
        case "created":
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredItems(filtered);
  };

  const handleToggleActive = async (id: number) => {
    try {
      const result = await productApi.adminToggleProductActive(id);

      const updateProductStatus = (product: Product) => {
        if (Number(product?.id) === id) {
          return { ...product, active: result.product.active };
        }
        return product;
      };

      setItems((prevItems) => prevItems.map(updateProductStatus));
      setFilteredItems((prevFilteredItems) =>
        prevFilteredItems.map(updateProductStatus)
      );
    } catch (error) {
      console.error("❌ Error in handleToggleActive:", error);
      setError("Failed to toggle product status");
    }
  };

  // --- New function to open the dialog ---
  const promptToggleActive = (product: Product) => {
    setProductToToggle(product);
    setIsDialogOpen(true);
  };

  // --- New function to handle the confirmation ---
  const confirmToggleActive = () => {
    if (productToToggle) {
      handleToggleActive(Number(productToToggle.id));
    }
    // Dialog will close automatically via onOpenChange
    // We clear the product on close (see AlertDialog onOpenChange)
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" /> New Product
            </Link>
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name, brand, or shape..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "price" | "created")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price">Sort by Price</option>
                  <option value="created">Sort by Created Date</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {sortOrder === "asc" ? "↑" : "↓"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500">Loading products...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products ({filteredItems.length} of {items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-3 pr-4 font-medium">Product</th>
                      <th className="py-3 pr-4 font-medium">Brand</th>
                      <th className="py-3 pr-4 font-medium">Shape</th>
                      <th className="py-3 pr-4 font-medium">Price</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 pr-4 font-medium">Variations</th>
                      <th className="py-3 pr-4 font-medium">Created</th>
                      <th className="py-3 pr-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b last:border-0 hover:bg-gray-50"
                      >
                        <td className="py-3 pr-4">
                          <div>
                            <div className="font-medium">{p.name}</div>
                            {p.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {p.Brand ? (
                            <Badge variant="secondary">{p.Brand.name}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          {p.Shape ? (
                            <Badge variant="outline">{p.Shape.name}</Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">
                              {Number.isFinite(Number(p.price))
                                ? Number(p.price).toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {
                            <Badge
                              variant={
                                p.active !== true ? "default" : "secondary"
                              }
                              className={
                                p.active !== true
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-600"
                              }
                            >
                              {p.active !== true ? "Active" : "Inactive"}
                            </Badge>
                          }
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-1">
                            {p.ProductVariations?.slice(0, 3).map(
                              (variation) => (
                                <div
                                  key={variation.id}
                                  className="w-4 h-4 rounded-full border"
                                  style={{
                                    backgroundColor: variation.Color?.hex_code,
                                  }}
                                  title={variation.Color?.name}
                                />
                              )
                            )}
                            {p.ProductVariations &&
                              p.ProductVariations.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{p.ProductVariations.length - 3}
                                </span>
                              )}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {p.createdAt
                              ? new Date(p.createdAt).toLocaleDateString()
                              : "-"}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/shop/${p.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/products/${p.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                p.active !== true ? "destructive" : "default"
                              }
                              // --- Updated onClick handler ---
                              onClick={() => {
                                promptToggleActive(p);
                              }}
                              title={
                                p.active !== true
                                  ? "Deactivate product"
                                  : "Activate product"
                              }
                            >
                              {p.active !== true ? (
                                <PowerOff className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredItems.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? "No products found matching your search."
                      : "No products found."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- New Confirmation Dialog --- */}
      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setProductToToggle(null); // Clear selection when dialog closes
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will change the status of the product:
              <br />
              <strong className="font-medium">{productToToggle?.name}</strong>
              <br />
              You are about to{" "}
              <strong className="uppercase">
                {productToToggle?.active !== true ? "Deactivate" : "Activate"}
              </strong>{" "}
              this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleActive}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
