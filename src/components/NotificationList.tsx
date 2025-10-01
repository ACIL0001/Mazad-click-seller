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
import { useNavigate } from 'react-router-dom';
import Iconify from './Iconify';
import useNotification from '@/hooks/useNotification';
import useMessageNotifications from '@/hooks/useMessageNotifications';
import { NotificationService } from '@/api/notificationService';

interface NotificationListProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function NotificationList({ anchorEl, onClose }: NotificationListProps) {
  const { notifications, unreadCount, loading, error, markAsRead, markAllAsRead, fetchNotifications, fetchUnreadCount } = useNotification();
  const { uniqueChatMessages, markAllSocketMessagesAsRead } = useMessageNotifications();
  const navigate = useNavigate();
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null);

  // Refresh notifications when the popover opens to ensure accurate counts
  React.useEffect(() => {
    if (anchorEl) {
      // Small delay to ensure the popover is fully rendered
      const timer = setTimeout(() => {
        fetchNotifications(true);
        fetchUnreadCount(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [anchorEl, fetchNotifications, fetchUnreadCount]);

  // Separate chat notifications from general notifications
  const chatNotifications = notifications.filter(n => 
    n.type === 'CHAT_CREATED' || n.type === 'MESSAGE_RECEIVED'
  );
  const generalNotifications = notifications.filter(n => 
    n.type !== 'CHAT_CREATED' && n.type !== 'MESSAGE_RECEIVED'
  );

  // Show only one chat notification if there are multiple
  const displayChatNotification = chatNotifications.length > 0 ? chatNotifications[0] : null;
  const chatNotificationCount = chatNotifications.length;

  const handleNotificationClick = (id: string) => {
    setSelectedNotification(id);
    markAsRead(id);
  };

  const handleChatNotificationClick = async () => {
    try {
      // Mark all chat notifications as read using the new API
      await NotificationService.markAllChatNotificationsAsRead();
      
      // Mark socket messages as read
      markAllSocketMessagesAsRead();
      
      // Force refresh notifications to update the badge
      // This will trigger the useNotification hook to refresh
      window.dispatchEvent(new CustomEvent('notificationRead'));
      
      // Navigate to chat page
      navigate('/dashboard/chat');
      onClose();
    } catch (error) {
      console.error('Error marking chat notifications as read:', error);
      // Still navigate to chat page even if marking as read fails
      navigate('/dashboard/chat');
      onClose();
    }
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
          {/* Show consolidated chat notification if there are chat notifications */}
          {displayChatNotification && (
            <React.Fragment key="chat-notification">
              <ListItem
                button
                onClick={handleChatNotificationClick}
                sx={{
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Iconify icon="material-symbols:chat" width={20} height={20} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {chatNotificationCount === 1 ? 'Nouveau message' : `${chatNotificationCount} nouveaux messages`}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {displayChatNotification.message}
                      </Typography>
                      {displayChatNotification.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(displayChatNotification.createdAt), 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      )}
                    </>
                  }
                />
                <Badge
                  badgeContent={chatNotificationCount}
                  color="error"
                  sx={{ ml: 1 }}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          )}
          
          {/* Show general notifications */}
          {generalNotifications.map((notification) => (
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