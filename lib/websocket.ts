// Server-Sent Events (SSE) implementation for real-time order updates
// Provides WebSocket-like interface but uses HTTP streaming

export type WebSocketEventType = 'ORDER_STATUS_CHANGED' | 'ORDER_CREATED' | 'ORDER_DELETED' | 'CONNECTION_OPEN' | 'CONNECTION_CLOSED' | 'CONNECTION_ERROR' | 'HEARTBEAT';

export interface WebSocketMessage {
  type: WebSocketEventType;
  data: Record<string, any>;
  timestamp?: number;
}

export interface WebSocketListener {
  (message: WebSocketMessage): void;
}

class SSEWebSocketAdapter {
  private eventSource: EventSource | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private listeners: Map<WebSocketEventType, Set<WebSocketListener>> = new Map();
  private isConnecting = false;
  public userId: string = '';

  constructor(url: string, userId?: string) {
    this.url = url;
    this.userId = userId || 'anonymous';
  }

  /**
   * Connect to SSE stream
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      if (this.eventSource?.readyState === EventSource.OPEN) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        // Connect to user-specific channel
        const channelUrl = `${this.url}?channel=user-${this.userId}`;
        console.log('[SSE] Attempting connection to:', channelUrl);
        
        this.eventSource = new EventSource(channelUrl);

        this.eventSource.onopen = () => {
          console.log('[SSE] Connected to server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 3000;

          this.emit({
            type: 'CONNECTION_OPEN',
            data: { connected: true },
            timestamp: Date.now(),
          });

          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            // Parse SSE data format: "data: {...}\n\n"
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[SSE] Failed to parse message:', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', {
            readyState: this.eventSource?.readyState,
            channel: `user-${this.userId}`,
            url: channelUrl,
            timestamp: new Date().toISOString(),
          });
          this.isConnecting = false;

          this.emit({
            type: 'CONNECTION_ERROR',
            data: { error: 'Connection failed' },
            timestamp: Date.now(),
          });

          if (this.eventSource?.readyState === EventSource.CLOSED) {
            this.eventSource = null;
            this.attemptReconnect();
          }

          reject(new Error('SSE connection failed'));
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from SSE stream
   */
  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.emit({
      type: 'CONNECTION_CLOSED',
      data: { connected: false },
      timestamp: Date.now(),
    });
  }

  /**
   * Note: SSE is unidirectional, but we keep this for API compatibility
   */
  public send(message: WebSocketMessage): void {
    console.warn('[SSE] Send not supported - SSE is receive-only. Message queued but not sent:', message);
  }

  /**
   * Subscribe to SSE events
   */
  public on(type: WebSocketEventType, listener: WebSocketListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }

    this.listeners.get(type)!.add(listener);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(listener);
      }
    };
  }

  /**
   * Unsubscribe from SSE events
   */
  public off(type: WebSocketEventType, listener: WebSocketListener): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: WebSocketMessage): void {
    // Skip heartbeat messages in handlers (but log them)
    if (message.type === 'HEARTBEAT') {
      // Connection is alive
      return;
    }

    // Emit the message to all listeners
    this.emit(message);
  }

  /**
   * Emit event to all listeners
   */
  private emit(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(message);
        } catch (error) {
          console.error(`[SSE] Error in listener for ${message.type}:`, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SSE] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[SSE] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect().catch((err) => console.error('[SSE] Reconnection failed:', err));
    }, this.reconnectDelay);

    // Exponential backoff: double the delay, cap at 30 seconds
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  /**
   * Get connection status
   */
  public getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }
}

// Singleton instance
let ssAdapter: SSEWebSocketAdapter | null = null;

/**
 * Get or create SSE adapter instance
 */
export function getWebSocketManager(userId?: string): SSEWebSocketAdapter {
  if (!ssAdapter) {
    // Create with initial userId or 'anonymous'
    ssAdapter = new SSEWebSocketAdapter('/api/ws', userId || 'anonymous');
  } else if (userId && ssAdapter.userId === 'anonymous') {
    // Update userId if it was initially anonymous
    ssAdapter.userId = userId;
  }
  return ssAdapter;
}

/**
 * Initialize SSE connection
 */
export function initWebSocket(userId?: string): Promise<void> {
  const adapter = getWebSocketManager(userId);
  return adapter.connect();
}

/**
 * Close SSE connection
 */
export function closeWebSocket(): void {
  const adapter = getWebSocketManager();
  adapter.disconnect();
  ssAdapter = null;
}
