import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NotificationItem({ notification, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return 'mdi:check-circle-outline';
      case 'error':
        return 'mdi:alert-circle-outline';
      case 'warning':
        return 'mdi:alert-outline';
      case 'info':
      default:
        return 'mdi:information-outline';
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <Card
      sx={{
        width: '100%',
        mb: 1,
        mx: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: notification.isUnRead ? 'action.hover' : 'background.paper',
        borderLeft: 3,
        borderColor: getColor(notification.type),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${getColor(notification.type)}.light`,
            color: `${getColor(notification.type)}.dark`,
          }}
        >
          <Iconify icon={getIcon(notification.type)} width={24} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
              {notification.title || 'Notification'}
            </Typography>

            {notification.isUnRead && (
              <Label color="info" variant="soft" size="small">
                New
              </Label>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {notification.message}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.disabled">
              {notification.timestamp
                ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
                : 'Just now'}
            </Typography>

            {isHovered && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Iconify
                  icon={notification.isUnRead ? 'mdi:eye-outline' : 'mdi:eye-off-outline'}
                  width={16}
                />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
