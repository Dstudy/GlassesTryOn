"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { analyticsApi, ApiError } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AnalyticsData {
  summary: {
    [key: string]: {
      value: number;
      growth_rate: number;
      previous_value: number;
    };
  };
  monthly_revenue: Array<{
    period: string;
    month_name: string;
    revenue: number;
  }>;
  top_products: Array<{
    rank: number;
    product_name: string;
    sales: number;
    revenue: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await analyticsApi.getDashboardMetrics();
      console.log("Analytics data received:", analyticsData);
      console.log("Summary structure:", analyticsData?.summary);
      setData(analyticsData);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      if (err instanceof ApiError) {
        setError(`Failed to load analytics: ${err.message}`);
      } else {
        setError("Failed to load analytics data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAnalytics = async () => {
    try {
      setUpdating(true);
      await analyticsApi.updateAnalytics();
      // Reload data after update
      await loadAnalyticsData();
    } catch (err) {
      console.error("Failed to update analytics:", err);
      if (err instanceof ApiError) {
        setError(`Failed to update analytics: ${err.message}`);
      } else {
        setError("Failed to update analytics. Please try again.");
      }
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <div className="text-lg text-gray-500">Đang tải phân tích...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Phân tích</h1>
              <p className="text-gray-600">
                Theo dõi hiệu suất cửa hàng và các số liệu quan trọng
              </p>
            </div>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={loadAnalyticsData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
            <Button onClick={handleUpdateAnalytics} disabled={updating}>
              {updating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Cập nhật phân tích
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) return null;

  const metrics = [
    {
      title: "Tổng doanh thu",
      value: `$${data.summary.total_revenue?.value?.toLocaleString() || "0"}`,
      icon: DollarSign,
      growth: data.summary.total_revenue?.growth_rate || 0,
      color: "text-green-600",
    },
    {
      title: "Tổng đơn hàng",
      value: data.summary.total_orders?.value?.toString() || "0",
      icon: ShoppingCart,
      growth: data.summary.total_orders?.growth_rate || 0,
      color: "text-primary",
    },
    {
      title: "Tổng khách hàng",
      value: data.summary.total_customers?.value?.toString() || "0",
      icon: Users,
      growth: data.summary.total_customers?.growth_rate || 0,
      color: "text-accent",
    },
    {
      title: "Tổng sản phẩm",
      value: data.summary.total_products?.value?.toString() || "0",
      icon: Package,
      growth: 0,
      color: "text-gray-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Phân tích</h1>
            <p className="text-gray-600">
              Theo dõi hiệu suất cửa hàng và các số liệu quan trọng
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadAnalyticsData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
            <Button onClick={handleUpdateAnalytics} disabled={updating}>
              {updating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Cập nhật phân tích
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                {metric.growth > 0 && (
                  <div className="flex items-center text-xs text-green-500 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+{metric.growth}% so với tháng trước</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Doanh thu theo tháng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.monthly_revenue.map((month) => (
                  <div
                    key={month.period}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {month.month_name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{
                            width: `${
                              (month.revenue /
                                Math.max(
                                  ...data.monthly_revenue.map((m) => m.revenue)
                                )) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        ${month.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Sản phẩm bán chạy nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.top_products.map((product) => (
                  <div
                    key={product.product_name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-3">
                        {product.rank}
                      </div>
                      <div>
                        <p className="font-medium">{product.product_name}</p>
                        <p className="text-sm text-gray-500">
                          {product.sales} lượt bán
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${product.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Tóm tắt hiệu suất</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-green-800">Tăng trưởng doanh thu</h3>
                <p className="text-2xl font-bold text-green-600">
                  +{(data.summary.total_revenue?.growth_rate || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-green-600">so với tháng trước</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-primary">Tăng trưởng đơn hàng</h3>
                <p className="text-2xl font-bold text-primary">
                  +{(data.summary.total_orders?.growth_rate || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-primary">so với tháng trước</p>
              </div>
              <div className="text-center p-4 bg-accent/15 rounded-lg">
                <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                <h3 className="font-semibold text-primary">
                  Tăng trưởng khách hàng
                </h3>
                <p className="text-2xl font-bold text-accent">
                  +{(data.summary.total_customers?.growth_rate || 0).toFixed(1)}
                  %
                </p>
                <p className="text-sm text-accent">so với tháng trước</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
