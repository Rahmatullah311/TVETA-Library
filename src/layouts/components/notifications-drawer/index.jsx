import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { useWebSocket } from 'src/hooks/useWebSocket';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { varTap, varHover, transitionTap } from 'src/components/animate';

import { NotificationItem } from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
];

// ----------------------------------------------------------------------

export function NotificationsDrawer({ sx, ...other }) {
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const [currentTab, setCurrentTab] = useState('all');
  
  // Get token from your auth system (adjust based on your setup)
  const token = sessionStorage.getItem('jwt_access_token') || 
                sessionStorage.getItem('jwt_access_token');
  
  const {
    notifications,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications
  } = useWebSocket(token);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;
  const totalCount = notifications.length;

  const filteredNotifications = currentTab === 'unread' 
    ? notifications.filter((item) => item.isUnRead === true)
    : notifications;

  const handleNotificationClick = useCallback((id) => {
    markAsRead(id);
    // You can add navigation logic here
    onClose();
  }, [markAsRead, onClose]);

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      clearNotifications();
    }
  };

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        minHeight: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Notifications
        </Typography>
        
        {!isConnected && (
          <Tooltip title="Connecting...">
            <CircularProgress size={16} />
          </Tooltip>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {!!totalUnRead && (
          <Tooltip title="Mark all as read">
            <IconButton color="primary" onClick={handleMarkAllAsRead}>
              <Iconify icon="eva:done-all-fill" />
            </IconButton>
          </Tooltip>
        )}

        {totalCount > 0 && (
          <Tooltip title="Clear all">
            <IconButton color="error" onClick={handleClearAll}>
              <Iconify icon="mdi:delete-outline" />
            </IconButton>
          </Tooltip>
        )}

        <IconButton onClick={onClose} sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>
    </Box>
  );

  const renderTabs = () => (
    <Tabs 
      variant="fullWidth" 
      value={currentTab} 
      onChange={handleChangeTab} 
      sx={{ borderBottom: 1, borderColor: 'divider' }}
    >
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={tab.value === 'unread' ? 'info' : 'default'}
            >
              {tab.value === 'all' ? totalCount : totalUnRead}
            </Label>
          }
          iconPosition="end"
        />
      ))}
    </Tabs>
  );

  const renderList = () => (
    <Scrollbar sx={{ height: 'calc(100vh - 200px)' }}>
      <Box component="ul" sx={{ p: 0 }}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Box component="li" key={notification.id} sx={{ display: 'flex' }}>
              <NotificationItem 
                notification={notification} 
                onClick={() => handleNotificationClick(notification.id)}
              />
            </Box>
          ))
        ) : (
          <Box
            sx={{
              py: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
            }}
          >
            <Iconify icon="mdi:bell-off-outline" width={64} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              No notifications
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {currentTab === 'unread' 
                ? 'You have no unread notifications' 
                : 'Your notification list is empty'}
            </Typography>
          </Box>
        )}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Notifications"
        onClick={onOpen}
        sx={sx}
        {...other}
      >
        <Badge 
          badgeContent={totalUnRead} 
          color="error"
          max={9}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <Iconify 
            width={24} 
            icon={isConnected ? "solar:bell-bing-bold-duotone" : "solar:bell-off-bold-duotone"} 
          />
        </Badge>
      </IconButton>

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 1, maxWidth: 420 } },
        }}
      >
        {renderHead()}
        {renderTabs()}
        {renderList()}

        {totalCount > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" align="center">
              {totalUnRead} unread of {totalCount} total notifications
            </Typography>
          </Box>
        )}
      </Drawer>
    </>
  );
}