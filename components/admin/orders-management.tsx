"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2, X } from "lucide-react";

interface Order {
  $id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  items: string;
  shippingAddress: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const tabs = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "shipped", label: "Shipped" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab]);

  const fetchOrders = async (status: string) => {
    try {
      setLoading(true);
      const adminEmail = localStorage.getItem("userEmail");
      if (!adminEmail) {
        setError("Admin email not found");
        return;
      }

      const res = await fetch(`/api/admin/orders-list?status=${status}`, {
        headers: {
          "x-admin-email": adminEmail,
        },
      });

      if (!res.ok) {
        setError("Failed to fetch orders");
        return;
      }

      const data = await res.json();
      setOrders(data);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error loading orders");
    } finally {
      setLoading(false);
    }
  };

  const parseItems = (itemsString: string): OrderItem[] => {
    try {
      return JSON.parse(itemsString);
    } catch {
      return [];
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
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          <AlertCircle className="size-4" />
          <span>{error}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {loading ? (
              <Card className="p-8 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </Card>
            ) : orders.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No {tab.label.toLowerCase()} found
              </Card>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card
                    key={order.$id}
                    className="p-4 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-semibold text-blue-600">{order.orderId}</p>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.userName} • {order.userEmail}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {parseItems(order.items).length} items
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-bold text-blue-600">{selectedOrder.orderId}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Customer Info */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Customer Information</h3>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Name:</span> {selectedOrder.userName}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Email:</span> {selectedOrder.userEmail}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Phone:</span> {selectedOrder.phone}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Address:</span>{" "}
                    {selectedOrder.shippingAddress}
                  </p>
                </div>

                {/* Items */}
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {parseItems(selectedOrder.items).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.variant} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-medium">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status & Total */}
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Status</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-blue-600">
                    ₹{selectedOrder.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
