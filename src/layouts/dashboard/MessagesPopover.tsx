import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Chip
} from '@mui/material';
import { alpha } from '@mui/material/styles';
// utils
import { fToNow } from '../../utils/formatTime';
// components
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import MenuPopover from '../../components/MenuPopover';
import useMessageNotifications from '@/hooks/useMessageNotifications';
import { NotificationService } from '@/api/notificationService';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import useAuth from '@/hooks/useAuth';

// ----------------------------------------------------------------------
// ========================================
// MESSAGES POPOVER - CHAT NOTIFICATIONS ONLY
// ========================================
// This popover handles ONLY message/chat related notifications:
// - New messages (MESSAGE_RECEIVED)
// - New chats created (CHAT_CREATED) 
// - Conversation notifications (conversation)
// General notifications are handled by NotificationsPopover component
// ========================================

export default function MessagesPopover() {
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { auth } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clickedMessageId, setClickedMessageId] = useState(null);
  
  // Use the new custom hook for message notifications
  const { 
    totalUnreadCount, 
    uniqueChatMessages, 
    fetchNotifications,
    markAllSocketMessagesAsRead,
    markSocketMessagesAsReadForChat
  } = useMessageNotifications();
  
  // Local state to manage optimistic updates for clicked notifications
  const [clickedNotificationIds, setClickedNotificationIds] = useState<Set<string>>(new Set());

  // Final safeguard: additional deduplication in the component
  const finalDedupedMessages = useMemo(() => {
    const seenIds = new Set();
    const seenContentKeys = new Set();
    const dedupedMessages = [];
    
    // Sort messages to prioritize socket messages (newer) over database messages
    const sortedMessages = [...uniqueChatMessages].sort((a, b) => {
      // Prioritize socket messages
      if (a.isSocket && !b.isSocket) return -1;
      if (!a.isSocket && b.isSocket) return 1;
      
      // Then by creation date (newer first)
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    for (const message of sortedMessages) {
      const messageId = message._id || message.id;
      const chatId = message.chatId;
      
      // Primary deduplication: Check by actual message ID first
      if (messageId && seenIds.has(messageId)) {
        console.log('🚫 MessagesPopover: Blocked duplicate by ID:', { messageId, chatId, name: message.name, isSocket: message.isSocket });
        continue;
      }
      
      // Secondary deduplication: Content-based for messages without IDs or with different IDs but same content
      const contentKey = `${chatId}-${message.name}-${message.message?.substring(0, 100)}`;
      if (seenContentKeys.has(contentKey)) {
        console.log('🚫 MessagesPopover: Blocked duplicate by content:', { messageId, chatId, name: message.name, contentKey });
        continue;
      }
      
      // Add to seen sets
      if (messageId) {
        seenIds.add(messageId);
      }
      seenContentKeys.add(contentKey);
      
      dedupedMessages.push(message);
      console.log('✅ MessagesPopover: Added message:', { 
        messageId, 
        chatId, 
        name: message.name, 
        isSocket: message.isSocket,
        source: message.isSocket ? 'socket' : 'database'
      });
    }
    
    console.log(`🛡️ MessagesPopover final dedup: ${uniqueChatMessages.length} → ${dedupedMessages.length}`);
    console.log(`📊 Dedup stats - IDs seen: ${seenIds.size}, Content keys seen: ${seenContentKeys.size}`);
    return dedupedMessages;
  }, [uniqueChatMessages]);
  
  // Filter out clicked notifications from the displayed messages
  const filteredMessages = useMemo(() => {
    return finalDedupedMessages.filter(message => {
      const messageId = message._id || message.id;
      const chatId = message.chatId;
      
      // Check if this notification was clicked (optimistically removed)
      if (clickedNotificationIds.has(messageId) || 
          (chatId && clickedNotificationIds.has(`chat-${chatId}`))) {
        return false;
      }
      
      return true;
    });
  }, [finalDedupedMessages, clickedNotificationIds]);
  
  // Recalculate unread count from filtered messages
  const optimisticUnreadCount = useMemo(() => {
    return filteredMessages.filter(message => {
      const isUnread = message.isUnRead || (!message.read && !message.isSocket);
      return isUnread;
    }).length;
  }, [filteredMessages]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      
      // Mark all database notifications as read
      await NotificationService.markAllAsRead();
      
      // Mark all socket messages as read
      markAllSocketMessagesAsRead();
      
      // Refresh the notifications to get the latest data
      await fetchNotifications();
      
      // Trigger sidebar badge update by dispatching custom event
      window.dispatchEvent(new CustomEvent('messageNotificationsUpdated', {
        detail: { count: 0 }
      }));
      
      console.log("✅ All notifications (database + socket) marked as read and data refreshed");
    } catch (error) {
      console.error("❌ Error marking all notifications as read:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if there are any unread notifications to determine button visibility
  const hasUnreadNotifications = filteredMessages.some(message => {
    const isUnread = message.isUnRead || (!message.read && !message.isSocket);
    return isUnread;
  });

  // Debug logging for button visibility
  console.log('📘 Button visibility check:', {
    hasUnreadNotifications,
    totalMessages: filteredMessages.length,
    optimisticUnreadCount,
    unreadMessages: filteredMessages.filter(message => {
      const isUnread = message.isUnRead || (!message.read && !message.isSocket);
      return isUnread;
    }).map(m => ({
      id: m._id || m.id,
      read: m.read,
      isUnRead: m.isUnRead,
      isSocket: m.isSocket,
      name: m.name
    }))
  });

  const handleMessageClick = async (message) => {
    // Set loading state and clicked message ID
    setLoading(true);
    const messageId = message._id || message.id;
    const chatId = message.chatId;
    setClickedMessageId(messageId);
    
    // Optimistically remove the notification from UI immediately
    setClickedNotificationIds(prev => {
      const newSet = new Set(prev);
      if (messageId) newSet.add(messageId);
      if (chatId) newSet.add(`chat-${chatId}`);
      return newSet;
    });
    
    try {
      console.log("📖 Handling message click:", {
        messageId: messageId,
        chatId: chatId,
        type: message.type,
        isConversation: message.type === 'conversation',
        isSocket: message.isSocket,
        source: message.source,
        read: message.read
      });
      
      // STEP 1: Mark notification as read (if not already read)
      if (message._id && !message.read) {
        try {
          // Validate notification ID format (should be a valid MongoDB ObjectId)
          // Skip if it looks like a chat ID or invalid format
          const isValidNotificationId = /^[0-9a-fA-F]{24}$/.test(message._id);
          
          if (!isValidNotificationId) {
            console.warn("⚠️ Skipping notification mark as read - invalid ID format:", message._id);
            // Mark as read locally anyway to prevent repeated attempts
            message.read = true;
          } else {
          console.log("🔖 Marking notification as read:", {
            messageId: message._id,
            currentReadStatus: message.read,
            messageType: message.type,
            chatId: message.chatId
          });
          
          const result = await NotificationService.markAsRead(message._id);
          console.log("✅ Notification marked as read successfully:", {
            result,
            updatedNotification: result
          });
          
          // Update the local message state to reflect the change
          message.read = true;
          
          // Verify the notification was actually marked as read
          if (result && result.read === true) {
            console.log("✅ Database confirmed: notification is now marked as read");
          } else {
            console.warn("⚠️ Warning: API returned but read status unclear:", result);
          }
          }
        } catch (markError) {
          console.error("❌ Error marking notification as read:", {
            error: markError,
            messageId: message._id,
            errorMessage: markError?.message,
            errorStatus: markError?.response?.status
          });
          // Continue with navigation even if marking as read fails
          // Mark as read locally to prevent repeated attempts
          message.read = true;
        }
      } else {
        console.log("ℹ️ Notification already read or no ID available:", {
          messageId: message._id,
          read: message.read,
          hasId: !!message._id
        });
      }
      
      // STEP 2: Mark socket messages as read (if applicable)
      if (message.isSocket || message.source === 'socket') {
        try {
          console.log("🔖 Marking socket messages as read for chat:", message.chatId);
          // Mark only messages for this specific chat as read
          if (message.chatId) {
            markSocketMessagesAsReadForChat(message.chatId);
          } else {
            // Fallback: mark all if no chatId
          markAllSocketMessagesAsRead();
          }
          console.log("✅ Socket messages marked as read");
        } catch (socketError) {
          console.error("❌ Error marking socket messages as read:", socketError);
        }
      }
      
      // STEP 2.5: Mark chat notifications as read on server (for both socket and database messages)
      if (message.chatId) {
        try {
          console.log("🔖 Marking chat notifications as read on server for chat:", message.chatId);
          const { NotificationAPI } = await import('@/api/notification');
          await NotificationAPI.markChatAsRead(message.chatId);
          console.log("✅ Chat notifications marked as read on server");
        } catch (chatReadError) {
          console.error("❌ Error marking chat notifications as read:", chatReadError);
          // Continue even if this fails
        }
      }
      
      // STEP 3: Get fresh data from backend
      try {
        console.log("🔄 Fetching fresh notification data...");
        await fetchNotifications();
        console.log("✅ Fresh notification data fetched");
        
        // Remove from clicked set after successful refresh (notification is now removed from server)
        setClickedNotificationIds(prev => {
          const newSet = new Set(prev);
          if (messageId) newSet.delete(messageId);
          if (chatId) newSet.delete(`chat-${chatId}`);
          return newSet;
        });
        
        // Trigger sidebar badge update
        window.dispatchEvent(new CustomEvent('messageNotificationsUpdated', {
          detail: { action: 'messageClicked', messageId: message._id }
        }));
      } catch (fetchError) {
        console.error("❌ Error fetching fresh data:", fetchError);
        // On error, keep the notification removed optimistically (don't revert)
        // Continue with navigation even if data refresh fails
      }
      
      // STEP 4: Navigate to chat page
      const targetChatId = message.chatId || message.data?.chatId;
      
      if (targetChatId) {
        console.log("🚀 Navigating to specific chat:", targetChatId);
        navigate(`/dashboard/chat/${targetChatId}`);
      } else {
        console.log("🚀 No specific chat ID, navigating to chat list");
        navigate('/dashboard/chat');
      }
      
      // STEP 5: Close the popover
      handleClose();
      
    } catch (error) {
      console.error("❌ Error handling message click:", error);
      
      // On error, keep the notification removed optimistically (don't revert)
      // The notification will be refreshed from server on next fetch
      
      // Fallback: Ensure navigation happens even if there's an error
      const fallbackChatId = message.chatId || message.data?.chatId;
      
      if (fallbackChatId) {
        console.log("🔄 Fallback navigation to chat:", fallbackChatId);
        navigate(`/dashboard/chat/${fallbackChatId}`);
      } else {
        console.log("🔄 Fallback navigation to chat list");
        navigate('/dashboard/chat');
      }
      
      handleClose();
    } finally {
      // Clear loading state
      setLoading(false);
      setClickedMessageId(null);
    }
  };

  return (
    <>
      <Tooltip title={t('common.messages')}>
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
          <Badge badgeContent={optimisticUnreadCount > 0 ? optimisticUnreadCount : null} color="error">
            <Iconify icon="eva:message-circle-fill" width={20} height={20} />
          </Badge>
        </IconButton>
      </Tooltip>

      <MenuPopover 
        open={open} 
        onClose={handleClose} 
        anchorEl={anchorRef.current} 
        sx={{ 
          width: 360,
          ml: isRTL ? 0 : 0.75,
          mr: isRTL ? 0.75 : 0
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2.5, px: 3 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t('common.messages')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {optimisticUnreadCount > 0 
                ? t('messages.unreadCount', { count: optimisticUnreadCount })
                : t('messages.noUnread')}
            </Typography>
          </Box>

          {hasUnreadNotifications && (
            <Tooltip title={t('messages.markAllAsRead')}>
              <IconButton 
                size="small" 
                onClick={handleMarkAllAsRead} 
                disabled={loading}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'action.disabled',
                    color: 'action.disabled',
                  }
                }}
              >
                {loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:done-all-fill" width={20} height={20} />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Divider />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          <List
            disablePadding
            subheader={
              <ListSubheader disableSticky sx={{ py: 1, px: 2.5, typography: 'overline' }}>
                {t('messages.recentConversations')}
              </ListSubheader>
            }
          >
            {filteredMessages.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('messages.noMessages')}
                </Typography>
              </Box>
            ) : (
              (() => {
                // Filter out read notifications - only show unread notifications
                const unreadMessages = filteredMessages.filter(message => {
                  const isUnread = message.isUnRead || (!message.read && !message.isSocket);
                  return isUnread;
                });
                
                // Debug: Log all messages being rendered
                console.log('🔍 MessagesPopover Debug - Rendering unread messages only:', unreadMessages.map(m => ({
                  id: m.id || m._id,
                  chatId: m.chatId,
                  name: m.name,
                  isSocket: m.isSocket,
                  read: m.read,
                  isUnRead: m.isUnRead,
                  message: m.message?.substring(0, 50) + '...'
                })));
                
                if (unreadMessages.length === 0) {
                  return (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('messages.noUnreadMessages')}
                      </Typography>
                    </Box>
                  );
                }
                
                return unreadMessages.map((message, index) => {
                  const messageKey = message._id || message.id || `${message.chatId}-${index}`;
                  const isClicked = clickedMessageId === (message._id || message.id);
                  console.log('🔍 Rendering unread message with key:', messageKey, 'Message:', message);
                  
                  return (
                    <MessageItem 
                      key={messageKey}
                      message={message} 
                      onClick={() => handleMessageClick(message)}
                      isLoading={loading}
                      isClicked={isClicked}
                    />
                  );
                });
              })()
            )}
          </List>
        </Scrollbar>

        <Divider />

        <Box sx={{ p: 1.5 }}>
          <Button 
            fullWidth 
            variant="contained"
            color="primary"
            onClick={() => {
              console.log("🚀 Navigating to chat page from 'View all conversations' button");
              navigate('/dashboard/chat');
              handleClose();
            }}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {t('messages.viewAllConversations')}
          </Button>
        </Box>
      </MenuPopover>
    </>
  );
}

// ----------------------------------------------------------------------

function MessageItem({ message, onClick, isLoading, isClicked }) {
  const isUnread = message.isUnRead || (!message.read && !message.isSocket);
  const isNew = message.isSocket || message.source === 'socket'; 
  const isConversation = message.type === 'conversation';
  const hasMultipleMessages = message.unreadMessageCount > 1;

  // Enhanced display for conversation-based notifications
  const isMessageReceived = message.type === 'MESSAGE_RECEIVED' || message.type === 'message';
  const displayMessage = isConversation && hasMultipleMessages
    ? message.message // Already formatted as "X nouveaux messages"
    : isMessageReceived
      ? `You have a new message: ${message.message}`
      : message.message;

  return (
    <ListItemButton
      disabled={isLoading && isClicked}
      sx={{
        py: 1.5,
        px: 2.5,
        mt: '1px',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1.5,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isLoading && isClicked ? 0.6 : 1,
        ...(isUnread && {
          bgcolor: 'action.selected',
          border: '1px solid',
          borderColor: isNew ? 'primary.main' : 'primary.main',
          borderLeftWidth: '4px',
          borderLeftColor: isNew ? 'primary.main' : 'primary.main',
          background: isNew ? 
            (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})` :
            'action.selected',
        }),
        '&:hover': {
          bgcolor: isUnread ? 'action.selected' : 'action.hover',
          transform: isLoading && isClicked ? 'none' : 'translateX(4px)',
          boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
        '&:disabled': {
          cursor: 'not-allowed',
        }
      }}
      onClick={isLoading && isClicked ? undefined : onClick}
    >
      <ListItemAvatar>
        <Box position="relative">
          <Avatar 
            src={message.avatar} 
            sx={{ 
              bgcolor: (theme) => isNew ? theme.palette.primary.main : theme.palette.primary.main,
              width: 44,
              height: 44,
              border: (theme) => isNew ? `2px solid ${theme.palette.primary.main}` : isUnread ? '2px solid' : 'none',
              borderColor: (theme) => isUnread && !isNew ? theme.palette.primary.main : 'transparent',
              boxShadow: (theme) => isNew ? `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            {message.name ? message.name.charAt(0).toUpperCase() : 'B'}
          </Avatar>
          
          {/* Show message count badge for conversations with multiple messages */}
          {isConversation && hasMultipleMessages && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                minWidth: 20,
                height: 20,
                borderRadius: '50%',
                backgroundColor: 'error.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {message.unreadMessageCount > 99 ? '99+' : message.unreadMessageCount}
            </Box>
          )}
          
          {/* Pulse animation for new messages */}
          {isNew && !hasMultipleMessages && (
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                border: '2px solid white',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: (theme) => `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
                  },
                  '70%': {
                    boxShadow: (theme) => `0 0 0 4px ${alpha(theme.palette.primary.main, 0)}`,
                  },
                  '100%': {
                    boxShadow: (theme) => `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
                  },
                },
              }}
            />
          )}
        </Box>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography 
              variant="subtitle2"
              sx={{ 
                fontWeight: isUnread ? 'fontWeightBold' : 'fontWeightRegular',
                color: isNew ? 'primary.main' : isUnread ? 'primary.main' : 'inherit'
              }}
            >
              {message.name || 'Acheteur'}
            </Typography>
            {isNew && !hasMultipleMessages && (
              <Chip
                label="NEW"
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  px: 0.5,
                  py: 0.1,
                  height: '18px',
                  borderRadius: 1,
                  textTransform: 'uppercase',
                }}
              />
            )}
            {hasMultipleMessages && (
              <Chip
                label={`${message.unreadMessageCount} messages`}
                size="small"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  backgroundColor: 'warning.main',
                  color: 'white',
                  px: 0.5,
                  py: 0.1,
                  height: '18px',
                  borderRadius: 1,
                }}
              />
            )}
          </Box>
        }
        secondary={displayMessage}
        primaryTypographyProps={{
          component: 'div'
        }}
        secondaryTypographyProps={{
          typography: 'caption',
          noWrap: true,
          sx: { 
            mt: 0.5,
            fontWeight: isUnread ? 'fontWeightMedium' : 'fontWeightRegular',
            color: isUnread ? 'text.primary' : 'text.secondary',
          }
        }}
      />
      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={0.5}>
        <Typography 
          variant="caption" 
          sx={{ 
            flexShrink: 0, 
            color: 'text.disabled',
            fontWeight: isUnread ? 'fontWeightMedium' : 'fontWeightRegular'
          }}
        >
          {message.createdAt ? fToNow(message.createdAt) : 'Maintenant'}
        </Typography>
        {isLoading && isClicked ? (
          <CircularProgress size={12} color="primary" />
        ) : isUnread && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: hasMultipleMessages ? 'warning.main' : 'primary.main',
              flexShrink: 0,
              boxShadow: (theme) => `0 0 6px ${alpha(hasMultipleMessages ? theme.palette.warning.main : theme.palette.primary.main, 0.6)}`,
              animation: isNew ? 'pulse 2s infinite' : 'none',
            }}
          />
        )}
      </Box>
    </ListItemButton>
  );
}