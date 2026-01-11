import { useState } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useWebSocket } from 'src/hooks/useWebSocket';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { NotificationItem } from './notification-item';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

export function NotificationsDrawer({ sx }) {
  const { value: open, onTrue: onOpen, onFalse: onClose } = useBoolean();
  const [currentTab, setCurrentTab] = useState('all');

  const token = sessionStorage.getItem('jwt_access_token');
  const { notifications, isConnected, markAsRead, markAllAsRead } =
    useWebSocket(token);

  const unreadCount = notifications.filter((n) => n.isUnRead).length;

  // Sort notifications descending by timestamp
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const filtered =
    currentTab === 'unread'
      ? sortedNotifications.filter((n) => n.isUnRead)
      : sortedNotifications;

  const handleTabChange = (_, value) => setCurrentTab(value);

  return (
    <>
      {/* Notification bell icon */}
      <IconButton onClick={onOpen} sx={sx}>
        <Badge badgeContent={unreadCount} color="error">
          <Iconify
            width={24}
            icon={
              isConnected
                ? 'solar:bell-bing-bold-duotone'
                : 'solar:bell-off-bold-duotone'
            }
          />
        </Badge>
      </IconButton>

      {/* Notification Drawer */}
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        PaperProps={{
          sx: {
            width: 420, 
            maxWidth: '100vw',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh', 
          },
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">Notifications</Typography>

          {unreadCount > 0 && (
            <Tooltip title="Mark all as read">
              <IconButton onClick={markAllAsRead}>
                <Iconify icon="eva:done-all-fill" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* TABS */}
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={
                <Label variant="soft" color={tab.value === 'unread' ? 'info' : 'default'}>
                  {tab.value === 'all' ? notifications.length : unreadCount}
                </Label>
              }
              iconPosition="end"
            />
          ))}
        </Tabs>

{/* NOTIFICATION LIST */}
<Scrollbar sx={{ flex: 1, px: 1 }}>
  <Box component="ul" sx={{ p: 0, m: 0 }}>
    {filtered.length ? (
      [...filtered].reverse().map((n) => (
        <NotificationItem
          key={n.id}
          notification={n}
          onClick={() => markAsRead(n.id)}
        />
      ))
    ) : (
      <Typography sx={{ textAlign: 'center', mt: 6 }} color="text.secondary">
        No notifications
      </Typography>
    )}
  </Box>
</Scrollbar>


      </Drawer>
    </>
  );
}
