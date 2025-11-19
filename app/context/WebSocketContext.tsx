'use client';

import React, { createContext, useContext, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getWebSocketManager, WebSocketEventType, WebSocketMessage, WebSocketListener } from '@/lib/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (type: WebSocketEventType, listener: WebSocketListener) => () => void;
  unsubscribe: (type: WebSocketEventType, listener: WebSocketListener) => void;
  send: (message: WebSocketMessage) => void;
  getStatus: () => { connected: boolean; reconnectAttempts: number; maxReconnectAttempts: number };
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    if (!user?.id) {
      console.log('[WebSocketProvider] No user, skipping connection');
      return;
    }

    const manager = getWebSocketManager(user.id);

    // Connect to SSE on mount
    manager
      .connect()
      .then(() => {
        console.log('[WebSocketProvider] Connected successfully');
        setIsConnected(true);
      })
      .catch((err) => {
        console.warn('[WebSocketProvider] Connection failed (this is normal initially):', err?.message);
        // Don't set isConnected to false - let it retry automatically
        // SSE connection failures are expected during initial load
      });

    // Listen for connection status changes
    const unsubOpenConn = manager.on('CONNECTION_OPEN', () => {
      console.log('[WebSocketProvider] Connection opened');
      setIsConnected(true);
    });

    const unsubCloseConn = manager.on('CONNECTION_CLOSED', () => {
      console.log('[WebSocketProvider] Connection closed');
      setIsConnected(false);
    });

    const unsubErrorConn = manager.on('CONNECTION_ERROR', (msg) => {
      console.warn('[WebSocketProvider] Connection error:', msg.data);
      // Don't close connection on error, let it retry
    });

    // Cleanup on unmount or user change
    return () => {
      unsubOpenConn();
      unsubCloseConn();
      unsubErrorConn();
      // Note: We don't disconnect here to maintain persistence
      // The SSE connection will attempt to reconnect automatically
    };
  }, [user?.id]);

  const subscribe = useCallback((type: WebSocketEventType, listener: WebSocketListener) => {
    const manager = getWebSocketManager(user?.id);
    return manager.on(type, listener);
  }, [user?.id]);

  const unsubscribe = useCallback((type: WebSocketEventType, listener: WebSocketListener) => {
    const manager = getWebSocketManager(user?.id);
    manager.off(type, listener);
  }, [user?.id]);

  const send = useCallback((message: WebSocketMessage) => {
    const manager = getWebSocketManager(user?.id);
    manager.send(message);
  }, [user?.id]);

  const getStatus = useCallback(() => {
    const manager = getWebSocketManager(user?.id);
    return manager.getStatus();
  }, [user?.id]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribe,
        unsubscribe,
        send,
        getStatus,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook to use WebSocket context
 */
export function useWebSocket(): WebSocketContextType {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
}
