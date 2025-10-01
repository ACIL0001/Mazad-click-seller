import * as PropTypes from 'prop-types'
import { useState, useRef, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import {
  Box,
  List,
  Badge,
  Button,
  Avatar,
  Tooltip,
  Divider,
  Typography,
  IconButton,
  ListItemText,
  ListSubheader,
  ListItemAvatar,
  ListItemButton,
  Link,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
// utils
import { fToNow } from '../../utils/formatTime';
// components
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import ReviewModal from '../../components/ReviewModal';
import { useCreateSocket } from '@/contexts/SocketContext';
import useNotification from '@/hooks/useNotification';
import useAuth from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ReviewService } from '@/api/review';
import { NotificationService } from '@/api/notificationService';
import { NotificationType } from '@/types/Notification';
import { useLanguage } from '@/contexts/LanguageContext';

// ----------------------------------------------------------------------

export enum NotificationAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

// ----------------------------------------------------------------------

export default function NotificationsPopover({
  notifications = [],
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead
}: any) {

  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { notificationSocket   } = useCreateSocket();
  const {test} = useNotification()
  const { auth } = useAuth();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  // Get current user ID
  const currentUserId = auth?.user?._id;

  // Local loading state - only show spinner if no socket notifications and database is loading
  const [localLoading, setLocalLoading] = useState(false);

  // Update local loading state based on socket notifications and database loading
  useEffect(() => {
    const hasSocketNotifications = notificationSocket.length > 0;
    const shouldShowLoading = loading && !hasSocketNotifications;
    
    // Add timeout to prevent infinite loading
    let timeoutId;
    if (shouldShowLoading) {
      timeoutId = setTimeout(() => {
        console.log('⏰ Loading timeout reached, hiding spinner');
        setLocalLoading(false);
      }, 3000); // 3 second timeout
    } else {
      setLocalLoading(shouldShowLoading);
    }
    
    console.log('🔔 Loading state update:', {
      databaseLoading: loading,
      hasSocketNotifications,
      shouldShowLoading,
      socketCount: notificationSocket.length
    });
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loading, notificationSocket.length]);

  // Filter notifications by current user ID - ensure only current user's notifications are shown
  const userNotifications = useMemo(() => notifications.filter((n) => {
    console.log('🔍 Filtering database notification:', {
      type: n.type,
      title: n.title,
      userId: n.userId,
      currentUserId
    });
    
    // If no current user ID, show all notifications for debugging
    if (!currentUserId) {
      console.log('⚠️ No current user ID, showing all notifications for debugging');
      return true;
    }
    
    // Check user ID field in the notification
    const isUserNotification = n.userId === currentUserId;
           
    console.log('🔍 Is user notification?', isUserNotification);
    
    return isUserNotification;
  }), [notifications, currentUserId]);

  // ========================================
  // NOTIFICATION SEPARATION LOGIC
  // ========================================
  // This popover handles general notifications (auctions, bids, etc.)
  // Message/Chat notifications are handled by MessagesPopover component
  // BID_CREATED notifications are now allowed in the bell
  // ========================================
  const generalNotifications = useMemo(() => userNotifications.filter((n) => {
    // Exclude message/chat types
            const isMessageType = n.type === NotificationType.CHAT_CREATED || 
        n.type === NotificationType.MESSAGE_RECEIVED || 
        n.type === NotificationType.MESSAGE_ADMIN || 
        n.type === NotificationType.CONVERSATION || 
        n.type === NotificationType.CHAT ||
        n.type === NotificationType.MESSAGE;
    
    // Exclude admin messages by sender
    const isAdminSender = 
      n.data?.users?.[0]?._id === 'admin' ||
      n.data?.users?.[0]?.AccountType === 'admin' ||
      n.data?.senderId === 'admin' ||
      n.data?.sender?._id === 'admin' ||
      n.data?.sender?.AccountType === 'admin';
    
    // Exclude admin messages by title
    const isAdminMessageTitle = n.title === 'Nouveau message de l\'admin';
    
    return !isMessageType && !isAdminSender && !isAdminMessageTitle;
  }), [userNotifications]);

  // Calculate unread notifications based on the 'read' property
  const readNotifications = useMemo(() => generalNotifications.filter((n) => n.read), [generalNotifications]);
  const [allNotifications, setAllNotifications] = useState([]);

  // Shallow equality check for arrays of objects by _id
  function shallowEqualById(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i]._id !== arr2[i]._id) return false;
    }
    return true;
  }

  useEffect(() => {
    // Combine regular unread notifications with socket notifications, filtered by user ID
    const unreadNotifications = generalNotifications.filter((n) => !n.read);
     console.log('Filtered unread notifications for user:', currentUserId, unreadNotifications);
     
    // ========================================
    // SOCKET NOTIFICATION FILTERING - IMPROVED
    // ========================================
    // Show ALL socket notifications in the bell icon
    // Only exclude message/chat types that belong to MessagesPopover
    // ========================================
    const filteredSocketNotifications = notificationSocket.filter((n) => {
      console.log('🔍 Processing socket notification:', {
        type: n.type,
        title: n.title,
        userId: n.userId,
        currentUserId
      });
      
      // Exclude message/chat related socket notifications (they belong to MessagesPopover)
              const isMessageNotification = n.type === NotificationType.CHAT_CREATED || 
                       n.type === NotificationType.MESSAGE_RECEIVED || 
          n.type === NotificationType.MESSAGE_ADMIN || 
          n.type === NotificationType.CONVERSATION || 
          n.type === NotificationType.CHAT || 
          n.type === NotificationType.MESSAGE || 
          n.type === NotificationType.NEW_MESSAGE || 
          n.type === NotificationType.SEND_MESSAGE;
      
      // Exclude admin messages by sender
      const isAdminSender = 
        n.data?.users?.[0]?._id === 'admin' ||
        n.data?.users?.[0]?.AccountType === 'admin' ||
        n.data?.senderId === 'admin' ||
        n.data?.sender?._id === 'admin' ||
        n.data?.sender?.AccountType === 'admin';
      
      // Exclude admin messages by title
      const isAdminMessageTitle = n.title === 'Nouveau message de l\'admin';
             
      if (isMessageNotification || isAdminSender || isAdminMessageTitle) {
        console.log('🚫 NotificationsPopover: Excluding notification from bell icon:', {
          type: n.type,
          title: n.title,
          message: n.message,
          reason: isMessageNotification ? 'message type' : isAdminSender ? 'admin sender' : 'admin title'
        });
        return false;
      }
      
      // For debugging: show all non-message notifications
      console.log('✅ NotificationsPopover: Including notification in bell icon:', {
        type: n.type,
        title: n.title,
        message: n.message
      });
       
      return true; // Include all non-message notifications
    });
    
    // Ensure socket notifications have valid dates
    const processedSocketNotifications = filteredSocketNotifications.map(notification => ({
      ...notification,
      createdAt: notification.createdAt || new Date()
    }));

    // Combine notifications and remove duplicates based on ID
    const combinedNotifications = [...processedSocketNotifications, ...unreadNotifications];
    
    // Remove duplicates based on notification ID (_id)
    const uniqueNotifications = combinedNotifications.filter((notification, index, self) => {
      // Find the first occurrence of a notification with this ID
      const firstIndex = self.findIndex(n => n._id === notification._id);
      // Only keep if this is the first occurrence
      return index === firstIndex;
    });

    console.log('🔍 DEBUG: Final combined notifications for bell:', {
      socketCount: processedSocketNotifications.length,
      databaseCount: unreadNotifications.length,
      totalCount: uniqueNotifications.length,
      notifications: uniqueNotifications.map(n => ({ type: n.type, title: n.title }))
    });

    setAllNotifications(prev => {
      if (shallowEqualById(prev, uniqueNotifications)) return prev;
      return uniqueNotifications;
    });
  }, [generalNotifications, notificationSocket, currentUserId]);
 
  // Calculate total unread count from all notifications
  const [totalUnRead, setTotalUnRead] = useState(0)

  useEffect(() => {
    const newCount = allNotifications.length;
    console.log('🔔 NotificationsPopover: Updating unread count:', {
      previous: totalUnRead,
      new: newCount,
      notifications: allNotifications.map(n => ({ type: n.type, title: n.title }))
    });
    setTotalUnRead(newCount);
  }, [allNotifications, currentUserId])


  const [open, setOpen] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [hasAutoOpenedModal, setHasAutoOpenedModal] = useState(false); // Track if we've already auto-opened the modal

  // Auto-open review modal for unread ITEM_SOLD notifications when dashboard loads
  useEffect(() => {
    if (!hasAutoOpenedModal && allNotifications.length > 0 && !loading) {
      // Find the first unread ITEM_SOLD notification
      const unreadItemSoldNotification = allNotifications.find(notification => 
        notification.type === 'ITEM_SOLD' && !notification.read
      );

      if (unreadItemSoldNotification) {
        // Add a small delay to ensure everything is loaded
        setTimeout(() => {
          // Automatically open the review modal
          setSelectedNotification(unreadItemSoldNotification);
          setReviewModalOpen(true);
          setHasAutoOpenedModal(true); // Prevent multiple auto-opens during this session
        }, 1000); // 1 second delay to ensure dashboard is fully loaded
      }
    }
  }, [allNotifications, hasAutoOpenedModal, loading]);

  // Reset auto-open flag when notifications change significantly (new notifications arrive)
  useEffect(() => {
    const itemSoldCount = allNotifications.filter(n => n.type === 'ITEM_SOLD' && !n.read).length;
    if (itemSoldCount > 0 && hasAutoOpenedModal) {
      // If we get new ITEM_SOLD notifications, allow auto-open again
      const lastNotificationTime = Math.max(...allNotifications
        .filter(n => n.type === 'ITEM_SOLD' && !n.read)
        .map(n => new Date(n.createdAt || 0).getTime())
      );
      
      const oneMinuteAgo = Date.now() - 60000; // 1 minute ago
      if (lastNotificationTime > oneMinuteAgo) {
        setHasAutoOpenedModal(false);
      }
    }
  }, [allNotifications, hasAutoOpenedModal]);
  

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    }
  };

  const handleViewAll = () => {
    handleClose();
    navigate('/dashboard/notifications');
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      await ReviewService.submitReview(reviewData);
      
      // Mark the notification as read
      if (selectedNotification && selectedNotification._id && onMarkAsRead) {
        await onMarkAsRead(selectedNotification._id);
      }
      
      setSnackbarMessage(t('review.submitSuccess'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setReviewModalOpen(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbarMessage(error.message || t('review.submitError'));
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Tooltip title={t('common.notifications')}>
        <IconButton
          ref={anchorRef}
          size="large"
          color={open ? 'primary' : 'default'}
          onClick={handleOpen}
          sx={{
            ...(open && {
              bgcolor: (theme) => theme.palette.action.selected
            })
          }}
        >
          <Badge badgeContent={totalUnRead > 0 ? totalUnRead : null} color="error">
            <Iconify icon="eva:bell-fill" width={20} height={20} />
          </Badge>
        </IconButton>
      </Tooltip>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ 
          width: 360, 
          p: 0, 
          mt: 1.5, 
          ml: isRTL ? 0 : 0.75,
          mr: isRTL ? 0.75 : 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2.5, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">
              {t('common.notifications')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {totalUnRead === 0 
                ? t('notifications.noUnread') 
                : t('notifications.unreadCount', { count: totalUnRead })
              }
            </Typography>
          </Box>

          {totalUnRead > 0 && (
            <Tooltip title={t('notifications.markAllAsRead')}>
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <Iconify icon="eva:done-all-fill" width={20} height={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {localLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : allNotifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {notificationSocket.length > 0 
                ? t('notifications.loadingNotifications') 
                : t('notifications.noNotificationsFound')
              }
            </Typography>
          </Box>
        ) : (
          <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
            {allNotifications.length > 0 && (
              <Box sx={{ px: 2.5 }}>
                <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                  {t('notifications.new')}
                </ListSubheader>

                <List>
                  {allNotifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onOpenReviewModal={(notification) => {
                        setSelectedNotification(notification);
                        setReviewModalOpen(true);
                      }}
                    />
                  ))}
                  
                </List>
              </Box>
            )}


          </Scrollbar>
        )}

        <Divider sx={{ my: 1 }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple onClick={handleViewAll}>
            {t('notifications.viewAll')}
          </Button>
        </Box>
      </MenuPopover>

      {/* Review Modal */}
      {selectedNotification && (
        <ReviewModal
          open={reviewModalOpen}
          onClose={() => {
            // Mark the notification as read when closing the modal (even without submitting review)
            if (selectedNotification && selectedNotification._id && onMarkAsRead) {
              onMarkAsRead(selectedNotification._id);
            }
            
            setReviewModalOpen(false);
            setSelectedNotification(null);
          }}
          buyerInfo={{
            id: selectedNotification.data?.buyerId || selectedNotification.data?.userId || '',
            name: selectedNotification.data?.buyerName || selectedNotification.data?.userName || t('auctions.unknownUser'),
            phone: selectedNotification.data?.buyerPhone || selectedNotification.data?.userPhone || '',
            avatar: selectedNotification.data?.buyerAvatar || selectedNotification.data?.userAvatar || ''
          }}
          auctionInfo={{
            title: selectedNotification.data?.auctionTitle || selectedNotification.title || '',
            price: selectedNotification.data?.finalPrice || selectedNotification.data?.price || 0
          }}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity as any}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

function NotificationItem({ notification, onMarkAsRead, onOpenReviewModal }) {
  const { title, message, createdAt, read, auctionId, entityId } = notification;
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Convert createdAt string to Date object if needed
  const createdAtDate = createdAt instanceof Date ? createdAt : new Date(createdAt);

  const handleClick = (event) => {
    
    // Check for different types of auction sale notifications
    const auctionSaleTypes = ['ITEM_SOLD', 'AUCTION_SOLD', 'BID_ACCEPTED', 'SALE_COMPLETED', 'AUCTION_WON'];
    const isAuctionSaleNotification = auctionSaleTypes.includes(notification.type);
    const containsSaleText = notification.title?.toLowerCase().includes('sold') || 
                            notification.title?.toLowerCase().includes('vendu') || 
                            notification.message?.toLowerCase().includes('sold') || 
                            notification.message?.toLowerCase().includes('vendu');
    
    // Open review modal for auction sale notifications that haven't been read yet
    if ((isAuctionSaleNotification || containsSaleText) && !read) {
      // Open the review modal instead of navigating
      if (onOpenReviewModal) {
        onOpenReviewModal(notification);
      }
      return;
    }

    // Mark as read first (only for database notifications that have onMarkAsRead)
    if (onMarkAsRead && !read && notification._id) {
      onMarkAsRead(notification._id);
    }

    // Navigate to auction details if auctionId exists
    // First try auctionId, then fallback to entityId which might contain the auction ID
    const id = auctionId || entityId || notification.auction || notification.auctionID;

    if (id) {
      // Try multiple possible route patterns
      try {
        navigate(`/dashboard/auction/${id}`);
      } catch (error) {
        // Alternative navigation paths
        try {
          navigate(`/dashboard/auctions/${id}`);
        } catch (err) {
          // Silent fail
        }
      }
    }
  };

  // Check if the date is valid to prevent "Invalid time value" error
  const isValidDate = (date) => {
    if (!date) return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        bgcolor: read ? 'transparent' : 'action.hover',
      }}
      onClick={handleClick}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: 'background.neutral' }}>
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Avatar>
      </ListItemAvatar>

      <ListItemText
        primary={title}
        secondary={
          <>
            {message && (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: 'text.secondary',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {message}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'flex',
                alignItems: 'center',
                color: 'text.disabled',
              }}
            >
              <Iconify icon="eva:clock-fill" sx={{ mr: 0.5, width: 16, height: 16 }} />
              {isValidDate(createdAtDate) ? fToNow(createdAtDate) : 'À l\'instant'}
            </Typography>
          </>
        }
      />
    </ListItemButton>
  );
}

function renderContent(notification) {
  const title = (
    <Typography variant="subtitle2">
      {notification.title}
      <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
        &nbsp; {notification.message}
      </Typography>
    </Typography>
  );

  if (notification.type === NotificationType.ORDER) {
    return {
      avatar: (
        <Avatar sx={{ bgcolor: 'primary.lighter' }}>
          <Iconify icon="eva:shopping-bag-fill" sx={{ color: 'primary.main' }} />
        </Avatar>
      ),
      title,
    };
  }
  if (notification.type === NotificationType.ARRIVAL) {
    return {
      avatar: (
        <Avatar sx={{ bgcolor: 'success.lighter' }}>
          <Iconify icon="eva:checkmark-circle-2-fill" sx={{ color: 'success.main' }} />
        </Avatar>
      ),
      title,
    };
  }
  if (notification.type === NotificationType.ITEM_SOLD || notification.type === 'ITEM_SOLD') {
    return {
      avatar: (
        <Avatar sx={{ bgcolor: 'success.lighter' }}>
          <Iconify icon="eva:credit-card-fill" sx={{ color: 'success.main' }} />
        </Avatar>
      ),
      title,
    };
  }
  if (notification.type === NotificationType.BID_WON || notification.type === 'BID_WON') {
    return {
      avatar: (
        <Avatar sx={{ bgcolor: 'warning.lighter' }}>
          <Iconify icon="eva:trophy-fill" sx={{ color: 'warning.main' }} />
        </Avatar>
      ),
      title,
    };
  }
  if (notification.type === NotificationType.CHAT_CREATED || notification.type === 'CHAT_CREATED') {
    return {
      avatar: (
        <Avatar sx={{ bgcolor: 'info.lighter' }}>
          <Iconify icon="eva:message-circle-fill" sx={{ color: 'info.main' }} />
        </Avatar>
      ),
      title,
    };
  }
  return {
    avatar: notification.avatar ? (
      <Avatar sx={{ bgcolor: 'background.neutral' }}>
        <img alt={notification.title} src={notification.avatar} />
      </Avatar>
    ) : null,
    title,
  };
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
  }),
};