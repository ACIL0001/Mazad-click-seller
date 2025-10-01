import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NotificationAPI } from "@/api/notification"; 
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  TextField,
  Avatar,
  IconButton,
  Badge,
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Chip,
  useMediaQuery,
  Fade,
  Slide,
  Stack,
  Card,
  CardContent,
  Button,
  Fab,
  Zoom,
  Collapse,
  ListItemText,
  ListItemAvatar,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  List,
  ListItem,
  InputAdornment,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  SearchRounded,
  SendRounded,
  MoreVertRounded,
  InsertEmoticonRounded,
  AttachFileRounded,
  MicRounded,
  KeyboardArrowDownRounded,
  CheckCircleRounded,
  MenuRounded,
  CloseRounded,
  ChatRounded,
  FilterListRounded,
  RefreshRounded,
  KeyboardBackspaceRounded,
  StarRounded,
  StarBorderRounded,
  ArchiveRounded,
  DeleteRounded,
  BlockRounded,
  PersonAddRounded,
  VideoCallRounded,
  PhoneRounded,
  MoreHorizRounded,
  NotificationsRounded,
  NotificationsOffRounded,
  DarkModeRounded,
  LightModeRounded,
  SettingsRounded,
  GroupRounded,
  AddRounded,
  EditRounded,
  ReplyRounded,
  ForwardRounded,
  DownloadRounded,
  ShareRounded,
  ReportRounded,
  InfoRounded,
  EmojiEmotionsRounded,
  GifRounded,
  ImageRounded,
  FilePresentRounded,
  LocationOnRounded,
  ScheduleRounded,
  CheckRounded,
  CheckCircleOutlineRounded,
  AccessTimeRounded,
  OnlinePredictionRounded,
  RadioButtonUncheckedRounded,
  RadioButtonCheckedRounded,
  VisibilityRounded,
  VisibilityOffRounded,
  LockRounded,
  PublicRounded,
  SecurityRounded,
  VerifiedUserRounded,
  WarningRounded,
  ErrorRounded,
  HelpRounded,
  FeedbackRounded,
  BugReportRounded,
  CodeRounded,
  BuildRounded,
  ExtensionRounded,
  AppsRounded,
  DashboardRounded,
  AnalyticsRounded,
  TimelineRounded,
  TrendingUpRounded,
  TrendingDownRounded,
  AssessmentRounded,
  BarChartRounded,
  PieChartRounded,
  ShowChartRounded,
  TableChartRounded,
  ViewListRounded,
  ViewModuleRounded,
  ViewQuiltRounded,
  ViewStreamRounded,
  ViewWeekRounded,
  ViewDayRounded,
  ViewAgendaRounded,
  ViewCarouselRounded,
  ViewColumnRounded,
  ViewComfyRounded,
  ViewCompactRounded,
  ViewHeadlineRounded,
  ViewInArRounded,
  ViewKanbanRounded,
  ViewSidebarRounded,
  ViewTimelineRounded,
  ViewArrayRounded,
  ViewCozyRounded,
  ViewComfyAltRounded,
  ViewCompactAltRounded
} from '@mui/icons-material';

// API imports
import { ChatAPI } from "@/api/Chat";
import { MessageAPI } from "@/api/message";
import useAuth from "@/hooks/useAuth";
import { useCreateSocket } from "@/contexts/SocketContext";
import useMessageNotifications from "@/hooks/useMessageNotifications";
import { NotificationService } from "@/api/notificationService";
import imageBuyer from '../../assets/logo/buyerImage.jpg';

// ===== MODERN STYLED COMPONENTS =====

const ModernChatContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)',
  display: 'flex',
  background: 'linear-gradient(135deg, #0063b1 0%, #3366FF 100%)',
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    height: 'calc(100vh - 56px)',
    borderRadius: '16px',
  },
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 48px)',
    borderRadius: '12px',
  },
}));

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '400px',
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255,255,255,0.2)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    width: '350px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 1200,
    transform: 'translateX(-100%)',
    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.open': {
      transform: 'translateX(0)',
    },
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 2.5),
  borderBottom: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2.5, 2),
}));

const ContactsList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.3)',
    borderRadius: '10px',
    '&:hover': {
      background: 'rgba(255,255,255,0.5)',
    },
  },
}));

const ContactCard = styled(motion.div)<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(2.5, 2),
  margin: theme.spacing(1, 1.5),
  borderRadius: '16px',
  background: active 
    ? 'rgba(255,255,255,0.2)' 
    : 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(10px)',
  border: active 
    ? '1px solid rgba(255,255,255,0.3)' 
    : '1px solid rgba(255,255,255,0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'rgba(255,255,255,0.15)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: 'white',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderBottom: '1px solid #e0e0e0',
  background: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  background: 'white',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f5f5f5',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#ccc',
    borderRadius: '10px',
    '&:hover': {
      background: '#999',
    },
  },
}));

const MessageBubble = styled(motion.div)<{ sender?: boolean }>(({ theme, sender }) => ({
  maxWidth: '70%',
  padding: theme.spacing(1.5, 2),
  borderRadius: sender ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
  background: sender 
    ? 'linear-gradient(135deg, #0063b1 0%, #3366FF 100%)' 
    : '#f8f9fa',
  color: sender ? 'white' : '#333',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  marginBottom: theme.spacing(1),
  alignSelf: sender ? 'flex-end' : 'flex-start',
  position: 'relative',
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: '#666',
  marginTop: theme.spacing(0.5),
  opacity: 0.8,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5),
  background: 'white',
  borderTop: '1px solid #e0e0e0',
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  background: '#f8f9fa',
  padding: theme.spacing(1, 2),
  borderRadius: '25px',
  border: '1px solid #e0e0e0',
  transition: 'all 0.3s ease',
  '&:focus-within': {
    borderColor: '#0063b1',
    boxShadow: '0 0 0 3px rgba(0, 99, 177, 0.1)',
  },
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(4),
  textAlign: 'center',
  background: 'white',
}));

const MobileHeader = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
  },
}));

const SidebarOverlay = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1100,
    opacity: 0,
    visibility: 'hidden',
    transition: 'all 0.3s ease',
    '&.open': {
      opacity: 1,
      visibility: 'visible',
    },
  },
}));

const FloatingButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
  color: 'white',
  boxShadow: '0 8px 32px rgba(255,107,107,0.4)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252, #FF7A7A)',
    transform: 'scale(1.1)',
  },
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

// ===== MAIN COMPONENT =====

export default function ModernChat() {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State management
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState(null);

  // Socket and notifications
  const { messages: socketMessages, setMessages: setSocketMessages, socket } = useCreateSocket();
  const { totalUnreadCount, uniqueChatMessages, markAllSocketMessagesAsRead } = useMessageNotifications();
  
  // Combine and deduplicate messages
  const combinedMessages = useMemo(() => {
    // Combine messages from both sources and deduplicate properly
    const allMessages = [...messages, ...socketMessages];
    const uniqueMessages = allMessages.filter((message, index, self) => 
      index === self.findIndex(m => 
        m._id === message._id || 
        (m.message === message.message && 
         m.sender === message.sender && 
         m.idChat === message.idChat &&
         Math.abs(new Date(m.createdAt || 0).getTime() - new Date(message.createdAt || 0).getTime()) < 1000)
      )
    );
    return uniqueMessages.sort((a, b) => 
      new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
    );
  }, [messages, socketMessages]);
  
  // Join chat room when selected chat changes
  useEffect(() => {
    if (!socket || !selectedChat?._id) return;
    
    console.log('Joining chat room:', selectedChat._id);
    socket.emit('joinChat', { chatId: selectedChat._id, userId: auth.user._id });
    
    return () => {
      console.log('Leaving chat room:', selectedChat._id);
      socket.emit('leaveChat', { chatId: selectedChat._id, userId: auth.user._id });
    };
  }, [socket, selectedChat?._id, auth.user._id]);

  // Refs
  const messagesEndRef = useRef(null);
  const chatContentRef = useRef(null);

  // ===== API FUNCTIONS =====

  const fetchChats = async () => {
    if (!auth?.user?._id) return;
    
    setLoading(true);
    try {
      const response = await ChatAPI.getChats({ 
        id: auth.user._id, 
        from: 'seller' 
      });
      setChats(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const response = await MessageAPI.getByConversation(chatId);
      setMessages(response);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    // Add message to UI immediately for instant feedback
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      idChat: selectedChat._id,
      message: messageText,
      sender: auth.user._id,
      reciver: selectedChat.users[1]._id,
      createdAt: new Date().toISOString(),
      isSocket: true
    };

    // Add message to UI instantly
    setMessages(prev => [...prev, tempMessage]);

    const messageData = {
      idChat: selectedChat._id,
      message: messageText,
      sender: auth.user._id,
      reciver: selectedChat.users[1]._id
    };

    // Emit socket message for real-time delivery
    if (socket) {
      socket.emit('sendMessage', messageData);
    }
    
    // Send to API in background (don't wait for response)
    MessageAPI.send(messageData).then(response => {
      // Replace temp message with real message from API
      if (response && response._id) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id 
              ? { ...response, idChat: selectedChat._id }
              : msg
          )
        );
      }
      setSocketMessages([]);
      setError(null);
    }).catch(error => {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageText); // Restore text on error
    });
  };

  // ===== EVENT HANDLERS =====

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    // Clear socket messages when switching chats to prevent duplicates
    setSocketMessages([]);
    await fetchMessages(chat._id);
    
    // Mark messages and notifications as read when chat is selected
    try {
      if (auth?.user?._id) {
        console.log('🔖 Marking chat as read for user:', auth.user._id, 'chatId:', chat._id);
        
        // Mark messages as read using existing endpoint
        await MessageAPI.markAllAsRead(chat._id);
        console.log('✅ Messages marked as read successfully');
        
        // Mark notifications as read using existing endpoint
        await NotificationAPI.markChatAsRead(chat._id);
        console.log('✅ Notifications marked as read successfully');
        
        // Refresh notifications to update the UI
        markAllSocketMessagesAsRead();
      }
    } catch (error) {
      console.error('❌ Error marking chat as read:', error);
    }
    
    if (isMobile) {
      setSidebarOpen(false);
      setShowChat(true);
    }
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleBackToChats = () => {
    setShowChat(false);
    setSidebarOpen(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ===== EFFECTS =====

  useEffect(() => {
    if (auth?.user?._id) {
      fetchChats();
    }
  }, [auth?.user?._id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combinedMessages]);

  useEffect(() => {
    if (location.state?.chat) {
      handleChatSelect(location.state.chat);
    }
  }, [location.state]);

  // Periodically merge socket messages into main messages to prevent accumulation
  useEffect(() => {
    if (socketMessages.length > 0) {
      const timer = setTimeout(() => {
        setMessages(prev => {
          const newMessages = socketMessages.filter(socketMsg => 
            !prev.some(msg => msg._id === socketMsg._id)
          );
          return [...prev, ...newMessages];
        });
        setSocketMessages([]);
      }, 1000); // Merge after 1 second
      
      return () => clearTimeout(timer);
    }
  }, [socketMessages]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('📨 New message received:', data);
      if (data.idChat === selectedChat?._id) {
        // Add to socket messages instead of main messages to avoid duplicates
        const newMessage = {
          _id: data._id,
          idChat: data.idChat,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          createdAt: data.createdAt
        };
        
        // Check if message already exists to avoid duplicates
        const currentMessages = socketMessages || [];
        const exists = currentMessages.some(msg => msg._id === data._id);
        if (!exists) {
          setSocketMessages([...currentMessages, newMessage]);
        }
      }
    };

    const handleBuyerToSellerMessage = (data: any) => {
      console.log('📨 Buyer to seller message received:', data);
      if (data.chatId === selectedChat?._id) {
        const newMessage = {
          _id: data.messageId,
          idChat: data.chatId,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          createdAt: data.timestamp
        };
        
        // Check if message already exists to avoid duplicates
        const currentMessages = socketMessages || [];
        const exists = currentMessages.some(msg => msg._id === data.messageId);
        if (!exists) {
          setSocketMessages([...currentMessages, newMessage]);
        }
      }
    };

    const handleChatMessageUpdate = (data: any) => {
      console.log('📡 Chat message update received:', data);
      if (data.chatId === selectedChat?._id) {
        const newMessage = {
          _id: data.messageId,
          idChat: data.chatId,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          createdAt: data.timestamp
        };
        
        // Check if message already exists to avoid duplicates
        const currentMessages = socketMessages || [];
        const exists = currentMessages.some(msg => msg._id === data.messageId);
        if (!exists) {
          setSocketMessages([...currentMessages, newMessage]);
        }
      }
    };

    const handleAdminMessage = (data: any) => {
      console.log('📨 Admin message received:', data);
      if (data.idChat === selectedChat?._id) {
        const newMessage = {
          _id: data._id,
          idChat: data.idChat,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          createdAt: data.createdAt
        };
        
        // Check if message already exists to avoid duplicates
        const currentMessages = socketMessages || [];
        const exists = currentMessages.some(msg => msg._id === data._id);
        if (!exists) {
          setSocketMessages([...currentMessages, newMessage]);
        }
      }
    };

    // Listen for different message events
    socket.on('sendMessage', handleNewMessage);
    socket.on('buyerToSellerMessage', handleBuyerToSellerMessage);
    socket.on('chatMessageUpdate', handleChatMessageUpdate);
    socket.on('adminMessage', handleAdminMessage);

    return () => {
      socket.off('sendMessage', handleNewMessage);
      socket.off('buyerToSellerMessage', handleBuyerToSellerMessage);
      socket.off('chatMessageUpdate', handleChatMessageUpdate);
      socket.off('adminMessage', handleAdminMessage);
    };
  }, [socket, selectedChat?._id]);

  // ===== UTILITY FUNCTIONS =====

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatNotificationStatus = (chatId) => {
    const chatNotifications = uniqueChatMessages.filter(msg => 
      msg.chatId === chatId && (msg.isUnRead || (!msg.read && !msg.isSocket))
    );
    
    const hasUnread = chatNotifications.length > 0;
    const unreadCount = chatNotifications.length;
    
    const chat = chats.find(c => c._id === chatId);
    const isNew = chat ? 
      (new Date().getTime() - new Date(chat.createdAt).getTime()) < 24 * 60 * 60 * 1000 && hasUnread
      : false;
    
    return { isNew, hasUnread, unreadCount };
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const user = chat.users[1];
    return user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // ===== RENDER FUNCTIONS =====

  const renderContactCard = (chat, index) => {
    const notificationStatus = getChatNotificationStatus(chat._id);
    const isActive = selectedChat?._id === chat._id;

    return (
      <motion.div
        key={chat._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <ContactCard
          active={isActive}
          onClick={() => handleChatSelect(chat)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box position="relative">
              <Avatar
                src={imageBuyer}
                sx={{
                  width: 50,
                  height: 50,
                  border: isActive 
                    ? '3px solid rgba(255,255,255,0.8)' 
                    : notificationStatus.hasUnread 
                      ? '2px solid rgba(255,255,255,0.6)'
                      : '2px solid rgba(255,255,255,0.3)',
                  boxShadow: notificationStatus.isNew 
                    ? '0 0 20px rgba(255,255,255,0.3)' 
                    : '0 4px 16px rgba(0,0,0,0.1)',
                }}
              />
              {notificationStatus.hasUnread && (
                <Badge
                  badgeContent={notificationStatus.unreadCount}
                  color="error"
                  sx={{
                    position: 'absolute',
                    top: -5,
                    right: -5,
                    '& .MuiBadge-badge': {
                      fontSize: '0.7rem',
                      minWidth: '18px',
                      height: '18px',
                    }
                  }}
                />
              )}
            </Box>
            
            <Box flex={1} minWidth={0}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography
                  variant="subtitle1"
                  fontWeight={isActive ? 700 : notificationStatus.hasUnread ? 600 : 500}
                  sx={{
                    color: 'white',
                    opacity: isActive ? 1 : notificationStatus.hasUnread ? 0.9 : 0.8,
                  }}
                  noWrap
                >
                  {chat.users[1].firstName} {chat.users[1].lastName}
                  {notificationStatus.isNew && (
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        ml: 1,
                        fontSize: '0.6rem',
                        height: '16px',
                        background: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {formatTime(chat.createdAt)}
                </Typography>
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.8)',
                  opacity: notificationStatus.hasUnread ? 1 : 0.7,
                }}
                noWrap
              >
                {notificationStatus.isNew 
                  ? 'New conversation started'
                  : notificationStatus.hasUnread 
                    ? `${notificationStatus.unreadCount} unread messages`
                    : 'No new messages'
                }
              </Typography>
            </Box>
          </Box>
        </ContactCard>
      </motion.div>
    );
  };

  const renderMessage = (message, index) => {
    const isSender = message.sender === auth.user._id;
    
    return (
      <motion.div
        key={message._id || index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        style={{
          display: 'flex',
          justifyContent: isSender ? 'flex-end' : 'flex-start',
          marginBottom: theme.spacing(1),
        }}
      >
        <MessageBubble sender={isSender}>
          <Typography variant="body2" sx={{ lineHeight: 1.4 }}>
            {message.message}
          </Typography>
          <MessageTime>
            {formatTime(message.createdAt)}
            {isSender && (
              <CheckCircleRounded 
                sx={{ 
                  ml: 0.5, 
                  fontSize: 12,
                  verticalAlign: 'middle',
                  color: 'rgba(255,255,255,0.7)'
                }} 
              />
            )}
          </MessageTime>
        </MessageBubble>
      </motion.div>
    );
  };

  // ===== MAIN RENDER =====

  if (!auth?.user?._id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography variant="h6" color="error">
          Authentication required. Please log in again.
        </Typography>
      </Box>
    );
  }

  return (
    <ModernChatContainer>
      {/* Mobile Header */}
      <MobileHeader>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton 
            onClick={handleSidebarToggle}
            sx={{ color: 'white' }}
          >
            <MenuRounded />
          </IconButton>
          <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
            {t('chat.title')}
          </Typography>
          {totalUnreadCount > 0 && (
            <Badge 
              badgeContent={totalUnreadCount} 
              color="error"
            />
          )}
        </Box>
        <Box display="flex" gap={1}>
          <IconButton 
            onClick={fetchChats}
            sx={{ color: 'white' }}
          >
            <RefreshRounded />
          </IconButton>
          <IconButton sx={{ color: 'white' }}>
            <MoreVertRounded />
          </IconButton>
        </Box>
      </MobileHeader>

      {/* Sidebar Overlay */}
      <SidebarOverlay 
        className={sidebarOpen ? 'open' : ''} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <SidebarContainer className={sidebarOpen ? 'open' : ''}>
        <SidebarHeader>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={700} sx={{ color: 'white' }}>
              {t('chat.title')}
            </Typography>
            <Box display="flex" gap={1}>
              <IconButton 
                onClick={fetchChats}
                sx={{ color: 'white' }}
              >
                <RefreshRounded />
              </IconButton>
              <IconButton sx={{ color: 'white' }}>
                <MoreVertRounded />
              </IconButton>
              {isMobile && (
                <IconButton 
                  onClick={() => setSidebarOpen(false)}
                  sx={{ color: 'white' }}
                >
                  <CloseRounded />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <TextField
            fullWidth
            placeholder="Search conversations..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                '& input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                },
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
              }
            }}
          />
        </SidebarHeader>

        <ContactsList>
          {loading && filteredChats.length === 0 ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%">
              <CircularProgress sx={{ color: 'white' }} />
            </Box>
          ) : filteredChats.length > 0 ? (
            <AnimatePresence>
              {filteredChats.map((chat, index) => renderContactCard(chat, index))}
            </AnimatePresence>
          ) : (
            <EmptyState>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                No conversations found
              </Typography>
            </EmptyState>
          )}
        </ContactsList>
      </SidebarContainer>

      {/* Chat Area */}
      <ChatArea sx={{ display: { xs: showChat ? 'flex' : 'none', md: 'flex' } }}>
        {selectedChat ? (
          <>
            <ChatHeader>
              <Box display="flex" alignItems="center" gap={2}>
                {isMobile && (
                  <IconButton onClick={handleBackToChats}>
                    <KeyboardBackspaceRounded />
                  </IconButton>
                )}
                <Avatar 
                  src={imageBuyer}
                  sx={{ width: 40, height: 40 }}
                />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedChat.users[1].firstName} {selectedChat.users[1].lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Online now
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" gap={1}>
                <IconButton>
                  <VideoCallRounded />
                </IconButton>
                <IconButton>
                  <PhoneRounded />
                </IconButton>
                <IconButton>
                  <MoreVertRounded />
                </IconButton>
              </Box>
            </ChatHeader>

            <MessagesContainer ref={chatContentRef}>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress sx={{ color: '#0063b1' }} />
                </Box>
              ) : combinedMessages.length > 0 ? (
                <>
                  {combinedMessages.map((message, index) => renderMessage(message, index))}
                  
                  
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <EmptyState>
                  <ChatRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    No messages yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start the conversation by sending a message below
                  </Typography>
                </EmptyState>
              )}
            </MessagesContainer>

            <InputContainer>
              <InputWrapper>
                <IconButton>
                  <AttachFileRounded />
                </IconButton>
                
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      fontSize: '0.9rem',
                      '& fieldset': { border: 'none' },
                    }
                  }}
                />
                
                <IconButton>
                  <InsertEmoticonRounded />
                </IconButton>
                
                <IconButton>
                  <MicRounded />
                </IconButton>
                
                <IconButton 
                  disabled={!newMessage.trim()}
                  onClick={sendMessage}
                  sx={{
                    background: newMessage.trim() 
                      ? 'linear-gradient(45deg, #0063b1, #3366FF)' 
                      : '#ccc',
                    color: 'white',
                    '&:hover': {
                      background: newMessage.trim() 
                        ? 'linear-gradient(45deg, #103996, #1939B7)' 
                        : '#ccc',
                    },
                  }}
                >
                  <SendRounded />
                </IconButton>
              </InputWrapper>
            </InputContainer>
          </>
        ) : (
          <EmptyState>
            <ChatRounded sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Select a conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose a chat from the sidebar to start messaging
            </Typography>
          </EmptyState>
        )}
      </ChatArea>

      {/* Floating Action Button */}
      <FloatingButton
        onClick={handleSidebarToggle}
        color="primary"
      >
        <ChatRounded />
      </FloatingButton>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </ModernChatContainer>
  );
}