import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { NotificationService, Notification } from '@/api/notificationService';
import { useCreateSocket } from '@/contexts/SocketContext';
import useAuth from '@/hooks/useAuth';

// Global cache to prevent duplicate requests across hook instances
const notificationCache = {
  data: null as Notification[] | null,
  unreadCount: null as number | null,
  lastFetch: 0,
  lastUnreadFetch: 0,
  isFetching: false,
  isUnreadFetching: false,
  subscribers: new Set<() => void>(),
};

// Cache invalidation time (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to format dates
function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Check if invalid date
  if (isNaN(date.getTime())) return dateString;
  
  // Today - show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hier';
  }
  
  // This week - show day name
  const sixDaysAgo = new Date(now);
  sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
  if (date > sixDaysAgo) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Older - show date
  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const socketContext = useCreateSocket();
  if (!socketContext) {
    throw new Error('useNotification must be used within a SocketProvider');
  }
  const {setNotificationSocket , setRelode, socket} = socketContext;
  const [test, setTest] = useState(false);
  const { auth, isLogged } = useAuth();
  
  // Filter out admin messages from all notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Exclude admin messages by sender
      const isAdminSender = 
        notification.data?.users?.[0]?._id === 'admin' ||
        notification.data?.users?.[0]?.AccountType === 'admin' ||
        notification.data?.senderId === 'admin' ||
        notification.data?.sender?._id === 'admin' ||
        notification.data?.sender?.AccountType === 'admin';
      
      // Exclude admin messages by title
      const isAdminMessageTitle = notification.title === 'Nouveau message de l\'admin';
      
      // Exclude admin message types
      const isAdminMessageType = notification.type === 'MESSAGE_ADMIN';
      
      return !isAdminSender && !isAdminMessageTitle && !isAdminMessageType;
    });
  }, [notifications]);
  
  // Calculate filtered unread count
  const filteredUnreadCount = useMemo(() => {
    return filteredNotifications.filter(notification => !notification.read).length;
  }, [filteredNotifications]);
  
  // Refs to track component state
  const componentMounted = useRef(true);
  const lastFetchTime = useRef(0);

  // Subscribe to cache updates
  useEffect(() => {
    const updateFromCache = () => {
      if (notificationCache.data !== null) {
        setNotifications(notificationCache.data);
      }
      if (notificationCache.unreadCount !== null) {
        setUnreadCount(notificationCache.unreadCount);
      }
    };

    notificationCache.subscribers.add(updateFromCache);
    
    // Initial update from cache if available
    updateFromCache();
    
    return () => {
      notificationCache.subscribers.delete(updateFromCache);
    };
  }, []);

  // Notify all subscribers of cache updates
  const notifySubscribers = useCallback(() => {
    notificationCache.subscribers.forEach(callback => callback());
  }, []);

  // Fetch all notifications with caching and deduplication
  const fetchNotifications = useCallback(async (force = false) => {
    if (!isLogged || !auth.user?._id) {
      console.log('User not logged in or user ID not available', { isLogged, userId: auth.user?._id });
      setLoading(false);
      return;
    }

    const now = Date.now();
    const cacheAge = now - notificationCache.lastFetch;
    
    // Use cache if it's fresh and not forcing refresh
    if (!force && notificationCache.data !== null && cacheAge < CACHE_DURATION) {
      console.log('📦 Using cached notifications (age:', Math.round(cacheAge / 1000), 's)');
      setNotifications(notificationCache.data);
      setLoading(false);
      return;
    }

    // Prevent duplicate requests
    if (notificationCache.isFetching) {
      console.log('⏳ Notification fetch already in progress, skipping');
      return;
    }

    // Rate limiting: don't fetch more than once per 2 seconds
    if (!force && now - lastFetchTime.current < 2000) {
      console.log('⏱️ Rate limiting: skipping fetch (last fetch was', Math.round((now - lastFetchTime.current) / 1000), 's ago)');
      return;
    }

    try {
      notificationCache.isFetching = true;
      setLoading(true);
      lastFetchTime.current = now;
      
      console.log('🔄 Fetching notifications for user:', auth.user._id);
      const data = await NotificationService.getAllNotifications();
      
      console.log('✅ Total notifications loaded:', (data || []).length);
      console.log('🔍 DEBUG: Raw notifications from backend:', data);
      console.log('🔍 DEBUG: User ID being used:', auth.user._id);
      console.log('🔍 DEBUG: User authentication status:', { isLogged, userId: auth.user?._id });
      
      // Update cache
      notificationCache.data = data || [];
      notificationCache.lastFetch = now;
      
      // Update local state
      setNotifications(data || []);
      setError(null);
      
      // Notify all subscribers
      notifySubscribers();
      
      // Dispatch event to notify other components of database update
      window.dispatchEvent(new CustomEvent('databaseNotificationUpdate', { 
        detail: { action: 'fetchNotifications', count: (data || []).length } 
      }));
      
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('❌ Error fetching notifications:', err);
    } finally {
      notificationCache.isFetching = false;
      setLoading(false);
    }
  }, [isLogged, auth.user?._id, notifySubscribers]);

  // Fetch unread count with caching and deduplication
  const fetchUnreadCount = useCallback(async (force = false) => {
    if (!isLogged || !auth.user?._id) {
      console.log('User not logged in, skipping unread count fetch', { isLogged, userId: auth.user?._id });
      return;
    }

    const now = Date.now();
    const cacheAge = now - notificationCache.lastUnreadFetch;
    
    // Use cache if it's fresh and not forcing refresh
    if (!force && notificationCache.unreadCount !== null && cacheAge < CACHE_DURATION) {
      console.log('📦 Using cached unread count (age:', Math.round(cacheAge / 1000), 's)');
      setUnreadCount(notificationCache.unreadCount);
      return;
    }

    // Prevent duplicate requests
    if (notificationCache.isUnreadFetching) {
      console.log('⏳ Unread count fetch already in progress, skipping');
      return;
    }

    try {
      notificationCache.isUnreadFetching = true;
      console.log('🔄 Fetching unread count for user:', auth.user._id);
      const count = await NotificationService.getUnreadCount();
      
      // Update cache
      notificationCache.unreadCount = count;
      notificationCache.lastUnreadFetch = now;
      
      // Update local state
      setUnreadCount(count);
      console.log('✅ Unread count for user', auth.user._id, ':', count);
      
      // Store in localStorage
      window.localStorage.setItem('no', JSON.stringify(count));
      
      // Notify all subscribers
      notifySubscribers();
      
    } catch (err) {
      console.error('❌ Error fetching unread count:', err);
    } finally {
      notificationCache.isUnreadFetching = false;
    }
  }, [isLogged, auth.user?._id, notifySubscribers]);

  // Mark a notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      
      // Update the local state immediately for better UX
      setNotifications(prevNotifications =>
        prevNotifications.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
      
      // Update cache immediately
      if (notificationCache.data) {
        notificationCache.data = notificationCache.data.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification
        );
      }
      
      // Update unread count immediately (decrement by 1)
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (notificationCache.unreadCount !== null) {
        notificationCache.unreadCount = Math.max(0, notificationCache.unreadCount - 1);
      }
      
      // Update socket context
      setNotificationSocket([]);
      setTest((p) => !p);
      setRelode(p=>!p);
      
      // Notify all subscribers
      notifySubscribers();
      
      // Force refresh unread count from server to ensure accuracy
      fetchUnreadCount(true);
      
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [setNotificationSocket, setRelode, fetchUnreadCount, notifySubscribers]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      
      // Update the local state immediately for better UX
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Update cache immediately
      if (notificationCache.data) {
        notificationCache.data = notificationCache.data.map(notification => ({ ...notification, read: true }));
      }
      
      // Update unread count immediately
      setUnreadCount(0);
      notificationCache.unreadCount = 0;
      
      // Update socket context
      setNotificationSocket([]);
      setTest((p) => !p);
      setRelode(p=>!p);
      
      // Notify all subscribers
      notifySubscribers();
      
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [notifySubscribers, setNotificationSocket, setRelode]);

  // Socket event listener with improved deduplication
  useEffect(() => {
    if (!socket || !isLogged || !auth.user?._id) {
      console.log('🔌 Socket setup skipped:', { hasSocket: !!socket, isLogged, userId: auth.user?._id });
      return;
    }
    
    // Track processed notifications to prevent duplicates
    const processedNotifications = new Set<string>();
    
    const handleNotification = (data: any) => {
      console.log('🔔 Seller socket notification received:', data);
      
      // Create a unique key for this notification
      const notificationKey = data._id || `${data.type}-${data.userId}-${data.title}-${Date.now()}`;
      
      // Check if this notification was already processed
      if (processedNotifications.has(notificationKey)) {
        console.log('🚫 Notification already processed, skipping:', notificationKey);
        return;
      }
      
      // Mark as processed immediately
      processedNotifications.add(notificationKey);
      
      // Check if we have the full notification data in the socket event
      if (data && data._id && data.title && data.message) {
        // Real-time: Add notification directly from socket data
        const formattedNotification = {
          ...data,
          formattedDate: formatDate(data.createdAt || new Date().toISOString())
        };
        
        setNotifications(prev => {
          // Check if notification already exists to avoid duplicates
          const exists = prev.some(notif => notif._id === data._id);
          if (exists) return prev;
          
          // Add new notification at the beginning
          return [formattedNotification, ...prev];
        });
        
        // Update cache
        if (notificationCache.data) {
          const exists = notificationCache.data.some(notif => notif._id === data._id);
          if (!exists) {
            notificationCache.data = [formattedNotification, ...notificationCache.data];
          }
        }
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        if (notificationCache.unreadCount !== null) {
          notificationCache.unreadCount += 1;
        }
        
        // Notify all subscribers
        notifySubscribers();
        
        console.log('✅ Real-time seller: Added notification for user', auth.user._id, ':', formattedNotification);
      } else {
        // Fallback: Refresh from database if socket doesn't have complete data
        console.log('⚠️ Fallback seller: Socket notification incomplete, fetching from database');
        fetchNotifications(true);
        fetchUnreadCount(true);
      }
    };
    
    // Subscribe to socket events
    socket.on('notification', handleNotification);
    
    // Cleanup function
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, isLogged, auth.user?._id]); // Simplified dependency array

  // Listen for notification read events from the notifications page and chat notifications
  useEffect(() => {
    const handleNotificationRead = () => {
      console.log('🔔 Notification read event received, refreshing counts...');
      fetchUnreadCount(true);
      fetchNotifications(true);
    };

    // Listen for custom events dispatched from various components
    window.addEventListener('notificationRead', handleNotificationRead);
    window.addEventListener('databaseNotificationUpdate', handleNotificationRead);

    return () => {
      window.removeEventListener('notificationRead', handleNotificationRead);
      window.removeEventListener('databaseNotificationUpdate', handleNotificationRead);
    };
  }, [fetchUnreadCount, fetchNotifications]);

  // Initial fetch - only when user is logged in
  useEffect(() => {
    console.log('🚀 Initial fetch effect triggered:', { isLogged, userId: auth.user?._id, test });
    if (isLogged && auth.user?._id) {
      console.log('✅ Initial fetch for authenticated user:', auth.user._id);
      fetchNotifications();
      fetchUnreadCount();
    } else {
      console.log('❌ Skipping initial fetch - user not authenticated');
    }
  }, [test, isLogged, auth.user?._id, fetchNotifications, fetchUnreadCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false;
    };
  }, []);

  return {
    notifications: filteredNotifications, // Return filtered notifications (excludes admin messages)
    unreadCount: filteredUnreadCount, // Return filtered unread count (excludes admin messages)
    loading,
    error,
    test,
    setNotifications,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead
  };
}