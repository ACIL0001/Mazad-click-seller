import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  Badge,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Popover,
} from '@mui/material';
import { format } from 'date-fns';
import Iconify from './Iconify';
import useNotification from '@/hooks/useNotification';

interface NotificationListProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function NotificationList({ anchorEl, onClose }: NotificationListProps) {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead } = useNotification();
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  const handleNotificationClick = (id: string) => {
    setSelectedNotification(id);
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 360, maxHeight: 500 },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Notifications</Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No notifications
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {notifications.map((notification) => (
            <React.Fragment key={notification._id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification._id)}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected',
                  },
                }}
              >
                <ListItemText
                  primary={notification.title}
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {notification.message}
                      </Typography>
                      {notification.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(notification.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      )}
                    </>
                  }
                />
                {!notification.read && (
                  <Badge
                    color="error"
                    variant="dot"
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      )}
    </Popover>
  );
}