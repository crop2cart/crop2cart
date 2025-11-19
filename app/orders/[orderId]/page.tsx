'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useWebSocket } from '@/app/context/WebSocketContext';
import { ArrowLeft, Loader2, Package, Check, Clock, Truck, X, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  finalPrice?: number;
  price?: number;
  variant?: string;
}

interface Order {
  id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  phone: string;
  createdAt: number;
  updatedAt: number;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const { isConnected, subscribe } = useWebSocket();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/home');
      return;
    }

    if (params.orderId) {
      fetchOrderDetails(params.orderId as string);
    }
  }, [user, loading, router, params]);

  // Subscribe to real-time order status updates
  useEffect(() => {
    if (!order?.id) return;

    const unsubscribe = subscribe('ORDER_STATUS_CHANGED', (message) => {
      // Update order if status changed for this specific order
      if (message.data.userId === user?.id && message.data.orderId === order.orderId) {
        setOrder((prevOrder) =>
          prevOrder
            ? { ...prevOrder, status: message.data.status, updatedAt: Math.floor(Date.now() / 1000) }
            : null
        );
      }
    });

    return () => unsubscribe();
  }, [order?.id, order?.orderId, user?.id, subscribe]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch(`/api/customer/orders/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.data);
      } else {
        setError(result.error || "Failed to load order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order");
    } finally {
      setOrderLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'delivered':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'processing':
      case 'in-transit':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'cancelled':
        return <X className="w-6 h-6 text-red-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'delivered':
        return 'Delivered';
      case 'processing':
        return 'Processing';
      case 'in-transit':
        return 'In Transit';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'in-transit':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading || orderLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-background border-b border-border sticky top-0 z-40">
          <div className="container py-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>
        <div className="container py-8 text-center">
          <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error loading order</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-border sticky top-0 z-40">
        <div className="container py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4"
          >
            <ArrowLeft size={18} />
            Back to Orders
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Details</h1>
              <p className="text-muted-foreground mt-1">Order {order.orderId}</p>
            </div>
            <div className="flex items-center gap-3">
              {isConnected ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-green-700">Live</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs font-medium text-yellow-700">Connecting...</span>
                </div>
              )}
              <button
                onClick={() => fetchOrderDetails(params.orderId as string)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                title="Refresh order status"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className={`border rounded-lg p-6 ${getStatusColor(order.status)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <p className="text-sm font-medium opacity-75">Current Status</p>
                    <p className="text-2xl font-bold">{getStatusLabel(order.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-4 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                        {item.variant && ` • ${item.variant}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{Math.round((item.finalPrice || item.price || 0) * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">₹{Math.round(item.finalPrice || item.price || 0).toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total</span>
                  <span className="text-2xl font-bold text-primary">₹{Math.round(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <p className="text-base whitespace-pre-wrap">{order.shippingAddress}</p>
              {order.phone && (
                <p className="mt-4 text-sm text-muted-foreground">Phone: {order.phone}</p>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-medium">{order.orderId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="font-medium">
                    {new Date(order.createdAt * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{order.userName}</span>
                </div>
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Auto-refresh info */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-xs text-muted-foreground text-center">
                  Status updates in real-time. Refresh page to see latest updates from admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
