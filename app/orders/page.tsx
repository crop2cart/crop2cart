'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useWebSocket } from '@/app/context/WebSocketContext';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, Truck, Check, Clock, Loader2, X, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OrderCardSkeleton } from '@/components/skeletons';

interface OrderItem {
  id?: string;
  name: string;
  price?: number;
  quantity: number;
  finalPrice?: number;
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

export default function OrdersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const { isConnected, subscribe } = useWebSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders on mount
  useEffect(() => {
    if (!loading && !user) {
      router.push('/home');
      return;
    }

    if (user?.id) {
      fetchCustomerOrders(user.id);
    }
  }, [user, loading, router]);

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribe('ORDER_STATUS_CHANGED', (message) => {
      // Update order in the list if it belongs to this customer
      if (message.data.userId === user.id) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.orderId === message.data.orderId
              ? { ...order, status: message.data.status, updatedAt: Math.floor(Date.now() / 1000) }
              : order
          )
        );
      }
    });

    return () => unsubscribe();
  }, [user?.id, subscribe]);

  const fetchCustomerOrders = async (userId: string) => {
    try {
      setRefreshing(true);
      setError(null);
      const response = await fetch(`/api/customer/orders?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      } else {
        setError(result.error || "Failed to load orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
    } finally {
      setOrdersLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    switch (lowerStatus) {
      case 'delivered':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'processing':
      case 'in-transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const lowerStatus = status?.toLowerCase();
    const statusMap: { [key: string]: string } = {
      'delivered': t('orders.delivered'),
      'processing': t('orders.processing'),
      'in-transit': t('orders.shipped'),
      'pending': t('orders.pending'),
      'cancelled': t('orders.cancelled'),
    };
    return statusMap[lowerStatus] || status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
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
            Back
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('orders.title')}</h1>
              <p className="text-muted-foreground mt-1">Track and manage your orders</p>
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
                  <span className="text-xs font-medium text-yellow-700">{t('orders.connecting')}</span>
                </div>
              )}
              <button
                onClick={() => user?.id && fetchCustomerOrders(user.id)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
                title="Refresh orders"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                <span className="text-sm font-medium">{t('orders.refresh')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container py-8">
        {loading || ordersLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <OrderCardSkeleton key={idx} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('orders.error')}</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('orders.noOrders')}</h2>
            <p className="text-muted-foreground">Start shopping to place your first order!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{order.orderId}</h3>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-sm ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ordered on {new Date(order.createdAt * 1000).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">₹{Math.round(order.totalAmount).toLocaleString()}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium mb-3">Order Items</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name}{item.variant ? ` (${item.variant})` : ''} x{item.quantity}</span>
                        <span className="font-medium">₹{Math.round((item.finalPrice || item.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                    View Details
                  </button>
                  {order.status === 'delivered' && (
                    <button className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
