"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Loader2, AlertCircle, X } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  $id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: number;
  shippingAddress: string;
  phone: string;
  items?: string;
  updatedAt?: number;
}

interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const tabs = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    if (user?.email) {
      fetchOrders(activeTab);
    }
  }, [activeTab, user?.email]);

  const fetchOrders = async (status: string) => {
    try {
      setLoading(true);
      if (!user?.email) {
        setError("Admin email not found");
        return;
      }

      const response = await fetch(`/api/admin/orders-list?status=${status}`, {
        headers: {
          "x-admin-email": user.email,
        },
      });

      if (!response.ok) {
        setError("Failed to fetch orders");
        return;
      }

      const result = await response.json();
      setOrders(result);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const parseItems = (itemsString?: string): OrderItem[] => {
    if (!itemsString) return [];
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!selectedOrder || !user?.email) return;

    try {
      setUpdating(true);
      setUpdateError("");

      const response = await fetch("/api/admin/update-order-status", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-email": user.email,
        },
        body: JSON.stringify({
          orderId: selectedOrder.orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setUpdateError(errorData.error || "Failed to update status");
        return;
      }

      const result = await response.json();

      // Update local state
      const updatedOrder = { ...selectedOrder, status: newStatus };
      setSelectedOrder(updatedOrder);
      setOrders(
        orders.map((o) =>
          o.orderId === selectedOrder.orderId ? updatedOrder : o
        )
      );

      setUpdateError("");
    } catch (err) {
      console.error("Error updating status:", err);
      setUpdateError("Error updating order status");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Order Management</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">View and manage all customer orders</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-600">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {selectedOrder ? (
        <Card className="p-3 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-xl font-bold line-clamp-1">{selectedOrder.orderId}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(null)}
              className="flex-shrink-0"
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="border-b pb-3 sm:pb-4">
              <h4 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Customer Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Name</p>
                  <p className="font-medium truncate">{selectedOrder.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{selectedOrder.userEmail}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Order Date</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-3">Shipping Address</h4>
              <p className="text-sm p-3 bg-muted/50 rounded">
                {selectedOrder.shippingAddress}
              </p>
            </div>

            {/* Order Items */}
            <div className="border-b pb-4">
              <h4 className="font-semibold mb-3">Order Items</h4>
              <div className="space-y-2">
                {parseItems(selectedOrder.items).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between p-3 bg-muted/50 rounded"
                  >
                    <div className="text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status and Total */}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Change Status</p>
                {updateError && (
                  <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">
                    {updateError}
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {["pending", "shipped", "completed", "cancelled"].map((status) => (
                    <Button
                      key={status}
                      variant={
                        selectedOrder.status === status ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => updateOrderStatus(status)}
                      disabled={updating || selectedOrder.status === status}
                      className="capitalize"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="size-3 animate-spin mr-1" />
                        </>
                      ) : null}
                      {status}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      statusColors[selectedOrder.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedOrder.status.charAt(0).toUpperCase() +
                      selectedOrder.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 text-xs sm:text-sm">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value}>
                <Card>
                  {loading ? (
                    <div className="flex items-center justify-center p-6 sm:p-8">
                      <Loader2 className="size-5 sm:size-6 animate-spin text-primary" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-muted-foreground">
                      No {tab.label.toLowerCase()} found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs sm:text-sm">Order ID</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Customer</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden md:table-cell">Email</TableHead>
                            <TableHead className="text-xs sm:text-sm">Total</TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Date</TableHead>
                            <TableHead className="text-xs sm:text-sm">Status</TableHead>
                            <TableHead className="text-xs sm:text-sm">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.$id}>
                              <TableCell className="font-medium text-blue-600 text-xs sm:text-sm">
                                {order.orderId}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden sm:table-cell truncate">
                                {order.userName}
                              </TableCell>
                              <TableCell className="text-xs hidden md:table-cell truncate">
                                {order.userEmail}
                              </TableCell>
                              <TableCell className="font-semibold text-xs sm:text-sm">
                                ₹{order.totalAmount.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                                {formatDate(order.createdAt)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                                    statusColors[order.status] ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {order.status
                                    .charAt(0)
                                    .toUpperCase() + order.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedOrder(order)}
                                  className="gap-1 text-xs sm:text-sm"
                                >
                                  <Eye className="size-3" />
                                  <span className="hidden sm:inline">View</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
