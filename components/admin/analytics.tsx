"use client";

import { Card } from "@/components/ui/card";
import { ShoppingCart, Users, Leaf, TrendingUp, AlertCircle, CheckCircle, Truck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  shippedOrders: number;
  averageOrderValue: number;
}

interface Order {
  $id: string;
  orderId: string;
  userName: string;
  totalAmount: number;
  status: string;
  items: string;
  createdAt: number;
}

export function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        if (!user?.email) {
          setError("Admin email not found");
          setLoading(false);
          return;
        }

        const [analyticsRes, ordersRes] = await Promise.all([
          fetch("/api/admin/analytics", {
            headers: {
              "x-admin-email": user.email,
            },
          }),
          fetch("/api/admin/orders-list?status=all", {
            headers: {
              "x-admin-email": user.email,
            },
          }),
        ]);

        if (!analyticsRes.ok || !ordersRes.ok) {
          setError("Failed to fetch analytics data");
          return;
        }

        const analyticsData = await analyticsRes.json();
        const ordersData = await ordersRes.json();

        setAnalytics(analyticsData);
        setRecentOrders(ordersData.slice(0, 5)); // Show last 5 orders
      } catch (err) {
        console.error("Analytics error:", err);
        setError("Error loading analytics");
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchAnalytics();
    }
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="size-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Orders",
      value: analytics.totalOrders.toString(),
      change: `₹${(analytics.totalRevenue / 1000).toFixed(1)}K revenue`,
      icon: ShoppingCart,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Total Revenue",
      value: `₹${analytics.totalRevenue.toLocaleString()}`,
      change: `Avg: ₹${analytics.averageOrderValue.toFixed(0)}`,
      icon: TrendingUp,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "Pending Orders",
      value: analytics.pendingOrders.toString(),
      change: `Awaiting processing`,
      icon: AlertCircle,
      color: "bg-yellow-500/10 text-yellow-600",
    },
    {
      label: "Completed Orders",
      value: analytics.completedOrders.toString(),
      change: `Successfully delivered`,
      icon: CheckCircle,
      color: "bg-emerald-500/10 text-emerald-600",
    },
    {
      label: "Shipped Orders",
      value: analytics.shippedOrders.toString(),
      change: `In transit`,
      icon: Truck,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "Cancelled Orders",
      value: analytics.cancelledOrders.toString(),
      change: `User cancelled`,
      icon: XCircle,
      color: "bg-red-500/10 text-red-600",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50";
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-1">
                    {stat.label}
                  </p>
                  <p className="text-lg sm:text-xl font-bold mb-1 line-clamp-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{stat.change}</p>
                </div>
                <div className={`p-2 rounded-lg flex-shrink-0 ${stat.color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-sm text-muted-foreground">
                  <th className="text-left py-3 px-3 font-medium">Order ID</th>
                  <th className="text-left py-3 px-3 font-medium">Customer</th>
                  <th className="text-right py-3 px-3 font-medium">Amount</th>
                  <th className="text-center py-3 px-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order, index) => (
                  <tr key={index} className="text-sm hover:bg-muted/50 transition">
                    <td className="py-3 px-3 font-medium text-blue-600">{order.orderId}</td>
                    <td className="py-3 px-3">{order.userName}</td>
                    <td className="py-3 px-3 text-right font-semibold">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{analytics.pendingOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">Awaiting processing</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-blue-500">
          <p className="text-sm text-muted-foreground mb-1">Shipped</p>
          <p className="text-2xl font-bold text-blue-600">{analytics.shippedOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">In transit</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <p className="text-sm text-muted-foreground mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{analytics.completedOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">Delivered</p>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <p className="text-sm text-muted-foreground mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{analytics.cancelledOrders}</p>
          <p className="text-xs text-muted-foreground mt-2">User cancelled</p>
        </Card>
      </div>
    </div>
  );
}
