"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter, // <-- Added CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShoppingCart,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { adminOrdersApi, ApiError } from "@/lib/api";

interface Order {
  id: number;
  user_id: number;
  total_amount: number | string; // Backend might return string
  status: string;
  created_at: string;
  updated_at: string;
  delivery_date?: string;
  shipping_cost?: number | string;
  note?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  item_count?: number; // Backend provides this field
  user?: {
    id: number;
    name: string;
    email: string;
  };
  order_items?: Array<{
    id: number;
    quantity: number;
    price_at_purchase: number | string;
    product_variation_id: number;
    product_variation?: {
      id: number;
      price: number | string;
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

// --- Pagination constant ---
const ORDERS_PER_PAGE = 15;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  // --- New state for pagination ---
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await adminOrdersApi.getAllOrders();
      console.log("Orders data received:", ordersData);
      console.log("First order structure:", ordersData[0]);
      console.log(
        "First order total_amount type:",
        typeof ordersData[0]?.total_amount
      );
      setOrders(ordersData);
    } catch (err) {
      console.error("Failed to load orders:", err);
      if (err instanceof ApiError) {
        setError(`Failed to load orders: ${err.message}`);
      } else {
        setError("Failed to load orders data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      await adminOrdersApi.updateOrderStatus(orderId, newStatus);
      // Reload orders to get updated data
      await loadOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
      if (err instanceof ApiError) {
        setError(`Failed to update order status: ${err.message}`);
      } else {
        setError("Failed to update order status. Please try again.");
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setUpdatingStatus(orderId);
      await adminOrdersApi.cancelOrder(orderId);
      // Reload orders to get updated data
      await loadOrders();
    } catch (err) {
      console.error("Failed to cancel order:", err);
      if (err instanceof ApiError) {
        setError(`Failed to cancel order: ${err.message}`);
      } else {
        setError("Failed to cancel order. Please try again.");
      }
    } finally {
      setUpdatingStatus(null);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // --- Reset page to 1 when filter changes ---
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "shipped":
        return <Truck className="h-4 w-4 text-purple-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

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

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === filter.toLowerCase()
        );

  // --- Pagination Calculations ---
  const totalPageCount = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const pagedOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };
  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPageCount));
  };

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status.toLowerCase() === "pending").length,
    processing: orders.filter((o) => o.status.toLowerCase() === "processing")
      .length,
    shipped: orders.filter((o) => o.status.toLowerCase() === "shipped").length,
    completed: orders.filter((o) => o.status.toLowerCase() === "completed")
      .length,
    cancelled: orders.filter((o) => o.status.toLowerCase() === "cancelled")
      .length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalItems = (order: Order) => {
    // Use item_count from backend if available, otherwise calculate from order_items
    return (
      order.item_count ||
      order.order_items?.reduce((total, item) => total + item.quantity, 0) ||
      0
    );
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
            <RefreshCw className="h-5 w-5 animate-spin" />
            <div className="text-lg text-gray-500">Loading orders...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">
              Manage customer orders and fulfillment
            </p>
          </div>
          <Button onClick={loadOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status} ({count})
            </Button>
          ))}
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-3 pr-4 font-medium">Order ID</th>
                    <th className="py-3 pr-4 font-medium">Customer</th>
                    <th className="py-3 pr-4 font-medium">Email</th>
                    <th className="py-3 pr-4 font-medium">Items</th>
                    <th className="py-3 pr-4 font-medium">Amount</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Date</th>
                    <th className="py-3 pr-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* --- Updated to map pagedOrders --- */}
                  {pagedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 pr-4 font-medium">#{order.id}</td>
                      <td className="py-3 pr-4">
                        {order.user?.name || "Unknown"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {order.user?.email || "N/A"}
                      </td>
                      <td className="py-3 pr-4">{getTotalItems(order)}</td>
                      <td className="py-3 pr-4 font-medium">
                        ${formatAmount(order.total_amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`${getStatusColor(
                              order.status
                            )} flex items-center w-fit`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">
                              {order.status}
                            </span>
                          </Badge>
                          {order.status.toLowerCase() !== "cancelled" &&
                            order.status.toLowerCase() !== "completed" && (
                              <Select
                                value={order.status}
                                onValueChange={(value) =>
                                  handleStatusUpdate(order.id, value)
                                }
                                disabled={updatingStatus === order.id}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="processing">
                                    Processing
                                  </SelectItem>
                                  <SelectItem value="shipped">
                                    Shipped
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(`/admin/orders/${order.id}`, "_blank")
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {order.status.toLowerCase() !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={updatingStatus === order.id}
                            >
                              {updatingStatus === order.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          {/* --- New Pagination Footer --- */}
          {totalPageCount > 1 && (
            <CardFooter className="flex items-center justify-between py-4">
              <div className="text-sm text-gray-500">
                Showing{" "}
                <strong>
                  {Math.min(startIndex + 1, filteredOrders.length)}
                </strong>
                -<strong>{Math.min(endIndex, filteredOrders.length)}</strong> of{" "}
                <strong>{filteredOrders.length}</strong> orders
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={
                    currentPage === totalPageCount || totalPageCount === 0
                  }
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
