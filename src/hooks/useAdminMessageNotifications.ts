import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useCreateSocket } from '@/contexts/SocketContext';
import { authStore } from '@/contexts/authStore';
import useNotification from './useNotification';

// Global cache for admin message notifications to prevent duplicates across components
const globalAdminMessageCache = {
  processedMessages: new Set<string>(),
  lastProcessedTime: 0,
  messageCounts: new Map<string, number>() // Track count per message ID
};

const MESSAGE_CACHE_DURATION = 5000; // 5 seconds

// Key for storing last seen timestamp in localStorage
const getLastSeenKey = (userId: string) => `admin_chat_last_seen_${userId}`;

function getSenderName(data: any): string {
  if (!data) return 'Unknown';
  
  // Handle different data structures
  if (data.senderName) return data.senderName;
  if (data.name) return data.name;
  if (data.firstName && data.lastName) return `${data.firstName} ${data.lastName}`;
  if (data.firstName) return data.firstName;
  if (data.lastName) return data.lastName;
  
  return 'Unknown';
}

export default function useAdminMessageNotifications() {
  const [socketMessages, setSocketMessages] = useState([]);
  const [newNotifications, setNewNotifications] = useState([]); // Track only new notifications
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0); // Track when user last saw notifications
  
  // Get current user from auth store
  const { auth } = authStore();
  const currentUserId = auth?.user?._id;
  
  // Check if we're on auth-related pages and disable notifications entirely
  const isOnAuthPage = typeof window !== 'undefined' && (
    window.location.pathname.includes('/login') ||
    window.location.pathname.includes('/register') ||
    window.location.pathname.includes('/otp-verification') ||
    window.location.pathname.includes('/reset-password') ||
    window.location.pathname.includes('/identity-verification') ||
    window.location.pathname.includes('/subscription-plans')
  );
  
  // Get socket context
  const socketContext = useCreateSocket();
  
  // Get database notifications directly to avoid filtering issues
  const [dbNotifications, setDbNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load last seen timestamp from localStorage
  useEffect(() => {
    if (currentUserId && typeof window !== 'undefined') {
      const lastSeenKey = getLastSeenKey(currentUserId);
      const stored = localStorage.getItem(lastSeenKey);
      if (stored) {
        const timestamp = parseInt(stored, 10);
        setLastSeenTimestamp(timestamp);
        console.log('📅 Loaded last seen timestamp:', new Date(timestamp));
      } else {
        // If no timestamp stored, set to current time (so no old notifications show)
        const now = Date.now();
        setLastSeenTimestamp(now);
        localStorage.setItem(lastSeenKey, now.toString());
        console.log('📅 Set initial last seen timestamp:', new Date(now));
      }
    }
  }, [currentUserId]);
  
  // Function to update last seen timestamp (when chat is opened)
  const updateLastSeenTimestamp = useCallback(() => {
    if (currentUserId && typeof window !== 'undefined') {
      const now = Date.now();
      const lastSeenKey = getLastSeenKey(currentUserId);
      setLastSeenTimestamp(now);
      localStorage.setItem(lastSeenKey, now.toString());
      console.log('📅 Updated last seen timestamp:', new Date(now));
    }
  }, [currentUserId]);
  
  // Fetch admin notifications directly
  const fetchAdminNotifications = useCallback(async () => {
    if (!currentUserId || isOnAuthPage) {
      console.log('🚫 Skipping notification fetch - no user or on auth page');
      return;
    }
    
    try {
      setLoading(true);
      const auth = typeof window !== 'undefined' ? window.localStorage.getItem('auth') : null;
      if (!auth) {
        console.log('🚫 No auth found in localStorage');
        return;
      }
      
      let parsedAuth;
      try {
        parsedAuth = JSON.parse(auth);
      } catch (parseError) {
        console.log('🚫 Failed to parse auth from localStorage');
        return;
      }
      
      const { tokens, user } = parsedAuth;
      if (!tokens?.accessToken || !user?._id) {
        console.log('🚫 No tokens or user ID found');
        return;
      }
      
      // Additional check to ensure user is the same as currentUserId
      if (user._id !== currentUserId) {
        console.log('🚫 User ID mismatch:', { stored: user._id, current: currentUserId });
        return;
      }
      
      console.log('🔍 Fetching notifications for user:', currentUserId);
      
      // Use the proper NotificationService instead of direct fetch
      const { NotificationService } = await import('@/api/notificationService');
      const allNotifications = await NotificationService.getAllNotifications();
      
      console.log('📨 All notifications received:', allNotifications.length);
      console.log('📨 Notification types:', allNotifications.map(n => n.type));
      console.log('📨 Notification titles:', allNotifications.map(n => n.title));
      console.log('📨 Notification user IDs:', allNotifications.map(n => n.userId));
        
      // Filter for ONLY MESSAGE_RECEIVED notifications (admin messages to user)
      // Users should only see MESSAGE_RECEIVED notifications (admin → user)
      const userMessageNotifications = allNotifications.filter((notification: any) => {
        // Only include MESSAGE_RECEIVED type (admin sending to user)
        const isMessageReceived = notification.type === 'MESSAGE_RECEIVED';
        
        // Check if notification belongs to current user
        const belongsToCurrentUser = 
          notification.userId === currentUserId || 
          notification.receiverId === currentUserId;
        
        // Check if sender is admin (admin sending to user)
        const isFromAdmin = 
          notification.data?.senderId === 'admin' ||
          notification.data?.sender?._id === 'admin' ||
          notification.title === 'Nouveau message de l\'admin';
        
        const shouldInclude = isMessageReceived && belongsToCurrentUser && isFromAdmin;
        
        if (shouldInclude) {
          console.log('✅ Including notification:', {
            id: notification._id,
            type: notification.type,
            title: notification.title,
            userId: notification.userId,
            senderId: notification.data?.senderId
          });
        }
        
        return shouldInclude;
      });
        
      setDbNotifications(userMessageNotifications);
      console.log('📨 Filtered user message notifications:', userMessageNotifications.length);
    } catch (error) {
      console.error('❌ Error fetching user message notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, isOnAuthPage]);
  
  // Refs for tracking component state
  const componentMounted = useRef(true);
  const lastRefreshTime = useRef(0);
  
  // Filter notifications - only MESSAGE_RECEIVED for users
  const userMessageNotifications = useMemo(() => {
    return dbNotifications?.filter(n => {
      // Only MESSAGE_RECEIVED type (admin → user)
      const isMessageReceived = n.type === 'MESSAGE_RECEIVED';
      
      // Check if notification belongs to current user
      const belongsToCurrentUser = 
        n.userId === currentUserId || 
        n.receiverId === currentUserId;
      
      // Check if sender is admin
      const isFromAdmin = 
        n.data?.senderId === 'admin' ||
        n.data?.sender?._id === 'admin' ||
        n.title === 'Nouveau message de l\'admin';
      
      return isMessageReceived && belongsToCurrentUser && isFromAdmin;
    }) || [];
  }, [dbNotifications, currentUserId]);

  // Optimized refresh function with rate limiting
  const refreshNotifications = useCallback(() => {
    const now = Date.now();
    
    // Rate limiting: don't refresh more than once per 5 seconds
    if (now - lastRefreshTime.current < 5000) {
      console.log('⏱️ Rate limiting: skipping user message notification refresh');
      return;
    }
    
    console.log('🔄 Refreshing user message notifications');
    lastRefreshTime.current = now;
    fetchAdminNotifications();
  }, [fetchAdminNotifications]);

  // Calculate unread count for ONLY NEW user message notifications - SIMPLIFIED
  const unreadAdminMessagesCount = useMemo(() => {
    // FALLBACK: Only count database notifications if no socket messages
    // This prevents duplicate counting when both socket and database notifications exist
    const newUserNotifications = userMessageNotifications.filter(n => {
      const notificationTime = new Date(n.createdAt || n.updatedAt || 0).getTime();
      return notificationTime > lastSeenTimestamp;
    });
    
    // Count new notifications (real-time socket notifications)
    const newNotificationCount = newNotifications.length;
    
    // PRIORITY: Use real-time notifications, fallback to database
    let totalCount;
    if (newNotificationCount > 0) {
      // Use notification count (real-time badge updates)
      totalCount = newNotificationCount;
      console.log('📊 Using NOTIFICATION-based count (real-time badge):', {
        newNotifications: newNotificationCount,
        total: totalCount
      });
    } else {
      // Fallback to database notifications
      totalCount = newUserNotifications.length;
      console.log('📊 Using DATABASE-based count (fallback):', {
        newDatabaseNotifications: newUserNotifications.length,
        total: totalCount
      });
    }
    
    console.log('📊 Final notification count breakdown:', {
      newNotifications: newNotificationCount,
      databaseNotifications: newUserNotifications.length,
      lastSeenTimestamp: new Date(lastSeenTimestamp),
      finalCount: totalCount
    });
    
    return totalCount;
  }, [currentUserId, userMessageNotifications, newNotifications, lastSeenTimestamp]);

  // REMOVED: handleNewAdminMessage function
  // This hook now only handles notifications, not message display
  // Message display is handled by FloatingAdminChat component

  // Handle real-time notifications from socket - ONLY MESSAGE_RECEIVED for users
  const handleNewNotification = useCallback((notification) => {
    console.log("🔔 New notification received:", notification);
    
    // Users should only receive MESSAGE_RECEIVED notifications (admin → user)
    const isMessageReceived = notification.type === 'MESSAGE_RECEIVED';
    
    const isForCurrentUser = 
      notification.userId === currentUserId ||
      notification.receiverId === currentUserId;
    
    const isFromAdmin = 
      notification.data?.senderId === 'admin' ||
      notification.data?.sender?._id === 'admin' ||
      notification.title === 'Nouveau message de l\'admin';
    
    if (isMessageReceived && isForCurrentUser && isFromAdmin) {
      console.log("✅ Adding new user message notification for real-time badge");
      
      // Use a unique key for this notification to prevent duplicates
      const notificationKey = `notification-${notification._id || notification.userId}-${Date.now()}`;
      
      // Check if this notification was already processed
      if (globalAdminMessageCache.processedMessages.has(notificationKey)) {
        console.log("🚫 Notification already processed, skipping");
        return;
      }
      
      setNewNotifications(prev => {
        // Check if notification already exists
        const exists = prev.some(n => 
          n._id === notification._id || 
          (n.type === notification.type && n.userId === notification.userId)
        );
        
        if (exists) {
          console.log("🚫 Notification already exists in state");
          return prev;
        }
        
        console.log("✅ Adding notification to newNotifications for real-time badge");
        return [...prev, notification];
      });
      
      // Mark as processed
      globalAdminMessageCache.processedMessages.add(notificationKey);
    } else {
      console.log("🚫 Ignoring notification - not MESSAGE_RECEIVED or not from admin to user");
    }
  }, [currentUserId]);

  // Socket event handlers with deduplication - ONLY notifications
  useEffect(() => {
    if (!socketContext?.socket) return;
    
    console.log('🔌 Setting up user notification socket listeners');
    
    // Listen to 'notification' event for real-time badge updates ONLY
    socketContext.socket.on('notification', handleNewNotification);
    
    return () => {
      console.log('🔌 Cleaning up user notification socket listeners');
      socketContext.socket.off('notification', handleNewNotification);
    };
  }, [socketContext?.socket, handleNewNotification, currentUserId]);

  // Function to clear new notifications (when chat is opened)
  const clearSocketMessages = useCallback(() => {
    console.log("🧹 Clearing new notifications");
    setNewNotifications([]); // Clear new notifications when chat is opened
    // Clear global cache
    globalAdminMessageCache.processedMessages.clear();
    globalAdminMessageCache.lastProcessedTime = 0;
    globalAdminMessageCache.messageCounts.clear();
    // Update last seen timestamp
    updateLastSeenTimestamp();
  }, [updateLastSeenTimestamp]);

  // Auto-fetch on mount and when currentUserId changes - DISABLED during login
  useEffect(() => {
    // Skip all notifications fetch during login/authentication process
    if (!componentMounted.current || !currentUserId || isOnAuthPage) {
      return; // Silent return
    }

    // Add a delay to ensure authentication is complete before making API calls
    const timeoutId = setTimeout(() => {
      if (componentMounted.current && currentUserId && !isOnAuthPage) {
        // Check if user is fully authenticated before fetching
        const auth = typeof window !== 'undefined' ? window.localStorage.getItem('auth') : null;
        if (auth) {
          try {
            const { tokens, user } = JSON.parse(auth);
            if (tokens?.accessToken && user?._id && user._id === currentUserId) {
              console.log('User message notifications: Fetching for user:', currentUserId);
              fetchAdminNotifications();
            }
          } catch (error) {
            // Silent error handling during auth flow
          }
        }
      }
    }, 1500); // Reduced to 1.5 seconds

    return () => clearTimeout(timeoutId);
  }, [currentUserId, isOnAuthPage]); // Removed fetchAdminNotifications from deps

  // Fetch notifications when user comes online (socket connects) - with delay
  useEffect(() => {
    if (socketContext?.socket?.connected && currentUserId && !isOnAuthPage) {
      // Add delay to prevent immediate API calls during login
      const timeoutId = setTimeout(() => {
        if (!isOnAuthPage) { // Double-check auth page status
          const auth = typeof window !== 'undefined' ? window.localStorage.getItem('auth') : null;
          if (auth) {
            try {
              const { tokens, user } = JSON.parse(auth);
              if (tokens?.accessToken && user?._id && user._id === currentUserId) {
                console.log('User message notifications: Socket connected, fetching');
                fetchAdminNotifications();
              }
            } catch (error) {
              // Silent error handling
            }
          }
        }
      }, 2000); // Reduced to 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [socketContext?.socket?.connected, currentUserId, isOnAuthPage]); // Removed fetchAdminNotifications from deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Return safe empty values when on auth pages
  if (isOnAuthPage) {
    return {
      adminNotifications: [],
      socketMessages: [],
      newNotifications: [],
      totalUnreadCount: 0,
      unreadAdminMessagesCount: 0,
      refreshNotifications: () => {},
      fetchNotifications: () => {},
      loading: false,
      clearSocketMessages: () => {},
      updateLastSeenTimestamp: () => {}
    };
  }

  return {
    adminNotifications: userMessageNotifications, // Return user message notifications
    socketMessages,
    newNotifications,
    totalUnreadCount: unreadAdminMessagesCount,
    unreadAdminMessagesCount,
    refreshNotifications,
    fetchNotifications: fetchAdminNotifications,
    loading,
    clearSocketMessages,
    updateLastSeenTimestamp
  };
} 
