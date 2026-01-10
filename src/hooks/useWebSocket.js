import { useRef, useState, useEffect, useCallback } from 'react';

export const useWebSocket = (token) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null); // Ref for keep-alive timer

  const connect = useCallback(() => {
    // Prevent connection if no token or already connecting/connected
    if (!token || (wsRef.current && wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      // Clean up any stale connection before starting a new one
      if (wsRef.current) {
        wsRef.current.close();
      }

      // Determine URL based on environment (using 2026 best practices)
      const wsUrl = process.env.NODE_ENV === 'production' 
        ? `wss://${window.location.host}/ws/notifications/?token=${token}`
        : `ws://127.0.0.1:8001/ws/notifications/?token=${token}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        
        // Clear any pending reconnection attempts
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

        // --- HEARTBEAT START ---
        // Send a small 'ping' every 20 seconds to keep the connection alive
        // This prevents Nginx/Daphne from closing the socket with code 1006
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 20000); 
        // --- HEARTBEAT END ---
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Ignore heartbeat responses if server sends them back
          if (data.type === 'heartbeat') return;

          console.log('📨 Received notification:', data);
          
          setNotifications(prev => [{
            ...data,
            id: data.id || Date.now(),
            timestamp: new Date().toISOString()
          }, ...prev]);
          
          if (Notification.permission === 'granted') {
            new Notification(data.title || 'New Notification', {
              body: data.message,
              icon: '/favicon.ico'
            });
          }
        } catch (error) {
          console.error('Error parsing notification message:', error);
        }
      };

      ws.onclose = (event) => {
        console.warn(`❌ WebSocket disconnected. Code: ${event.code} Reason: ${event.reason || 'None'}`);
        setIsConnected(false);
        
        // Stop the heartbeat when the connection closes
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        
        // Code 1000 is a normal closure; don't reconnect.
        // Code 1006 or others are abnormal; attempt reconnect.
        if (event.code !== 1000) {
          console.log('🔄 Attempting to reconnect in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket Error Observed:', error);
        // Do not call connect() here, onclose will handle the retry
        setIsConnected(false);
      };

    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  }, [token]);

  const disconnect = useCallback(() => {
    // Clear all intervals and timeouts
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    
    if (wsRef.current) {
      wsRef.current.onclose = null; // Remove listener to prevent accidental retry
      wsRef.current.close(1000, 'User logged out');
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Request browser notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Manage connection lifecycle
  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token, connect, disconnect]);

  // State helper functions
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, isUnRead: false } : notif)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
    clearNotifications,
    reconnect: connect
  };
};
