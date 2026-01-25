'use client';

import { useTranslation } from 'react-i18next';
import { useRef, useState, useEffect } from 'react';

import { Button, TextField } from '@mui/material';

const API_ROOT_URL = import.meta.env.VITE_API_ROOT_URL;

export default function ChatWindow({ requestId, currentUser }) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  const canSend = message.trim().length > 0;

  // Open WebSocket on mount
  useEffect(() => {
    const token = sessionStorage.getItem('jwt_access_token');

    ws.current = new WebSocket(`ws://${API_ROOT_URL}/ws/chat/${requestId}/?token=${token}`);

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      // Push message into state
      setMessages((prev) => [...prev, data]);
    };

    ws.current.onclose = () => console.log('WebSocket closed');

    return () => ws.current.close();
  }, [requestId]);

  const handleSend = () => {
    if (!canSend) return;
    ws.current.send(JSON.stringify({ message }));
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messagesEndRef = useRef(null);

useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
  return (
    <>
      {/* Messages area */}
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12 }}>
        {messages.map((msg, i) => {
          // Determine alignment and color
          const isProvider = msg.is_provider;
          const isCurrentUser = msg.sender === currentUser; // optional: highlight your messages differently
          const alignRight = !isProvider && !isCurrentUser; // if not provider, show on right
          const bgColor = isProvider ? '#1976d2' : '#eee';
          const textColor = isProvider ? '#fff' : '#000';

          return (
            <div
              key={i}
              style={{
                textAlign: alignRight ? 'right' : 'left',
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: bgColor,
                  color: textColor,
                  maxWidth: '75%',
                  wordBreak: 'break-word',
                }}
              >
                {msg.message}
                <div ref={messagesEndRef} />

              </div>
            </div>
          );
        })}
      </div>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          placeholder={t('Typeamessage…')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="contained"
          sx={{ minWidth: 48, height: 40 }}
          disabled={!canSend}
          onClick={handleSend}
        >
          {t('submit')}
        </Button>
      </div>
    </>
  );
}
