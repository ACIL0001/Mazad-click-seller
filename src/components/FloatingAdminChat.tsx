import React, { useState, useEffect, useRef } from 'react';
import './FloatingAdminChat.css';
import { useTranslation } from 'react-i18next';
import { useCreateSocket } from '../contexts/SocketContext';
import { ChatAPI } from '../api/Chat';
import { MessageAPI } from '../api/message';
import { UserAPI } from '../api/user';
import useAuth from '../hooks/useAuth';
import useAdminMessageNotifications from '../hooks/useAdminMessageNotifications';

interface Message {
  _id: string;
  message: string;
  sender: string;
  reciver: string;
  idChat: string;
  createdAt: string;
}

interface AdminChat {
  _id: string;
  users: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    AccountType: string;
  }>;
  createdAt: string;
}

const FloatingAdminChat: React.FC = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const socketContext = useCreateSocket();
  
  // Check if we're on auth-related pages and disable chat entirely
  const isOnAuthPage = typeof window !== 'undefined' && (
    window.location.pathname.includes('/login') ||
    window.location.pathname.includes('/register') ||
    window.location.pathname.includes('/otp-verification') ||
    window.location.pathname.includes('/reset-password') ||
    window.location.pathname.includes('/identity-verification') ||
    window.location.pathname.includes('/subscription-plans')
  );
  
  // Use the new admin message notifications hook
  const { unreadAdminMessagesCount, adminNotifications, refreshNotifications, clearSocketMessages, updateLastSeenTimestamp } = useAdminMessageNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [adminChat, setAdminChat] = useState<AdminChat | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCharCount, setShowCharCount] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100); // Max height of 100px
      textarea.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !((event.target as Element)?.closest('.emoji-picker') || (event.target as Element)?.closest('.emoji-btn'))) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Initialize admin chat - FIXED VERSION
  const initializeAdminChat = async () => {
    if (!auth?.user?._id || !auth?.tokens?.accessToken) {
      console.log('FloatingAdminChat: User not authenticated, skipping chat initialization');
      return;
    }

    if (isOnAuthPage) {
      console.log('FloatingAdminChat: On auth page, completely skipping chat initialization');
      return;
    }

    console.log('FloatingAdminChat: Initializing admin chat for user:', auth.user._id);
    setIsLoading(true);
    
    try {
      // Get existing chats for this user
      const existingChats = await ChatAPI.getChats({
        id: auth.user._id,
        from: 'seller'
      });

      console.log('FloatingAdminChat: Existing chats:', existingChats);

      // Find admin chat (chat with admin user)
      const adminChatExists = (existingChats as AdminChat[])?.find((chat: AdminChat) =>
        chat.users.some((user: any) => user.AccountType === 'admin' || user._id === 'admin')
      );

      if (adminChatExists) {
        console.log('FloatingAdminChat: Found existing admin chat:', adminChatExists);
        setAdminChat(adminChatExists);
        
        // Load messages for this chat
        const chatMessages = await MessageAPI.getByConversation(adminChatExists._id);
        setMessages((chatMessages as Message[]) || []);
        console.log('FloatingAdminChat: Loaded messages:', chatMessages);
      } else {
        console.log('FloatingAdminChat: No admin chat found, will create on first message');
      }
    } catch (error) {
      console.error('FloatingAdminChat: Error initializing admin chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create admin chat if it doesn't exist - FIXED VERSION
  const createAdminChat = async () => {
    if (!auth?.user?._id || !auth?.tokens?.accessToken) {
      console.log('FloatingAdminChat: User not authenticated, cannot create chat');
      return null;
    }

    if (isOnAuthPage) {
      console.log('FloatingAdminChat: On auth page, cannot create chat');
      return null;
    }

    try {
      console.log('FloatingAdminChat: Creating new admin chat');
      
      // Get admin users from API
      let admins = [];
      try {
        admins = await UserAPI.getAdmins();
        console.log('FloatingAdminChat: Found admins:', admins);
      } catch (apiError) {
        console.error('FloatingAdminChat: Could not fetch admin users:', apiError);
        // Fallback: create a default admin structure
        admins = [{
          _id: 'admin',
            firstName: 'Admin',
            lastName: 'Support',
            AccountType: 'admin',
            phone: ''
        }];
      }

      if (!admins || admins.length === 0) {
        console.error('FloatingAdminChat: No admin users found');
        return null;
      }

      // Use the first admin user
      const adminUser = admins[0];
      console.log('FloatingAdminChat: Using admin user:', adminUser);

      const chatData = {
        users: [
          {
            _id: auth.user._id,
            firstName: auth.user.firstName,
            lastName: auth.user.lastName,
            AccountType: auth.user.type || 'seller',
            phone: auth.user.phone || ''
          },
          {
            _id: adminUser._id,
            firstName: adminUser.firstName || 'Admin',
            lastName: adminUser.lastName || 'Support',
            AccountType: 'admin',
            phone: adminUser.phone || ''
          }
        ],
        createdAt: new Date().toISOString()
      };

      console.log('FloatingAdminChat: Creating chat with data:', chatData);
      const newChat = await ChatAPI.createChat(chatData);
      console.log('FloatingAdminChat: Chat created successfully:', newChat);
      
      setAdminChat(newChat as AdminChat);
      return newChat as AdminChat;
    } catch (error) {
      console.error('FloatingAdminChat: Error creating admin chat:', error);
      return null;
    }
  };

  // Send message - IMPROVED VERSION with immediate local display
  const sendMessage = async () => {
    if (!message.trim() || !auth?.user?._id || !auth?.tokens?.accessToken || isSending) {
      if (!auth?.tokens?.accessToken) {
        console.log('FloatingAdminChat: User not authenticated, cannot send message');
      }
      return;
    }

    console.log('📤 Sending message:', message.trim());
    console.log('📤 Current user:', auth.user._id);
    console.log('📤 Current chat:', adminChat);

    setIsSending(true);
    let currentChat = adminChat;

    // Create chat if it doesn't exist
    if (!currentChat) {
      console.log('📤 Creating new admin chat');
      currentChat = await createAdminChat();
      if (!currentChat) {
        console.error('❌ Failed to create admin chat');
        setIsSending(false);
        return;
      }
    }

    // Create a temporary message for immediate display
    const tempMessage = {
      _id: `temp-${Date.now()}-${Math.random()}`,
      message: message.trim(),
      sender: auth.user._id,
      reciver: 'admin',
      idChat: currentChat._id,
      createdAt: new Date().toISOString(),
      isTemp: true // Flag to identify temporary messages
    };

    // Add message to local state immediately for instant feedback
    setMessages(prev => [...prev, tempMessage]);
    console.log('✅ Message added to local state immediately');

    try {
      const messageData = {
        idChat: currentChat._id,
        message: message.trim(),
        sender: auth.user._id,
        reciver: 'admin', // This will be handled by backend to send to all admins
      };

      console.log('📤 Sending via API:', messageData);
      const sentMessage = await MessageAPI.send(messageData);
      console.log('✅ Message sent successfully:', sentMessage);
      
      setMessage('');
      
      // Replace temporary message with real message from server
      if (sentMessage && sentMessage._id) {
        setMessages(prev => prev.map(msg => 
          (msg as any).isTemp && msg.message === messageData.message ? 
          { ...sentMessage, createdAt: sentMessage.createdAt || new Date().toISOString() } : 
          msg
        ));
        console.log('✅ Temporary message replaced with server message');
      } else {
        // Fallback: refresh all messages if no response
        const updatedMessages = await MessageAPI.getByConversation(currentChat._id);
        setMessages((updatedMessages as Message[]) || []);
        console.log('✅ Messages refreshed from server');
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Show error message to user
      const errorMessage = {
        _id: `error-${Date.now()}`,
        message: 'Failed to send message. Please try again.',
        sender: 'system',
        reciver: auth.user._id,
        idChat: currentChat._id,
        createdAt: new Date().toISOString(),
        isError: true
      };
      
      // Replace temporary message with error message
      setMessages(prev => prev.map(msg => 
        (msg as any).isTemp && msg.message === message.trim() ? 
        errorMessage : msg
      ));
      
      // Remove error message after 3 seconds
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => !(msg as any).isError));
      }, 3000);
      
      console.log('❌ Error message displayed to user');
    } finally {
      setIsSending(false);
    }
  };

  // Real-time message listening for chat display - IMPROVED with better deduplication
  useEffect(() => {
    if (!socketContext?.socket || !adminChat?._id) {
      console.log('❌ Socket or chat not available in FloatingAdminChat');
      return;
    }

    console.log('🔌 Setting up real-time message listeners for chat:', adminChat._id);

    // Global cache to prevent duplicate processing across events
    const processedMessages = new Set<string>();

    // Unified message handler to prevent duplicates
    const handleIncomingMessage = (data: any, eventType: string) => {
      console.log(`📨 ${eventType} message received in FloatingAdminChat:`, data);
      
      // Create unique key for this message
      const messageKey = `${data._id || data.id || 'unknown'}-${data.message}-${data.sender}-${data.createdAt}`;
      
      // Check if already processed
      if (processedMessages.has(messageKey)) {
        console.log(`🚫 ${eventType} message already processed, skipping:`, messageKey);
        return;
      }
      
      // Mark as processed immediately
      processedMessages.add(messageKey);
      
      // Check if this message belongs to the current admin chat
      const isForCurrentChat = data.idChat === adminChat._id || data.chatId === adminChat._id;
      const isFromAdmin = data.sender === 'admin' || data.senderId === 'admin';
      const isForCurrentUser = data.reciver === auth?.user?._id || data.receiverId === auth?.user?._id;
      
      // For adminMessage events, we only want admin messages for the current user
      if (isForCurrentChat && isFromAdmin && isForCurrentUser) {
        console.log(`✅ Processing ${eventType} message for chat display`);
        
        setMessages(prev => {
          // Check if message already exists in state
          const exists = prev.some(msg => 
            msg._id === data._id || 
            (msg._id === data._id) ||
            (msg.message === data.message && msg.sender === data.sender && 
             Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt).getTime()) < 1000)
          );
          
          if (exists) {
            console.log(`🚫 ${eventType} message already exists in state, skipping`);
            return prev;
          }
          
          // If this is a user's own message, replace any temporary version
          if (data.sender === auth?.user?._id) {
            const filtered = prev.filter(msg => !(msg as any).isTemp || msg.message !== data.message);
            console.log(`✅ User message updated in chat (replaced temp) from ${eventType}`);
            return [...filtered, data];
          } else {
            console.log(`✅ ${eventType} message added to chat`);
            return [...prev, data];
          }
        });
      } else {
        console.log(`🚫 ${eventType} message not for current chat/user, skipping`);
      }
    };

    // Listen for admin messages specifically - ONLY adminMessage event to prevent duplicates
    const handleAdminMessage = (data: any) => handleIncomingMessage(data, 'adminMessage');

    // Set up event listeners - ONLY adminMessage to prevent duplicates
    socketContext.socket.on('adminMessage', handleAdminMessage);

    return () => {
      console.log('🔌 Cleaning up real-time message listeners');
      socketContext.socket.off('adminMessage', handleAdminMessage);
    };
  }, [socketContext?.socket, adminChat?._id, auth?.user?._id]); // Removed 'messages' dependency

  // Initialize chat when component mounts
  useEffect(() => {
    if (isOnAuthPage) {
      return; // Silent return on auth pages
    }

    if (auth?.user && auth?.tokens?.accessToken) {
      // Add delay to ensure authentication is fully complete before making API calls
      const timeoutId = setTimeout(() => {
        if (!isOnAuthPage && auth?.user && auth?.tokens?.accessToken) {
          console.log('FloatingAdminChat: Initializing chat for user:', auth.user._id);
          initializeAdminChat();
          refreshNotifications();
        }
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [auth?.user?._id, auth?.tokens?.accessToken]);

  // Update unread count from admin notifications
  useEffect(() => {
    setUnreadCount(unreadAdminMessagesCount);
  }, [unreadAdminMessagesCount]);

  // Reset unread count when opening chat
  useEffect(() => {
    if (isOpen) {
      console.log('📬 Chat opened, clearing notifications');
      setUnreadCount(0);
      clearSocketMessages(); // Clear unread messages and new notifications when chat is opened
      updateLastSeenTimestamp(); // Update last seen timestamp to mark notifications as seen
      
      // Also refresh notifications to mark them as read in database
      setTimeout(() => {
        refreshNotifications();
      }, 1000);
    }
  }, [isOpen, clearSocketMessages, refreshNotifications, updateLastSeenTimestamp]);

  // Debug: Log messages state changes
  useEffect(() => {
    console.log('📄 Messages state changed:', messages);
    console.log('📄 Number of messages:', messages.length);
  }, [messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) { // Max character limit
      setMessage(value);
    }

    // Show character count when approaching limit
    setShowCharCount(value.length > 1800);

    // Clear typing timeout if it exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      // Handle typing indicator logic here if needed
    }, 1000);
  };

  // Add emoji to message
  const addEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Common emojis for quick access
  const quickEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '🙏'];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (senderId: string) => senderId === auth?.user?._id;

  // Don't render the component at all on auth pages
  if (isOnAuthPage) {
    console.log('FloatingAdminChat: On auth page, not rendering component');
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className={`floating-chat-button ${isOpen ? 'hidden' : ''}`}>
        <button
          className="chat-fab"
          onClick={async () => {
            if (!auth?.user?._id || !auth?.tokens?.accessToken) {
              console.log('FloatingAdminChat: User not authenticated, cannot open chat');
              return;
            }

            if (isOnAuthPage) {
              console.log('FloatingAdminChat: On auth page, cannot open chat');
              return;
            }
            
            // Show chat dialog immediately for better UX
            setIsOpen(true);
            setIsLoading(true);
            
            try {
              // 1. Get all chats for this user
              const existingChats = await ChatAPI.getChats({
                id: auth.user._id,
                from: 'seller'
              });

              // 2. Check if a chat with admin exists
              const adminChatExists = (existingChats as AdminChat[])?.find((chat: AdminChat) =>
                chat.users.some((user: any) => user.AccountType === 'admin' || user._id === 'admin') &&
                chat.users.some((user: any) => user._id === auth.user?._id)
              );

              if (adminChatExists) {
                console.log('FloatingAdminChat: Found existing admin chat:', adminChatExists);
                setAdminChat(adminChatExists);
                
                // Load messages
                const chatMessages = await MessageAPI.getByConversation(adminChatExists._id);
                setMessages((chatMessages as Message[]) || []);
                
                // Mark all messages in this chat as read
                try {
                  await MessageAPI.markAllAsRead(adminChatExists._id);
                  console.log('✅ All admin messages marked as read for chat:', adminChatExists._id);
                  // Immediately reset local unread count for instant UI feedback
                  setUnreadCount(0);
                  // Refresh admin notifications to update unread count
                  refreshNotifications();
                } catch (error) {
                  console.error('❌ Error marking admin messages as read:', error);
                }
                
                return;
              }

              // 3. If not, create a new chat
              console.log('FloatingAdminChat: Creating new admin chat');
              const newChat = await createAdminChat();
              
              if (newChat) {
              // Load messages
                const chatMessages = await MessageAPI.getByConversation(newChat._id);
              setMessages((chatMessages as Message[]) || []);
              
              // Mark all messages in this chat as read (in case there are any)
              try {
                  await MessageAPI.markAllAsRead(newChat._id);
                  console.log('✅ All admin messages marked as read for new chat:', newChat._id);
                // Immediately reset local unread count for instant UI feedback
                setUnreadCount(0);
                // Refresh admin notifications to update unread count
                refreshNotifications();
              } catch (error) {
                console.error('❌ Error marking admin messages as read in new chat:', error);
                }
              }
            } catch (error) {
              console.error('Error handling Floating Admin Chat:', error);
            } finally {
              setIsLoading(false);
            }
          }}
          aria-label={t('chat.openAdminChat')}
        >
          <i className="bi bi-headset"></i>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Chat Dialog */}
      {isOpen && (
        <div className="chat-dialog-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}>
          <div className="chat-dialog">
            {/* Header */}
            <div className="chat-header">
              <div className="chat-header-content">
                <div className="admin-avatar">
                  <i className="bi bi-headset"></i>
                </div>
                <div className="chat-title">
                  <h4>{t('chat.adminSupport')}</h4>
                  <div className="online-status">
                    <span className="online-dot"></span>
                    <span>{t('chat.online')}</span>
                  </div>
                </div>
              </div>

              <button
                className="close-chat-btn"
                onClick={() => setIsOpen(false)}
                aria-label={t('chat.closeChat')}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>

            {/* Messages Area */}
            <div className="chat-content">
              <div className="messages-area">
                {isLoading ? (
                  <div className="loading-messages">
                    <div className="loading-spinner"></div>
                    <p>{t('chat.loadingMessages')}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="empty-chat">
                    <i className="bi bi-chat-dots"></i>
                    <p>{t('chat.startConversation')}</p>
                    <small>{t('chat.hereToHelp')}</small>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    console.log('📄 Rendering message:', msg);
                    const isTemp = (msg as any).isTemp;
                    const isError = (msg as any).isError;
                    const isSystem = msg.sender === 'system';
                    
                    return (
                      <div
                        key={msg._id || index}
                        className={`message ${isOwnMessage(msg.sender) ? 'own' : 'other'} ${isTemp ? 'temp-message' : ''} ${isSystem ? 'system-message' : ''}`}
                      >
                        <div 
                          className="message-bubble"
                          data-error={isError ? "true" : "false"}
                        >
                          <p>{msg.message}</p>
                          <span className="message-time">
                            {isTemp ? (
                              <span className="sending-indicator">
                                <i className="bi bi-clock"></i> Sending...
                              </span>
                            ) : isError ? (
                              <span className="error-indicator">
                                <i className="bi bi-exclamation-triangle"></i> Error
                              </span>
                            ) : (
                              formatTime(msg.createdAt)
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {isTyping && (
                  <div className="message other">
                    <div className="message-bubble typing">
                      <p><em>{t('chat.adminTyping')}</em></p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Message Input */}
              <div className="message-input-area">
                <div className="input-container">
                  <div className="input-wrapper">
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      placeholder={t('chat.typeMessage')}
                      className="message-input"
                      disabled={isSending}
                    />
                    <div className="input-actions">
                      <button
                        type="button"
                        className="emoji-btn"
                        title={t('chat.addEmoji')}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <i className="bi bi-emoji-smile"></i>
                      </button>
                      <button
                        type="button"
                        className="attach-btn"
                        title={t('chat.attachFile')}
                      >
                        <i className="bi bi-paperclip"></i>
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div className="emoji-picker">
                        <div className="emoji-grid">
                          {quickEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              className="emoji-item"
                              onClick={() => addEmoji(emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <div className="emoji-picker-footer">
                          <small>{t('chat.quickEmojis')}</small>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isSending}
                    className={`send-btn ${isSending ? 'sending' : ''}`}
                    aria-label={t('chat.sendMessage')}
                  >
                    {isSending ? (
                      <div className="sending-spinner"></div>
                    ) : (
                      <i className="bi bi-send"></i>
                    )}
                  </button>
                </div>
                <div className="input-footer">
                  <div className="input-hint">
                    {t('chat.inputHint')}
                  </div>
                  {showCharCount && (
                    <div className={`char-count ${message.length > 1900 ? 'warning' : ''}`}>
                      {message.length}/2000
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .floating-chat-button {
          position: fixed;
          bottom: 24px;
          right: 100px;
          z-index: 1350;
          transition: all 0.3s ease;
        }

        .floating-chat-button.hidden {
          opacity: 0;
          pointer-events: none;
        }

        .chat-fab {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-fab:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 48px rgba(0, 123, 255, 0.4);
        }

        .unread-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #dc3545;
          color: white;
          border-radius: 50%;
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          border: 2px solid white;
        }

        .chat-dialog-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1400;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .chat-dialog {
          width: 400px;
          height: 600px;
          max-height: 80vh;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .chat-title h4 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .online-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          opacity: 0.9;
        }

        .online-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #4CAF50;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
          }
        }

        .close-chat-btn {
          background: none;
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .close-chat-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .chat-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f8f9fa;
        }

        .messages-area {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loading-messages {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-chat {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .empty-chat i {
          font-size: 48px;
          margin-bottom: 16px;
          color: #dee2e6;
        }

        .empty-chat p {
          margin: 8px 0;
          font-weight: 500;
        }

        .empty-chat small {
          color: #adb5bd;
        }

        .message {
          display: flex;
          margin-bottom: 8px;
        }

        .message.own {
          justify-content: flex-end;
        }

        .message.other {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 18px;
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .message.own .message-bubble {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.other .message-bubble {
          border-bottom-left-radius: 4px;
          background: #fff;
          border: 1px solid #e9ecef;
        }

        .message-bubble.typing {
          font-style: italic;
          opacity: 0.7;
          background: #e9ecef;
        }

        .message-bubble p {
          margin: 0 0 4px 0;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
        }

        .message-input-area {
          padding: 16px;
          background: white;
          border-top: 1px solid #dee2e6;
        }

        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
          width: 100%;
        }

        .input-wrapper {
          width: 90%;
          position: relative;
          background: #f8f9fa;
          border-radius: 20px;
          border: 2px solid #e9ecef;
          transition: all 0.2s ease;
        }

        .input-wrapper:focus-within {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
          background: white;
        }

        .message-input {
          width: 100%;
          padding: 10px 60px 10px 16px;
          border: none;
          border-radius: 20px;
          resize: none;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.3;
          background: transparent;
          min-height: 18px;
          max-height: 100px;
          overflow-y: auto;
        }

        .message-input::placeholder {
          color: #adb5bd;
        }

        .message-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-actions {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          gap: 4px;
        }

        .emoji-btn,
        .attach-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: none;
          color: #6c757d;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: all 0.2s ease;
        }

        .emoji-btn:hover,
        .attach-btn:hover {
          background: #f1f3f4;
          color: #007bff;
        }

        .send-btn {
          width: calc(10% - 12px);
          min-width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          font-size: 16px;
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .send-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
          transform: none;
          opacity: 0.6;
        }

        .send-btn.sending {
          background: #28a745;
        }

        .sending-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 8px;
          gap: 12px;
        }

        .input-hint {
          font-size: 12px;
          color: #6c757d;
          opacity: 0.7;
          flex: 1;
        }

        .char-count {
          font-size: 11px;
          color: #6c757d;
          background: #f8f9fa;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 500;
        }

        .char-count.warning {
          color: #dc3545;
          background: #f8d7da;
        }

        .emoji-picker {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 1450;
          min-width: 240px;
          margin-bottom: 8px;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          padding: 12px;
        }

        .emoji-item {
          width: 40px;
          height: 40px;
          border: none;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .emoji-item:hover {
          background: #f8f9fa;
          transform: scale(1.1);
        }

        .emoji-picker-footer {
          padding: 8px 12px;
          border-top: 1px solid #f1f3f4;
          text-align: center;
        }

        .emoji-picker-footer small {
          color: #6c757d;
          font-size: 11px;
        }

        /* Scrollbar styling */
        .messages-area::-webkit-scrollbar,
        .message-input::-webkit-scrollbar {
          width: 6px;
        }

        .messages-area::-webkit-scrollbar-track,
        .message-input::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .messages-area::-webkit-scrollbar-thumb,
        .message-input::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .messages-area::-webkit-scrollbar-thumb:hover,
        .message-input::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }

        @media (max-width: 768px) {
          .floating-chat-button {
            bottom: 16px;
            right: 80px;
          }
        }

        @media (max-width: 480px) {
          .chat-dialog {
            width: 100%;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
          }
          
          .floating-chat-button {
            bottom: 100px;
            right: 16px;
          }
          
          .chat-fab {
            width: 56px;
            height: 56px;
            font-size: 20px;
          }

          .input-container {
            gap: 8px;
          }

          .send-btn {
            width: 44px;
            height: 44px;
            font-size: 16px;
          }

          .message-input {
            padding: 12px 50px 12px 16px;
            font-size: 16px; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </>
  );
};

export default FloatingAdminChat;