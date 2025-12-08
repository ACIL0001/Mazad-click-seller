import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useCreateSocket } from '@/contexts/SocketContext';
import useNotification from '@/hooks/useNotification';
import { authStore } from '@/contexts/authStore';
import { INotification } from '@/types/Notification';

// Global cache for message notifications to prevent duplicate processing
const messageNotificationCache = {
  lastProcessedTime: 0,
  processedMessages: new Set<string>(),
  isProcessing: false,
};

// Cache invalidation time (2 minutes for message notifications)
const MESSAGE_CACHE_DURATION = 2 * 60 * 1000;

/**
 * Extract the actual sender name from notification or socket data
 */
function getSenderName(data: any): string {
  console.log('🔍 Getting sender name from data:', data);
  
  // Try multiple possible name fields in order of preference
  if (data?.firstName && data?.lastName) {
    return `${data.firstName} ${data.lastName}`.trim();
  }
  if (data?.firstName) {
    return data.firstName;
  }
  if (data?.lastName) {
    return data.lastName;
  }
  if (data?.userName) {
    return data.userName;
  }
  if (data?.winnerName) {
    return data.winnerName;
  }
  if (data?.senderName) {
    return data.senderName;
  }
  if (data?.buyerName) {
    return data.buyerName;
  }
  if (data?.name) {
    return data.name;
  }
  
  // If no name found, return a generic name
  return 'Utilisateur';
}

export default function useMessageNotifications() {
  const [socketMessages, setSocketMessages] = useState([]);
  
  // Get current user from auth store
  const { auth } = authStore();
  const currentUserId = auth?.user?._id || auth?.user?.id;
  
  // Get socket context
  const socketContext = useCreateSocket();
  
  // Get database notifications using the hook
  const { notifications: dbNotifications, fetchNotifications } = useNotification();
  
  // Refs for tracking component state
  const componentMounted = useRef(true);
  const lastRefreshTime = useRef(0);
  
  // Track changes in database notifications to ensure real-time updates
  useEffect(() => {
    console.log('📱 Database notifications changed:', {
      total: dbNotifications?.length || 0,
      chatRelated: dbNotifications?.filter(n => 
        n.type === 'CHAT_CREATED' || n.type === 'MESSAGE_RECEIVED'
      ).length || 0
    });
  }, [dbNotifications]);
  
  // Filter CHAT_CREATED and MESSAGE_RECEIVED notifications from database
  // Exclude notifications where sender is admin or title is "Nouveau message de l'admin"
  // AND filter by current user ID
  const chatNotifications = useMemo(() => {
    return dbNotifications?.filter(n => {
      const isCorrectType = n.type === 'CHAT_CREATED' || n.type === 'MESSAGE_RECEIVED';
      
      // Check if notification belongs to current user
      const belongsToCurrentUser = 
        n.userId === currentUserId || 
        n.receiverId === currentUserId ||
        n.data?.sellerId === currentUserId ||
        n.data?.userId === currentUserId;
      
      // Check if sender is admin (exclude admin messages from regular chat notifications)
      const isAdminSender = 
        n.data?.users?.[0]?._id === 'admin' ||
        n.data?.users?.[0]?.AccountType === 'admin' ||
        n.data?.senderId === 'admin' ||
        n.data?.sender?._id === 'admin' ||
        n.data?.sender?.AccountType === 'admin';
      
      // Check if title is admin message (exclude notifications with admin message title)
      const isAdminMessageTitle = n.title === 'Nouveau message de l\'admin' || n.title === 'Nouveau message de l\'admin';
      
      return isCorrectType && belongsToCurrentUser && !isAdminSender && !isAdminMessageTitle;
    }) || [];
  }, [dbNotifications, currentUserId]);

  // Optimized refresh function with rate limiting
  const refreshNotifications = useCallback(() => {
    const now = Date.now();
    
    // Rate limiting: don't refresh more than once per 5 seconds
    if (now - lastRefreshTime.current < 5000) {
      console.log('⏱️ Rate limiting: skipping message notification refresh');
      return;
    }
    
    if (fetchNotifications) {
      console.log('🔄 Refreshing message notifications');
      lastRefreshTime.current = now;
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // CONVERSATION-BASED GROUPING SYSTEM
  const uniqueChatMessages = useMemo(() => {
    console.log('🔄 Starting CONVERSATION-BASED grouping process...');
    
    // Step 1: Combine and normalize all messages
    const allMessages = [
      ...socketMessages.map(msg => ({
        ...msg,
        messageId: msg._id || msg.id,
        chatId: msg.chatId,
        senderName: getSenderName(msg),
        messageText: msg.message || '',
        isUnRead: msg.isUnRead !== false,
        createdAt: new Date(msg.createdAt || Date.now()),
        source: 'socket',
        type: msg.type || 'message'
      })),
      ...chatNotifications.map(notification => ({
        ...notification,
        messageId: notification._id || notification.id,
        chatId: notification.data?.chatId || notification.chatId,
        senderName: getSenderName(notification.data || notification),
        messageText: notification.message || '',
        isUnRead: !notification.read,
        createdAt: new Date(notification.createdAt || Date.now()),
        source: 'database',
        type: notification.type === 'CHAT_CREATED' ? 'chat_created' : 'message',
        // Keep original fields for UI
        avatar: null,
        name: getSenderName(notification.data || notification),
        message: notification.message
      }))
    ];

    console.log('📝 All messages before grouping (filtered by user):', allMessages.length);

    // Step 2: Group by conversation (chatId + senderName)
    const conversationGroups = new Map();
    
    for (const message of allMessages) {
      if (!message.chatId) {
        console.log('🚫 Skipping message without chatId:', message);
        continue; // Skip messages without chat ID
      }
      
      const conversationKey = `${message.chatId}-${message.senderName}`;
      
      if (!conversationGroups.has(conversationKey)) {
        conversationGroups.set(conversationKey, {
          chatId: message.chatId,
          senderName: message.senderName,
          messages: [],
          hasUnread: false,
          latestMessage: null,
          latestTimestamp: 0
        });
      }
      
      const conversation = conversationGroups.get(conversationKey);
      conversation.messages.push(message);
      
      // Track if conversation has any unread messages
      if (message.isUnRead) {
        conversation.hasUnread = true;
      }
      
      // Keep track of the latest message
      const messageTime = message.createdAt.getTime();
      if (messageTime > conversation.latestTimestamp) {
        conversation.latestTimestamp = messageTime;
        conversation.latestMessage = message;
      }
    }

    console.log('📊 Conversation groups created:', conversationGroups.size);

    // Step 3: Create one notification per conversation with unread messages
    const conversationNotifications = [];
    
    for (const [conversationKey, conversation] of conversationGroups) {
      if (!conversation.hasUnread || !conversation.latestMessage) {
        console.log('🚫 Skipping conversation (no unread):', conversationKey);
        continue;
      }

      const unreadCount = conversation.messages.filter(m => m.isUnRead).length;
      const latestMsg = conversation.latestMessage;
      
      // Create a unified notification for this conversation
      const conversationNotification = {
        _id: `conv-${conversation.chatId}-${conversation.senderName}`,
        chatId: conversation.chatId,
        name: conversation.senderName,
        message: latestMsg.messageText,
        avatar: latestMsg.avatar,
        isUnRead: true,
        unreadCount,
        createdAt: latestMsg.createdAt,
        source: latestMsg.source,
        type: latestMsg.type
      };
      
      conversationNotifications.push(conversationNotification);
    }

    console.log('✅ Final conversation notifications:', conversationNotifications.length);
    return conversationNotifications;
  }, [socketMessages, chatNotifications]);

  // Calculate total unread count
  const totalUnreadCount = useMemo(() => {
    return uniqueChatMessages.reduce((total, msg) => total + (msg.unreadCount || 1), 0);
  }, [uniqueChatMessages]);

  // Enhanced debug logging
  console.log('💬 useMessageNotifications Final State (User Filtered):', {
    currentUserId,
    totalUnreadCount,
    uniqueMessagesCount: uniqueChatMessages.length,
    socketMessagesCount: socketMessages.length,
    dbNotificationsCount: chatNotifications.length,
    finalMessages: uniqueChatMessages.map(m => ({
      id: m._id || m.id,
      chatId: m.chatId,
      name: m.name,
      source: m.source,
      isUnRead: m.isUnRead
    }))
  });

  // Socket event handlers with deduplication
  const handleNewChatForSeller = useCallback((data) => {
    console.log("📨 New chat created for seller:", data);
    
    // Check if this notification is for the current user
    const isForCurrentUser = 
      data.sellerId === currentUserId || 
      data.receiverId === currentUserId ||
      data.userId === currentUserId;
    
    if (!isForCurrentUser) {
      console.log("🚫 Chat notification not for current user:", {
        currentUserId,
        notificationSellerId: data.sellerId,
        notificationReceiverId: data.receiverId,
        notificationUserId: data.userId
      });
      return;
    }
    
    // Check if sender is admin (exclude admin chat notifications from regular chat notifications)
    const isAdminSender = 
      data.sender === 'admin' ||
      data.senderId === 'admin' ||
      data.sender?._id === 'admin' ||
      data.sender?.AccountType === 'admin';
    
    if (isAdminSender) {
      console.log("🚫 Chat notification from admin, excluding from regular chat notifications:", {
        sender: data.sender,
        senderId: data.senderId,
        currentUserId
      });
      return;
    }
    
    const messageId = data._id || data.id || `chat-${Date.now()}-${Math.random()}`;
    const chatId = data.chatId;
    
    // Check if already processed recently
    const cacheKey = `chat-${chatId}-${data.winnerName || 'Buyer'}`;
    const now = Date.now();
    if (messageNotificationCache.processedMessages.has(cacheKey) && 
        now - messageNotificationCache.lastProcessedTime < MESSAGE_CACHE_DURATION) {
      console.log("🚫 Chat notification already processed recently:", cacheKey);
      return;
    }
    
    setSocketMessages(prev => {
      // Check if this chat notification already exists
      const exists = prev.some(msg => {
        // Check by exact ID
        if (msg._id === messageId || msg.id === messageId) return true;
        
        // Check by chat content (same chat creation for same chat ID)
        if (msg.chatId === chatId && 
            msg.type === 'chat_created' && 
            msg.name === (data.winnerName || 'Buyer')) {
          return true;
        }
        
        return false;
      });
      
      if (!exists) {
        const newMessage = {
          _id: messageId,
          id: messageId,
          chatId: chatId,
          avatar: data.avatar || null,
          name: getSenderName(data),
          message: `Nouveau chat créé pour: ${data.productTitle || 'un produit'}`,
          isUnRead: true,
          createdAt: new Date(),
          type: 'chat_created'
        };
        
        // Add to processed cache
        messageNotificationCache.processedMessages.add(cacheKey);
        messageNotificationCache.lastProcessedTime = now;
        
        console.log("✅ Adding new chat notification to socket queue:", {
          id: messageId,
          chatId: chatId,
          name: newMessage.name,
          currentUserId
        });
        
        return [newMessage, ...prev];
      } else {
        console.log("🚫 Chat notification already exists in socket queue:", {
          id: messageId,
          chatId: chatId
        });
        return prev;
      }
    });
  }, [currentUserId]);

  const handleNewMessage = useCallback((data) => {
    console.log("💬 New message received:", data);
    
    // Check if this message is for the current user
    const isForCurrentUser = 
      data.receiverId === currentUserId || 
      data.sellerId === currentUserId ||
      data.userId === currentUserId ||
      // Check if the sender is NOT the current user (we don't want to see our own messages as notifications)
      (data.sender && data.sender !== currentUserId);
    
    if (!isForCurrentUser) {
      console.log("🚫 Message notification not for current user:", {
        currentUserId,
        messageSender: data.sender,
        messageReceiverId: data.receiverId,
        messageSellerId: data.sellerId,
        messageUserId: data.userId
      });
      return;
    }
    
    // Check if sender is admin (exclude admin messages from regular chat notifications)
    const isAdminSender = 
      data.sender === 'admin' ||
      data.senderId === 'admin' ||
      data.sender?._id === 'admin' ||
      data.sender?.AccountType === 'admin';
    
    if (isAdminSender) {
      console.log("🚫 Message notification from admin, excluding from regular chat notifications:", {
        sender: data.sender,
        senderId: data.senderId,
        currentUserId
      });
      return;
    }
    
    const messageId = data._id || data.id || `msg-${Date.now()}-${Math.random()}`;
    const chatId = data.idChat || data.chatId;
    const messageText = data.message || '';
    
    // Check if already processed recently
    const cacheKey = `message-${chatId}-${messageText}-${data.sender}`;
    const now = Date.now();
    if (messageNotificationCache.processedMessages.has(cacheKey) && 
        now - messageNotificationCache.lastProcessedTime < MESSAGE_CACHE_DURATION) {
      console.log("🚫 Message notification already processed recently:", cacheKey);
      return;
    }
    
    setSocketMessages(prev => {
      // Check if this message notification already exists
      const exists = prev.some(msg => {
        // Check by exact ID
        if (msg._id === messageId || msg.id === messageId) return true;
        
        // Check by content (same message in same chat within 1 second)
        if (msg.chatId === chatId && 
            msg.message === messageText && 
            msg.type === 'message' &&
            Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt || Date.now()).getTime()) < 1000) {
          return true;
        }
        
        return false;
      });
      
      if (!exists) {
        const newMessage = {
          _id: messageId,
          id: messageId,
          chatId: chatId,
          avatar: null,
          name: getSenderName(data),
          message: messageText,
          isUnRead: true,
          createdAt: data.createdAt || new Date(),
          senderId: data.sender,
          type: 'message'
        };
        
        // Add to processed cache
        messageNotificationCache.processedMessages.add(cacheKey);
        messageNotificationCache.lastProcessedTime = now;
        
        console.log("✅ Adding new message notification to socket queue:", {
          id: messageId,
          chatId: chatId,
          sender: data.sender,
          currentUserId
        });
        
        return [newMessage, ...prev];
      } else {
        console.log("🚫 Message notification already exists in socket queue:", {
          id: messageId,
          chatId: chatId
        });
        return prev;
      }
    });
  }, [currentUserId]);

  // Socket event setup with proper cleanup
  useEffect(() => {
    if (!socketContext?.socket || !currentUserId) {
      console.log("🔌 useMessageNotifications: Socket setup skipped:", { 
        hasSocket: !!socketContext?.socket, 
        currentUserId 
      });
      return;
    }

    console.log("🔌 useMessageNotifications: Setting up socket listeners for user:", currentUserId);

    // Listen for socket events
    socketContext.socket.on('newChatCreatedForSeller', handleNewChatForSeller);
    socketContext.socket.on('sendMessage', handleNewMessage);
    socketContext.socket.on('newMessage', handleNewMessage);
    
    return () => {
      console.log("🔌 useMessageNotifications: Cleaning up socket listeners");
      socketContext.socket.off('newChatCreatedForSeller', handleNewChatForSeller);
      socketContext.socket.off('sendMessage', handleNewMessage);
      socketContext.socket.off('newMessage', handleNewMessage);
    };
  }, [socketContext?.socket, currentUserId, handleNewChatForSeller, handleNewMessage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      componentMounted.current = false;
    };
  }, []);

  // Remove periodic refresh - rely on socket events and manual refresh instead
  // This significantly reduces API calls while maintaining real-time updates

  const markAllSocketMessagesAsRead = useCallback(() => {
    console.log('📝 Marking all socket messages as read');
    setSocketMessages(prev => 
      prev.map(msg => ({ ...msg, isUnRead: false }))
    );
  }, []);

  // Mark specific socket messages for a chat as read
  const markSocketMessagesAsReadForChat = useCallback((chatId: string) => {
    console.log('📝 Marking socket messages as read for chat:', chatId);
    setSocketMessages(prev => 
      prev.map(msg => {
        if (msg.chatId === chatId) {
          return { ...msg, isUnRead: false };
        }
        return msg;
      })
    );
  }, []);

  return {
    totalUnreadCount,
    uniqueChatMessages,
    socketMessages,
    chatNotifications,
    fetchNotifications: refreshNotifications,
    markAllSocketMessagesAsRead,
    markSocketMessagesAsReadForChat
  };
} 