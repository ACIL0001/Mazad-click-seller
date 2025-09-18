import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Grid,
  Stack,
} from '@mui/material';
import { format } from 'date-fns';
import useNotification from '@/hooks/useNotification';
import Breadcrumb from '@/components/Breadcrumbs';
import { useCreateSocket } from '@/contexts/SocketContext';
import useAuth from '@/hooks/useAuth';
import { NotificationType } from '@/types/Notification';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const { notifications, loading, error, markAsRead, markAllAsRead } = useNotification();
  const { notificationSocket } = useCreateSocket();
  const [allNotifications, setAllNotifications] = useState([]);
  const { auth } = useAuth();

  console.log('From Page Nor', notificationSocket);

  useEffect(() => {
    console.log('🔍 DEBUG: Starting notification processing...');
    console.log('🔍 DEBUG: Socket notifications:', notificationSocket);
    console.log('🔍 DEBUG: Database notifications:', notifications);
    
    // Get current user ID for filtering
    const currentUserId = auth?.user?._id;
    
    // Filter notifications by current user ID - ensure only current user's notifications are shown
    const userNotifications = notifications?.filter((n) => {
      // If no current user ID, show all notifications for debugging
      if (!currentUserId) {
        return true;
      }
      
      // Check user ID field in the notification
      const isUserNotification = n.userId === currentUserId;
             
      return isUserNotification;
    }) || [];
    
    // Combine socket notifications with filtered database notifications
    const combinedNotifications = [...notificationSocket, ...userNotifications];
    console.log('🔍 DEBUG: Combined notifications:', combinedNotifications);
    
    // Remove duplicates based on notification ID (_id)
    const uniqueNotifications = combinedNotifications.filter((notification, index, self) => {
      // Find the first occurrence of a notification with this ID
      const firstIndex = self.findIndex(n => n._id === notification._id);
      // Only keep if this is the first occurrence
      return index === firstIndex;
    });
    console.log('🔍 DEBUG: Unique notifications after deduplication:', uniqueNotifications);

    // ========================================
    // FILTER OUT ALL MESSAGE/CHAT NOTIFICATIONS
    // ========================================
    // This page should ONLY show general notifications (auctions, bids, etc.)
    // Message/Chat notifications are handled in the Chat section
    // BID_CREATED notifications are now included to match bell icon logic
    // ========================================
    
    console.log('🔍 DEBUG: Notification types found:', uniqueNotifications.map(n => n.type));
    
    const generalNotifications = uniqueNotifications.filter(
              n => n.type !== NotificationType.CHAT_CREATED && 
                      n.type !== NotificationType.MESSAGE_RECEIVED && 
            n.type !== NotificationType.CONVERSATION && 
            n.type !== NotificationType.CHAT && 
            n.type !== NotificationType.MESSAGE && 
            n.type !== NotificationType.NEW_MESSAGE && 
            n.type !== NotificationType.SEND_MESSAGE
          // BID_CREATED notifications are now included to match bell icon logic
    );
    
    console.log('🔍 DEBUG: General notifications after type filtering:', generalNotifications);
    console.log('🔍 DEBUG: Filtered out notifications:', uniqueNotifications.filter(n => 
              n.type === NotificationType.CHAT_CREATED || 
              n.type === NotificationType.MESSAGE_RECEIVED || 
        n.type === NotificationType.CONVERSATION || 
        n.type === NotificationType.CHAT || 
        n.type === NotificationType.MESSAGE || 
        n.type === NotificationType.NEW_MESSAGE || 
        n.type === NotificationType.SEND_MESSAGE
      // BID_CREATED notifications are now included to match bell icon logic
    ));

    // Sort by creation date (newest first)
    const sortedNotifications = generalNotifications.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    setAllNotifications(sortedNotifications);
  }, [notificationSocket, notifications, auth?.user?._id]);

  const handleMarkAsRead = async (id: string) => {
    try {
      // Mark as read in the backend
      await markAsRead(id);
      
      // Update local state immediately for better UX
      setAllNotifications(prev => 
        prev.map(notification => 
          notification._id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      console.log('✅ Notification marked as read:', id);
      
      // Force refresh the notification counts in the bell icon
      // This will update the useNotification hook's unread count
      setTimeout(() => {
        window.dispatchEvent(new Event('notificationRead'));
      }, 100);
      
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all as read in the backend
      await markAllAsRead();
      
      // Update local state immediately for better UX
      setAllNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      console.log('✅ All notifications marked as read');
      
      // Force refresh the notification counts in the bell icon
      setTimeout(() => {
        window.dispatchEvent(new Event('notificationRead'));
      }, 100);
      
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Stack direction="column" justifyContent="space-between" mb={3}>
            <Typography variant="h4" gutterBottom>
                {t('navigation.notifications')}
            </Typography>
        </Stack>
        <Stack mb={3}>
            <Breadcrumb />
        </Stack>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
            {allNotifications.length > 0 && (
              <Button variant="outlined" onClick={handleMarkAllAsRead}>
                {t('notifications.markAllAsRead')}
              </Button>
            )}
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : allNotifications.length === 0 ? (
            <Typography variant="body1" sx={{ p: 2, textAlign: 'center' }}>
              {t('notifications.noNotificationsFound')}
            </Typography>
          ) : (
            <List>
              {allNotifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : 'action.hover',
                      '&:hover': {
                        bgcolor: 'action.selected',
                      },
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={8}>
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
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {!notification.read && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            {t('notifications.markAsRead')}
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </ListItem>
                  {index < allNotifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}