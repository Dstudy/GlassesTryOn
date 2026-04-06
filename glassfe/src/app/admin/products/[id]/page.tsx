"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { productApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  Palette,
  Plus,
  Trash2,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  subtitle?: string;
  price: number;
  description?: string;
  size?: string;
  Brand?: { id: number; name: string };
  Shape?: { id: number; name: string };
  Material?: { id: number; name: string };
  ProductFeatures?: Array<{ id: number; name: string; img?: string }>;
  ProductVariations?: Array<{
    id: number;
    Color: { name: string; hex_code: string };
    ProductImages: Array<{ pic_url: string; display_order: number }>;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminEditProductPage() {
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [shapes, setShapes] = useState<Array<{ id: number; name: string }>>([]);
  const [materials, setMaterials] = useState<
    Array<{ id: number; name: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const [brandsList, shapesList, materialsList] = await Promise.all([
          productApi.adminGetBrands(),
          productApi.adminGetShapes(),
          productApi.adminGetMaterials(),
        ]);
        setBrands(brandsList);
        setShapes(shapesList);
        setMaterials(materialsList);
      } catch {
        // ignore load errors for now
      }
    })();
  }, []);
  const { id } = useParams();
  const router = useRouter();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({
    name: "",
    subtitle: "",
    price: "",
    description: "",
    size: "",
    brand_id: "",
    shape_id: "",
    material_id: "",
  });
  const [features, setFeatures] = useState<
    Array<{ id?: number; name: string; img?: string }>
  >([]);
  const [availableFeatures, setAvailableFeatures] = useState<
    Array<{ id?: number; name: string; img?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productApi.adminGetProduct(productId);
      setProduct(data);
      setForm({
        name: data?.name ?? "",
        subtitle: data?.subtitle ?? "",
        price: String(data?.price ?? ""),
        description: data?.description ?? "",
        size: data?.size ?? "",
        brand_id: data?.Brand?.id ?? "",
        shape_id: data?.Shape?.id ?? "",
        material_id: data?.Material?.id ?? "",
      });
      const rawFeatures = Array.isArray((data as any)?.ProductFeatures)
        ? (data as any).ProductFeatures
        : Array.isArray((data as any)?.features)
        ? (data as any).features
        : [];
      setFeatures(
        rawFeatures
          .map((f: any) => ({
            id: f.id,
            name: f.name ?? f.title,
            img: f.img ?? f.image,
          }))
          .filter((f: any) => f.name)
      );
    } catch (e) {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load available features for admin to choose from
    (async () => {
      try {
        const list = await productApi.getFeatures();
        setAvailableFeatures(list);
      } catch (e) {
        // ignore feature load errors for now
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await productApi.adminUpdateProduct(productId, {
        name: form.name,
        subtitle: form.subtitle,
        price: Number(form.price),
        description: form.description,
        size: form.size,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        shape_id: form.shape_id ? Number(form.shape_id) : null,
        material_id: form.material_id ? Number(form.material_id) : null,
      });

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (error) {
      setError("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Product #{productId}
            </h1>
            <p className="text-gray-600">
              Update product information and variations
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-gray-500">Loading product...</div>
          </div>
        ) : (
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitle">Subtitle</Label>
                      <Input
                        id="subtitle"
                        value={form.subtitle}
                        onChange={(e) =>
                          setForm({ ...form, subtitle: e.target.value })
                        }
                        placeholder="Short subtitle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={form.price}
                          onChange={(e) =>
                            setForm({ ...form, price: e.target.value })
                          }
                          placeholder="0.00"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Input
                        id="size"
                        value={form.size}
                        onChange={(e) =>
                          setForm({ ...form, size: e.target.value })
                        }
                        placeholder="e.g. Small/Medium or 52-18-140"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand_id">Brand</Label>
                      <select
                        id="brand_id"
                        value={form.brand_id}
                        onChange={(e) =>
                          setForm({ ...form, brand_id: e.target.value })
                        }
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select brand</option>
                        {brands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shape_id">Shape</Label>
                      <select
                        id="shape_id"
                        value={form.shape_id}
                        onChange={(e) =>
                          setForm({ ...form, shape_id: e.target.value })
                        }
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select shape</option>
                        {shapes.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="material_id">Material</Label>
                      <select
                        id="material_id"
                        value={form.material_id}
                        onChange={(e) =>
                          setForm({ ...form, material_id: e.target.value })
                        }
                        className="w-full border rounded px-2 py-1"
                      >
                        <option value="">Select material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-600">{success}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4">
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/admin/products")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Product Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {features.map((f, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                      >
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input
                            value={f.name}
                            onChange={(e) => {
                              const copy = features.slice();
                              copy[idx] = {
                                ...copy[idx],
                                name: e.target.value,
                              };
                              setFeatures(copy);
                            }}
                            placeholder="Anti-scratch coating"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Image URL</Label>
                          <Input
                            value={f.img ?? ""}
                            onChange={(e) => {
                              const copy = features.slice();
                              copy[idx] = { ...copy[idx], img: e.target.value };
                              setFeatures(copy);
                            }}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            onClick={() =>
                              setFeatures(features.filter((_, i) => i !== idx))
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Label>Available Features</Label>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {availableFeatures.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No features available
                        </div>
                      ) : (
                        availableFeatures.map((af) => {
                          const isSelected = features.some((x) =>
                            af.id !== undefined && x.id !== undefined
                              ? x.id === af.id
                              : x.name === af.name
                          );
                          const toggle = () => {
                            if (isSelected) {
                              setFeatures(
                                features.filter((x) =>
                                  af.id !== undefined && x.id !== undefined
                                    ? x.id !== af.id
                                    : x.name !== af.name
                                )
                              );
                            } else {
                              setFeatures([
                                ...features,
                                { id: af.id, name: af.name, img: af.img },
                              ]);
                            }
                          };

                          return (
                            <label
                              key={af.id ?? af.name}
                              className="flex items-center gap-2 border rounded-md p-2 cursor-pointer"
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(v) => {
                                  // Radix Checkbox returns boolean or "indeterminate"; handle accordingly
                                  const truthy = v as boolean;
                                  if (truthy) {
                                    if (!isSelected) {
                                      setFeatures([
                                        ...features,
                                        {
                                          id: af.id,
                                          name: af.name,
                                          img: af.img,
                                        },
                                      ]);
                                    }
                                  } else {
                                    if (isSelected) {
                                      setFeatures(
                                        features.filter((x) =>
                                          af.id !== undefined &&
                                          x.id !== undefined
                                            ? x.id !== af.id
                                            : x.name !== af.name
                                        )
                                      );
                                    }
                                  }
                                }}
                              />
                              {af.img ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={af.img}
                                  alt={af.name}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : null}
                              <div className="text-sm">{af.name}</div>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFeatures([...features, { name: "", img: "" }])
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Feature
                    </Button>
                    <Button
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await productApi.adminSetProductFeatures(
                            productId,
                            features
                          );
                          setSuccess("Features updated successfully!");
                          await loadProduct();
                        } catch (e) {
                          setError("Failed to update features");
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      <Save className="h-4 w-4 mr-1" /> Save Features
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="variations">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Product Variations & Images
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product?.ProductVariations &&
                  product.ProductVariations.length > 0 ? (
                    <div className="space-y-4">
                      {product.ProductVariations.map((variation, vIdx) => (
                        <div
                          key={variation.id}
                          className="p-4 border rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-full border"
                                style={{
                                  backgroundColor: variation.Color?.hex_code,
                                }}
                              />
                              <div>
                                <p className="font-medium">
                                  {variation.Color?.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {variation.ProductImages?.length || 0} images
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Allow admin to edit the single main image for this variation */}
                              <input
                                type="text"
                                placeholder="Image URL (single)"
                                value={
                                  variation.ProductImages &&
                                  variation.ProductImages[0]
                                    ? variation.ProductImages[0].pic_url
                                    : ""
                                }
                                onChange={(e) => {
                                  // update local product state to reflect the changed image URL
                                  const copy = { ...product } as any;
                                  const pv = copy.ProductVariations.find(
                                    (p: any) => p.id === variation.id
                                  );
                                  if (pv) {
                                    pv.ProductImages = pv.ProductImages
                                      ? pv.ProductImages.slice()
                                      : [];
                                    if (pv.ProductImages.length === 0)
                                      pv.ProductImages.push({
                                        pic_url: e.target.value,
                                        display_order: 0,
                                      });
                                    else
                                      pv.ProductImages[0].pic_url =
                                        e.target.value;
                                    setProduct(copy);
                                  }
                                }}
                                className="border px-2 py-1 rounded w-64"
                              />

                              <Button
                                size="sm"
                                onClick={async () => {
                                  // Save single image for this variation via admin endpoint
                                  try {
                                    setSaving(true);
                                    setError(null);
                                    const url =
                                      (product as any).ProductVariations.find(
                                        (p: any) => p.id === variation.id
                                      )?.ProductImages?.[0]?.pic_url || null;
                                    // best-effort endpoint; backend may expect different shape
                                    await fetch(
                                      `${
                                        process.env.NEXT_PUBLIC_API_URL ||
                                        "http://localhost:8000"
                                      }/api/admin/variations/${
                                        variation.id
                                      }/image`,
                                      {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({ pic_url: url }),
                                      }
                                    );
                                    setSuccess("Variation image updated");
                                    await loadProduct();
                                  } catch (e) {
                                    setError(
                                      "Failed to update variation image"
                                    );
                                  } finally {
                                    setSaving(false);
                                  }
                                }}
                              >
                                Save Image
                              </Button>

                              {/* Reorder controls for images of this variation (move first image up/down within product images order) */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  // Move this variation's first image up in global product image order
                                  try {
                                    setSaving(true);
                                    setError(null);
                                    const pv = (
                                      product as any
                                    ).ProductVariations.find(
                                      (p: any) => p.id === variation.id
                                    );
                                    const firstUrl =
                                      pv?.ProductImages?.[0]?.pic_url;
                                    if (!firstUrl)
                                      return setError("No image to reorder");
                                    // best-effort endpoint; backend may support a product images reorder endpoint
                                    await fetch(
                                      `${
                                        process.env.NEXT_PUBLIC_API_URL ||
                                        "http://localhost:8000"
                                      }/api/admin/products/${productId}/images/reorder`,
                                      {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          pic_url: firstUrl,
                                          direction: "up",
                                        }),
                                      }
                                    );
                                    setSuccess("Image order updated");
                                    await loadProduct();
                                  } catch (e) {
                                    setError("Failed to reorder images");
                                  } finally {
                                    setSaving(false);
                                  }
                                }}
                              >
                                Move Up
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    setSaving(true);
                                    setError(null);
                                    const pv = (
                                      product as any
                                    ).ProductVariations.find(
                                      (p: any) => p.id === variation.id
                                    );
                                    const firstUrl =
                                      pv?.ProductImages?.[0]?.pic_url;
                                    if (!firstUrl)
                                      return setError("No image to reorder");
                                    await fetch(
                                      `${
                                        process.env.NEXT_PUBLIC_API_URL ||
                                        "http://localhost:8000"
                                      }/api/admin/products/${productId}/images/reorder`,
                                      {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          pic_url: firstUrl,
                                          direction: "down",
                                        }),
                                      }
                                    );
                                    setSuccess("Image order updated");
                                    await loadProduct();
                                  } catch (e) {
                                    setError("Failed to reorder images");
                                  } finally {
                                    setSaving(false);
                                  }
                                }}
                              >
                                Move Down
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  try {
                                    setSaving(true);
                                    setError(null);
                                    // delete the first image for this variation
                                    const pv = (
                                      product as any
                                    ).ProductVariations.find(
                                      (p: any) => p.id === variation.id
                                    );
                                    const first = pv?.ProductImages?.[0];
                                    if (!first)
                                      return setError("No image to remove");
                                    await fetch(
                                      `${
                                        process.env.NEXT_PUBLIC_API_URL ||
                                        "http://localhost:8000"
                                      }/api/admin/variations/${
                                        variation.id
                                      }/images`,
                                      {
                                        method: "DELETE",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          pic_url: first.pic_url,
                                        }),
                                      }
                                    );
                                    setSuccess("Image removed");
                                    await loadProduct();
                                  } catch (e) {
                                    setError("Failed to remove image");
                                  } finally {
                                    setSaving(false);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Palette className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No variations found for this product.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminLayout>
  );
}
