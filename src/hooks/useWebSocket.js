import { useRef, useState, useEffect, useCallback } from 'react';

export const useWebSocket = (token) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl =
      process.env.NODE_ENV === 'production'
        ? `wss://${window.location.host}/ws/notifications/?token=${token}`
        : `ws://127.0.0.1:8001/ws/notifications/?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);

      // Heartbeat every 20 seconds
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 20000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Skip heartbeat
        if (data.type === 'heartbeat' || data.type === 'connection_success') return;

        // Prepend new notifications so latest is on top
        setNotifications((prev) => [
          {
            id: data.id || Date.now(),
            message: data.message,
            title: data.title || 'Notification',
            type: data.type || 'info',
            isUnRead: true,
            timestamp: data.created_at || new Date().toISOString(),
          },
          ...prev,
        ]);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      clearInterval(heartbeatIntervalRef.current);

      // Reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      ws.close();
    };
  }, [token]);

  useEffect(() => {
    connect();

    return () => {
      clearInterval(heartbeatIntervalRef.current);
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  // MARK SINGLE AS READ
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isUnRead: false } : n))
    );
  }, []);

  // MARK ALL AS READ
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isUnRead: false }))
    );
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
  };
};
