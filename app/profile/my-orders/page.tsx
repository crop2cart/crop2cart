"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, X } from "lucide-react";

interface Order {
  $id: string;
  orderId: string;
  totalAmount: number;
  status: string;
  items: string;
  shippingAddress: string;
  phone: string;
  createdAt: number;
}

interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  price: number;
}

interface CancelDialogState {
  isOpen: boolean;
  orderId?: string;
  orderDocId?: string;
}

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelDialog, setCancelDialog] = useState<CancelDialogState>({ isOpen: false });
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customer/my-orders", {
        headers: {
          "x-user-id": user?.id || "",
          "x-user-email": user?.email || "",
        },
      });

      if (!response.ok) {
        setError("Failed to fetch orders");
        return;
      }

      const data = await response.json();
      setOrders(data);
      setError("");
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Error loading your orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelDialog.orderId) return;

    try {
      setCancelling(true);
      const response = await fetch(`/api/orders/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
          "x-user-email": user?.email || "",
        },
        body: JSON.stringify({ orderId: cancelDialog.orderId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to cancel order");
        return;
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.orderId === cancelDialog.orderId
            ? { ...order, status: "cancelled" }
            : order
        )
      );

      if (selectedOrder?.orderId === cancelDialog.orderId) {
        setSelectedOrder({ ...selectedOrder, status: "cancelled" });
      }

      setCancelDialog({ isOpen: false });
      alert("Order cancelled successfully");
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Error cancelling order");
    } finally {
      setCancelling(false);
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

  const canCancelOrder = (status: string) => {
    return status === "pending";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please login to view your orders</p>
          <Button>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-dashed bg-background sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage your orders</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 mb-6">
            <AlertCircle className="size-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <Card className="p-12 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </Card>
        ) : selectedOrder ? (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
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

            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                {canCancelOrder(selectedOrder.status) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      setCancelDialog({
                        isOpen: true,
                        orderId: selectedOrder.orderId,
                        orderDocId: selectedOrder.$id,
                      })
                    }
                  >
                    Cancel Order
                  </Button>
                )}
              </div>

              {/* Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Order Items</h3>
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

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p className="text-sm p-3 bg-muted/50 rounded">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              {/* Contact */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Contact Information</h3>
                <p className="text-sm">
                  <span className="text-muted-foreground">Phone: </span>
                  {selectedOrder.phone}
                </p>
              </div>

              {/* Total */}
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{selectedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
            <Button>Continue Shopping</Button>
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
      </main>

      {/* Cancel Confirmation Dialog */}
      {cancelDialog.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold mb-2">Cancel Order?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to cancel order {cancelDialog.orderId}? This action cannot
                be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCancelDialog({ isOpen: false })}
                  disabled={cancelling}
                >
                  Keep Order
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Order"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
