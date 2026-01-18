import { useRef, useState, useEffect, useCallback } from 'react';

// this hook is used for notification
export const useWebSocket = (token) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);

  const connect = useCallback(() => {
    // Prevent duplicate connections
    if (!token || wsRef.current) return;

    const wsUrl =
      process.env.NODE_ENV === 'production'
        ? `wss://${window.location.host}/ws/notifications/?token=${token}`
        : `ws://127.0.0.1:8000/ws/notifications/?token=${token}`;

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

        // Ignore system messages
        if (
          data?.type === 'heartbeat' ||
          data?.type === 'connection_success'
        ) {
          return;
        }

        setNotifications((prev) => [
          {
            id: data.id ?? `${Date.now()}-${Math.random()}`,
            title: data.title || 'Notification',
            message: data.message,
            type: data.type || 'info',
            isUnRead: true,
            timestamp: data.created_at || new Date().toISOString(),
          },
          ...prev, // ✅ newest first
        ]);
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;

      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;

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
      clearTimeout(reconnectTimeoutRef.current);
      clearInterval(heartbeatIntervalRef.current);

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  // MARK SINGLE AS READ
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isUnRead: false } : n
      )
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
