// lib/sse-broadcast.ts
// Store SSE clients and their subscription channels
const sseClients = new Map<string, Set<ReadableStreamDefaultController<string>>>();

/**
 * Register a new SSE client connection
 */
export function registerSSEClient(
  channelId: string,
  controller: ReadableStreamDefaultController<string>,
  onCleanup?: () => void
) {
  if (!sseClients.has(channelId)) {
    sseClients.set(channelId, new Set());
  }
  
  const clients = sseClients.get(channelId)!;
  clients.add(controller);
  
  console.log(`[SSE] Client connected to channel: ${channelId}. Total: ${clients.size}`);
  
  return () => {
    clients.delete(controller);
    console.log(`[SSE] Client disconnected from channel: ${channelId}. Total: ${clients.size}`);
    
    if (clients.size === 0) {
      sseClients.delete(channelId);
    }
    
    onCleanup?.();
  };
}

/**
 * Broadcast event to all clients on a channel
 */
export function broadcastToChannel(channelId: string, eventType: string, data: any) {
  const clients = sseClients.get(channelId);
  if (!clients) return;

  const message = `data: ${JSON.stringify({ type: eventType, data, timestamp: Date.now() })}\n\n`;

  let disconnected = false;
  clients.forEach((controller) => {
    try {
      controller.enqueue(message);
    } catch (error) {
      console.error(`[SSE] Failed to send to client:`, error);
      disconnected = true;
      clients.delete(controller);
    }
  });

  console.log(`[SSE] Broadcasted to ${channelId}: ${eventType}`);
}

/**
 * Broadcast order status update to customers
 */
export function broadcastOrderUpdate(orderId: string, userId: string, newStatus: string) {
  // Broadcast to this specific user's channel
  broadcastToChannel(`user-${userId}`, 'ORDER_STATUS_CHANGED', {
    orderId,
    userId,
    status: newStatus,
  });

  // Also broadcast to admin channel
  broadcastToChannel('admin-orders', 'ORDER_STATUS_CHANGED', {
    orderId,
    userId,
    status: newStatus,
  });
}

/**
 * Broadcast new order creation
 */
export function broadcastOrderCreated(orderId: string, userId: string, orderData: any) {
  // Broadcast to admin channel
  broadcastToChannel('admin-orders', 'ORDER_CREATED', {
    orderId,
    userId,
    ...orderData,
  });
}

/**
 * Get client count for a channel (for debugging)
 */
export function getChannelClientCount(channelId: string): number {
  return sseClients.get(channelId)?.size || 0;
}
