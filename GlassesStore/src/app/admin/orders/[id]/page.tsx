"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Package,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { adminOrdersApi, ApiError } from "@/lib/api";

interface OrderDetail {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  delivery_date?: string;
  shipping_cost?: number;
  note?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order_items?: Array<{
    id: number;
    quantity: number;
    price_at_purchase: number;
    product_variation_id: number;
    product_variation?: {
      id: number;
      price: number;
      product?: {
        id: number;
        name: string;
      };
      color?: {
        name: string;
      };
    };
  }>;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const orderId = Number(id);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const orderData = await adminOrdersApi.getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        console.error("Failed to load order:", err);
        if (err instanceof ApiError) {
          setError(`Failed to load order: ${err.message}`);
        } else {
          setError("Failed to load order data. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatAmount = (amount: any) => {
    const numAmount =
      typeof amount === "string" ? parseFloat(amount) : Number(amount);
    return isNaN(numAmount) ? "0.00" : numAmount.toFixed(2);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="text-lg text-gray-500">
              Loading order details...
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back to orders
          </Link>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Order not found"}</AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <Link
          href="/admin/orders"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4" /> Back to orders
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.id}
            </h1>
            <p className="text-gray-600">
              Order details and customer information
            </p>
          </div>
          <Badge
            className={`${getStatusColor(order.status)} text-sm px-3 py-1`}
          >
            {order.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-lg">{order.user?.name || "Unknown"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-lg">{order.user?.email || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  User ID
                </label>
                <p className="text-lg">#{order.user_id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Order Date
                </label>
                <p className="text-lg">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Amount
                </label>
                <p className="text-lg font-semibold">
                  ${formatAmount(order.total_amount)}
                </p>
              </div>
              {order.shipping_cost && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Shipping Cost
                  </label>
                  <p className="text-lg">
                    ${formatAmount(order.shipping_cost)}
                  </p>
                </div>
              )}
              {order.delivery_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Delivery Date
                  </label>
                  <p className="text-lg">{formatDate(order.delivery_date)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Shipping Address */}
        {(order.address || order.province || order.district || order.ward) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.address && <p>{order.address}</p>}
                <div className="flex gap-2 text-sm text-gray-600">
                  {order.ward && <span>{order.ward},</span>}
                  {order.district && <span>{order.district},</span>}
                  {order.province && <span>{order.province}</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({order.order_items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.order_items && order.order_items.length > 0 ? (
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {item.product_variation?.product?.name ||
                          "Unknown Product"}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      {item.product_variation?.color && (
                        <p className="text-sm text-gray-600">
                          Color: {item.product_variation.color.name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${formatAmount(item.price_at_purchase)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: $
                        {formatAmount(item.price_at_purchase * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No items found</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {order.note && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.note}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
