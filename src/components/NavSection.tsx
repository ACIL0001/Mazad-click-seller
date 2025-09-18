import { useEffect, useState, useRef } from 'react';
import * as PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { NavLink as RouterLink, matchPath, useLocation } from 'react-router-dom';
// material
import { alpha, useTheme, styled } from '@mui/material/styles';
import {
  Box,
  List,
  Collapse,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Badge,
  Stack,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
//
import Iconify from './Iconify';
import useServerStats from '@/hooks/useServerStats';
import useDelivery from '@/hooks/useDelivery';
import useProduct from '@/hooks/useProduct';
import useCategory from '@/hooks/useCategory';
import useIdentity from '@/hooks/useIdentity';
import useUsers from '@/hooks/useUsers';
import { RoleCode } from '@/types/Role';
import { IdentityStatus } from '@/types/Identity';
import { NotificationType } from '@/types/Notification';
import { NotificationService } from '@/api/notificationService';
import { useCreateSocket } from '@/contexts/SocketContext';
import useNotification from '@/hooks/useNotification';
import useMessageNotifications from '@/hooks/useMessageNotifications';
import useAuth from '@/hooks/useAuth';

// ----------------------------------------------------------------------

const ListItemStyle = styled((props: any) => <ListItemButton disableGutters {...props} />)(({ theme }) => ({
  ...theme.typography.body2,
  height: 48,
  position: 'relative',
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius,
}));

const ListItemIconStyle = styled(ListItemIcon)({
  width: 22,
  height: 22,
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  active: PropTypes.func,
};

function NavItem({ item, active }: any ) {
  const theme = useTheme();
  const isActiveRoot = active(item.path);
  const {setMessages , messages} = useCreateSocket()
  const { title, path, icon, info, children, disabled } = item;

  const [open, setOpen] = useState(isActiveRoot);

  const handleOpen = () => {
    setOpen((prev: boolean) => !prev);
    if(messages.length > 0){
      console.log("lejdhejhejf");
      
      setMessages([])
    }
  };

  const activeRootStyle = {
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
  };

  const activeSubStyle = {
    color: 'primary.main',
    fontWeight: 'fontWeightMedium',
    bgcolor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
  };

  if (children) {
    return (
      <>
        <ListItemStyle
          onClick={handleOpen}
          sx={{
            ...(isActiveRoot && activeSubStyle),
          }}
          disabled={disabled}
        >
          <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
          <ListItemText disableTypography primary={title} />
          {info && info}
          <Iconify
            icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
            sx={{ width: 16, height: 16, ml: 1 }}
          />
        </ListItemStyle>

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {children.map((childItem: any, index:number) => {
              const { title, path, description, disabled, icon } = childItem;
              const isActiveSub = active(path);

              return (
                <>
                  <ListItemStyle
                    key={index}
                    component={RouterLink}
                    to={path}
                    disabled={disabled}
                    sx={{
                      ...(isActiveSub && activeSubStyle),
                    }}
                  >
                    <ListItemIconStyle>
                    {icon ? (
                      icon
                    ) : (
                      <Box
                        component="span"
                        sx={{
                          width: 4,
                          height: 4,
                          display: 'flex',
                          borderRadius: '50%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'text.disabled',
                          transition: (theme) => theme.transitions.create('transform'),
                          ...(isActiveSub && {
                            transform: 'scale(2)',
                            bgcolor: 'primary.main',
                          }),
                        }}
                      />
                    )}
                    </ListItemIconStyle>
                    <Stack gap={'0px'}>
                      <ListItemText disableTypography primary={title} />
                      {description && (
                        <Typography variant="caption" sx={{ opacity: 1 }}>
                          {description}
                        </Typography>
                      )}
                    </Stack>
                  </ListItemStyle>
                </>
              );
            })}
          </List>
        </Collapse>
      </>
    );
  }

  return (
    <ListItemStyle
      component={RouterLink}
      to={path}
      sx={{
        ...(isActiveRoot && activeRootStyle),
      }}
      disabled={disabled}
    >
      <ListItemIconStyle>{icon && icon}</ListItemIconStyle>
      <ListItemText disableTypography primary={title} />
      {info && info}
    </ListItemStyle>
  );
}

NavSection.propTypes = {
  navConfig: PropTypes.array,
};




export default function NavSection({ ...other }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { deliveries, updateDelivery } = useDelivery();
  const { products, updateProduct } = useProduct();
  const { categories, updateCategory } = useCategory();
  const { identities, updateIdentity } = useIdentity();
  const { users, updateAllUsers } = useUsers();
  const [unreadCount, setUnreadCount] = useState(0);
  

  const { notificationSocket, reget, relode, socket } = useCreateSocket();
  const { unreadCount: hookUnreadCount, test, fetchUnreadCount, notifications } = useNotification();
  const { auth } = useAuth();
  

  const [auctionSoldNotifications, setAuctionSoldNotifications] = useState([]);
  
  // Get message notification count for Chat menu item
  const { totalUnreadCount: messageNotificationCount, fetchNotifications: refreshMessageNotifications } = useMessageNotifications();
  
  // Direct use of messageNotificationCount - no local state needed for better real-time updates
  console.log('💬 NavSection Message Notification Count:', messageNotificationCount);

  console.log('Side => => =>' , hookUnreadCount);

  const match = (path: string) => (path ? !!matchPath({ path, end: false }, pathname) : false);

  const getIcon = (name: string, badgeContent: number | null = null) => {
    if (badgeContent !== null) {
        return (
            <Badge
                badgeContent={badgeContent}
                color="error"
                max={99}
                sx={{ marginRight: 1 }}
            >
                <Iconify icon={name} width={22} height={22} />
            </Badge>
        );
    }
    return <Iconify icon={name} width={22} height={22} />;
  };

  const fetchUnreadNotificationCount = () => {
    NotificationService.getUnreadCount()
      .then(count => console.log('BNB' , count)
      )

      .catch(err => console.error('Failed to fetch unread count:', err));
  };

  // Effect for initial data loading
  useEffect(() => {
    updateDelivery();
    updateProduct();
    updateCategory();
    updateIdentity();
    updateAllUsers();

    // Setup event listener for when notification is read in other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === 'notifications_read') {
        fetchUnreadNotificationCount();
        // Also refresh message notifications when general notifications are read
        if (refreshMessageNotifications) {
          refreshMessageNotifications();
          console.log('💾 NavSection: Storage event triggered, refreshing message notifications');
        }
      }
    });

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('storage', () => {});
    };
  }, []);

  useEffect(()=>{
    // const intervalId =  setInterval(() => {
    //   fetchUnreadNotificationCount()
    // }, 2000);
    // return () => {
    //    clearInterval(intervalId);
    // }
  },[])

  // Effect to update unread count - use the same logic as NotificationsPopover
  useEffect(() => {
    const calculateGeneralNotificationCount = () => {
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
      
      // Filter to get only general notifications (exclude message/chat types AND admin messages)
      const generalNotifications = userNotifications.filter((n) => {
        // Exclude message/chat types
        const isMessageType = n.type === NotificationType.CHAT_CREATED || 
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
        
        return !isMessageType && !isAdminSender && !isAdminMessageTitle;
      });
      
      // Get unread notifications from database
      const unreadNotifications = generalNotifications.filter((n) => !n.read);
      
      // Filter socket notifications to exclude message/chat types AND admin messages
      const filteredSocketNotifications = notificationSocket.filter((n) => {
        // Exclude message/chat related socket notifications
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
          
        return !isMessageNotification && !isAdminSender && !isAdminMessageTitle;
      });
      
      // Ensure socket notifications have valid dates
      const processedSocketNotifications = filteredSocketNotifications.map(notification => ({
        ...notification,
        createdAt: notification.createdAt || new Date()
      }));
      
      // Combine notifications and remove duplicates based on ID (same logic as NotificationsPopover)
      const combinedNotifications = [...processedSocketNotifications, ...unreadNotifications];
      
      // Remove duplicates based on notification ID (_id)
      const uniqueNotifications = combinedNotifications.filter((notification, index, self) => {
        // Find the first occurrence of a notification with this ID
        const firstIndex = self.findIndex(n => n._id === notification._id);
        // Only keep if this is the first occurrence
        return index === firstIndex;
      });
      
      const generalCount = uniqueNotifications.length;
      
      console.log('🔔 NavSection: General notification count (excluding admin messages):', generalCount);
      
      setUnreadCount(generalCount);
    };

    // Calculate immediately when dependencies change
    calculateGeneralNotificationCount();
    
    // Use a longer interval (30 seconds) instead of 1 second to reduce API calls
    const intervalId = setInterval(() => {
      calculateGeneralNotificationCount();
    }, 30000); // Changed from 1000ms to 30000ms

    return () => {
      clearInterval(intervalId);
    };
  }, [hookUnreadCount, test, notificationSocket, notifications, auth?.user?._id]);

  // Effect to handle real-time notification updates from WebSocket
  useEffect(() => {
    if (notificationSocket && notificationSocket.length > 0) {
      // When new notifications come in via socket, update the count
      // Use the cached version from useNotification hook instead of making new API calls
      console.log('🔔 NavSection: New notifications received, updating counts from cache');
    }
  }, [notificationSocket]);

  // Effect to handle database notification changes (not just socket)
  useEffect(() => {
    // When general notifications from database change, refresh message notifications too
    if (refreshMessageNotifications) {
      refreshMessageNotifications();
      console.log('📱 NavSection: Database notifications changed, refreshing message notifications');
    }
  }, [notifications, refreshMessageNotifications]);

  // Remove periodic refresh - rely on socket events and manual refresh instead
  // This significantly reduces API calls while maintaining real-time updates

  useEffect(() => {
    if (!socket) return;
    
    // Debounced handler for auction sold notifications
    const handleAuctionSold = (notification) => {
      const enhancedNotification = {
        ...notification,
        title: 'Congratulations! You sold your auction',
        message: notification.message || 'Your auction has been sold successfully!',
        type: 'success',
        id: Date.now() + Math.random()
      };
      
      setAuctionSoldNotifications((prev) => [enhancedNotification, ...prev]);
      
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setAuctionSoldNotifications((prev) => 
          prev.filter(notif => notif.id !== enhancedNotification.id)
        );
      }, 8000);
    };
    
    // Optimized chat handler to prevent redundant updates
    let chatUpdateTimeout = null;
    const handleChatNotification = (data) => {
      console.log('🔔 NavSection: Chat notification received via socket:', data);
      
      // Debounce chat updates to prevent rapid successive calls
      if (chatUpdateTimeout) {
        clearTimeout(chatUpdateTimeout);
      }
      
      chatUpdateTimeout = setTimeout(() => {
        // Force refresh of message notifications
        if (refreshMessageNotifications) {
          refreshMessageNotifications();
          console.log('🔄 NavSection: Refreshing message notifications after chat notification');
        }
      }, 300); // 300ms debounce
    };
    
    // Handler for when notifications are seen in chat
    const handleNotificationSeenInChat = (event) => {
      console.log('🔍 NavSection: Notification seen in chat, refreshing notifications:', event.detail);
      
      // Refresh notifications to get updated counts from server
      if (refreshMessageNotifications) {
        refreshMessageNotifications();
        console.log('📉 NavSection: Refreshing message notifications after notification seen');
      }
    };

    // Register socket listeners
    socket.on('auctionSoldNotification', handleAuctionSold);
    socket.on('newChatCreatedForSeller', handleChatNotification);
    socket.on('notification', handleChatNotification);
    socket.on('sendMessage', handleChatNotification);
    socket.on('newMessage', handleChatNotification);
    
    // Register window event listener for notification seen events
    window.addEventListener('notificationSeenInChat', handleNotificationSeenInChat);
    
    // Register listener for database notification updates
    const handleDatabaseNotificationUpdate = () => {
      if (refreshMessageNotifications) {
        refreshMessageNotifications();
        console.log('🗄️ NavSection: Database notification update event triggered');
      }
    };
    window.addEventListener('databaseNotificationUpdate', handleDatabaseNotificationUpdate);
    
    return () => {
      // Clean up listeners and timeout
      if (chatUpdateTimeout) {
        clearTimeout(chatUpdateTimeout);
      }
      
      socket.off('auctionSoldNotification', handleAuctionSold);
      socket.off('newChatCreatedForSeller', handleChatNotification);
      socket.off('notification', handleChatNotification);
      socket.off('sendMessage', handleChatNotification);
      socket.off('newMessage', handleChatNotification);
      
      // Clean up window event listener
      window.removeEventListener('notificationSeenInChat', handleNotificationSeenInChat);
      window.removeEventListener('databaseNotificationUpdate', handleDatabaseNotificationUpdate);
    };
  }, [socket, messageNotificationCount, refreshMessageNotifications]);

  console.log('LLLLLL = > >+ >= >= > ',window.localStorage.getItem('no'));

  useEffect(()=>{
    console.log('Imade is tall');
  },[window.localStorage.getItem('no')])

  // Test event listener for auction win notification
  useEffect(() => {
    const handleTestAuctionWin = (event) => {
      const enhancedNotification = {
        title: event.detail.title,
        message: event.detail.message,
        type: 'success',
        id: Date.now() + Math.random()
      };
      setAuctionSoldNotifications((prev) => [enhancedNotification, ...prev]);
      
      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setAuctionSoldNotifications((prev) => 
          prev.filter(notif => notif.id !== enhancedNotification.id)
        );
      }, 8000);
    };

    window.addEventListener('testAuctionWin', handleTestAuctionWin);
    return () => {
      window.removeEventListener('testAuctionWin', handleTestAuctionWin);
    };
  }, []);
  
  const pendingRiders = identities.filter((identity) =>
    identity.status === IdentityStatus.PENDING || identity.status === IdentityStatus.FAILED);



  const navConfig = [
    {title: t('navigation.dashboard'), path: '/dashboard/app', icon: getIcon('typcn:chart-pie')},
    {
      title: t('navigation.auctions'),
      path: '/dashboard/auctions',
      icon: getIcon('mdi:gavel'),
    },
    {
      title: t('navigation.offers'),
      path: '/dashboard/offers',
      icon: getIcon('mdi:hand-coin'),
    },
    // {
    //   title: t('navigation.participants'),
    //   path: '/dashboard/participants',
    //   icon: getIcon('mdi:account-group'),
    // },
    // {title: t('navigation.categories'), path: '/dashboard/categories', icon: getIcon('material-symbols:category')},
    // {title: t('navigation.subCategories'), path: '/dashboard/sou-categories', icon: getIcon('material-symbols:category')},
    // Chat menu - shows MESSAGE notifications count (handled by MessagesPopover)
    {title: t('navigation.chat'), path: '/dashboard/chat', icon: getIcon('material-symbols:chat', messageNotificationCount > 0 ? messageNotificationCount : null)},
    // Notifications menu - shows GENERAL notifications count ONLY (excludes messages/chat)
    // Count is filtered to exclude: CHAT_CREATED, MESSAGE_RECEIVED, conversation, chat, message, etc.
    {
      title: t('navigation.notifications'),
      path: '/dashboard/notifications',
      icon: getIcon('mdi:bell', pathname === '/dashboard/notifications' ? null : (unreadCount > 0 ? unreadCount : null)),
    },
  ];

  // Debug: Log the current state to see what's happening
  console.log('🔔 NavSection Debug:', {
    unreadCount,
    messageNotificationCount,
    authUser: auth?.user,
    authUserId: auth?.user?._id,
    pathname,
    isNotificationsPage: pathname === '/dashboard/notifications',
    badgeContent: pathname === '/dashboard/notifications' ? null : (unreadCount > 0 ? unreadCount : null)
  });



  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {navConfig.map((item, index) => (
          <NavItem key={index} item={item} active={match} />
        ))}
      </List>
      {auctionSoldNotifications.length > 0 && (
        <Box sx={{ position: 'fixed', top: 80, right: 20, zIndex: 2000 }}>
          {auctionSoldNotifications.map((notif, idx) => (
            <Paper 
              key={idx} 
              elevation={8}
              sx={{ 
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                border: '2px solid #4CAF50',
                borderRadius: 3,
                p: 2.5,
                mb: 1.5,
                minWidth: 350,
                maxWidth: 400,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                animation: 'slideInFromRight 0.5s ease-out',
                '@keyframes slideInFromRight': {
                  '0%': {
                    transform: 'translateX(100%)',
                    opacity: 0,
                  },
                  '100%': {
                    transform: 'translateX(0)',
                    opacity: 1,
                  },
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite',
                  '@keyframes shimmer': {
                    '0%': {
                      backgroundPosition: '-200% 0',
                    },
                    '100%': {
                      backgroundPosition: '200% 0',
                    },
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Box sx={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  p: 1,
                  mr: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Typography variant="h6">🎉</Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  {notif.title}
                </Typography>
                
                <IconButton
                  size="small"
                  onClick={() => {
                    setAuctionSoldNotifications(prev => prev.filter((_, index) => index !== idx));
                  }}
                  sx={{
                    color: 'white',
                    background: 'rgba(255,255,255,0.2)',
                    width: 24,
                    height: 24,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.3)',
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: '14px' }}>✕</Typography>
                </IconButton>
              </Box>
              
              <Typography variant="body2" sx={{ 
                opacity: 0.95,
                lineHeight: 1.4,
                ml: 6
              }}>
                {notif.message}
              </Typography>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
}
