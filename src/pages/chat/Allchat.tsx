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
import { UserAPI } from "@/api/user";
import useAuth from "@/hooks/useAuth";
import { useCreateSocket } from "@/contexts/SocketContext";
import useMessageNotifications from "@/hooks/useMessageNotifications";
import { NotificationService } from "@/api/notificationService";
import imageBuyer from '../../assets/logo/buyerImage.jpg';

// ===== MODERN STYLED COMPONENTS =====

const ModernChatContainer = styled(Box)(({ theme }) => ({
  height: 'calc(100vh - 64px)',
  display: 'flex',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3), transparent 50%)',
    pointerEvents: 'none',
  },
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
  width: '380px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(30px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  boxShadow: '4px 0 20px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('lg')]: {
    width: '340px',
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
  padding: theme.spacing(2.5, 2.5),
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent)',
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2.5),
  background: 'rgba(102, 126, 234, 0.03)',
}));

const ContactsList = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(1.5),
  background: 'rgba(255, 255, 255, 0.5)',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.02)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '10px',
    '&:hover': {
      background: 'linear-gradient(135deg, #764ba2, #667eea)',
    },
  },
}));

const ContactCard = styled(motion.div)<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(2, 2.5),
  margin: theme.spacing(0.75, 1),
  borderRadius: '18px',
  background: active 
    ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  border: active 
    ? '2px solid rgba(102, 126, 234, 0.4)' 
    : '1px solid rgba(0, 0, 0, 0.06)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: active 
    ? '0 8px 24px rgba(102, 126, 234, 0.2)' 
    : '0 2px 8px rgba(0, 0, 0, 0.04)',
  '&:hover': {
    background: active 
      ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)' 
      : 'rgba(255, 255, 255, 0.95)',
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.15)',
    borderColor: active ? 'rgba(102, 126, 234, 0.5)' : 'rgba(102, 126, 234, 0.2)',
  },
}));

const ChatArea = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.05), transparent 50%)',
    pointerEvents: 'none',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  zIndex: 1,
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3, 4),
  overflowY: 'auto',
  background: 'transparent',
  position: 'relative',
  zIndex: 0,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.02)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    borderRadius: '10px',
    '&:hover': {
      background: 'linear-gradient(135deg, #764ba2, #667eea)',
    },
  },
}));

const MessageBubble = styled(motion.div)<{ sender?: boolean }>(({ theme, sender }) => ({
  maxWidth: '65%',
  padding: theme.spacing(1.5, 2.5),
  borderRadius: sender ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
  background: sender 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
    : 'rgba(255, 255, 255, 0.95)',
  color: sender ? 'white' : '#2d3748',
  boxShadow: sender 
    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(1.5),
  alignSelf: sender ? 'flex-start' : 'flex-end',
  position: 'relative',
  backdropFilter: 'blur(10px)',
  border: sender ? 'none' : '1px solid rgba(0, 0, 0, 0.05)',
  '&::before': sender ? {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: -8,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 8px 12px 0',
    borderColor: `transparent #667eea transparent transparent`,
  } : {
    content: '""',
    position: 'absolute',
    bottom: 0,
    right: -8,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderWidth: '0 0 12px 8px',
    borderColor: `transparent transparent rgba(255, 255, 255, 0.95) transparent`,
  },
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: 'rgba(0, 0, 0, 0.5)',
  marginTop: theme.spacing(0.5),
  opacity: 0.7,
  fontWeight: 400,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 3),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
  position: 'relative',
  zIndex: 1,
}));

const InputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  background: 'rgba(255, 255, 255, 0.9)',
  padding: theme.spacing(1.25, 2.5),
  borderRadius: '30px',
  border: '2px solid rgba(102, 126, 234, 0.2)',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  '&:focus-within': {
    borderColor: 'rgba(102, 126, 234, 0.5)',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.2)',
    background: 'rgba(255, 255, 255, 1)',
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
  background: 'transparent',
  position: 'relative',
  zIndex: 0,
}));

const MobileHeader = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
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
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
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
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: 1000,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'scale(1.1)',
    boxShadow: '0 12px 32px rgba(102, 126, 234, 0.5)',
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
  const [lastMessages, setLastMessages] = useState<Record<string, any>>({}); // Map of chatId to last message

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
    if (!auth?.user?._id) {
      console.warn('⚠️ Cannot fetch chats: No user ID available');
      return;
    }
    
    console.log('🔄 Fetching chats for seller:', auth.user._id);
    setLoading(true);
    setError(null);
    
    try {
      const response = await ChatAPI.getChats({ 
        id: auth.user._id, 
        from: 'seller' 
      });
      
      console.log('📥 Raw API response:', response);
      console.log('📥 Response type:', typeof response);
      console.log('📥 Is array:', Array.isArray(response));
      
      // Ensure response is an array - handle multiple possible response formats
      let chatsArray: any[] = [];
      if (Array.isArray(response)) {
        chatsArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        chatsArray = response.data;
      } else if (response?.chats && Array.isArray(response.chats)) {
        chatsArray = response.chats;
      } else if (response?.result && Array.isArray(response.result)) {
        chatsArray = response.result;
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        chatsArray = [];
      }
      
      console.log('📊 Extracted chats array:', chatsArray.length, 'chats');
      
      // Filter out invalid chats (must have users array with at least 2 users)
      const validChats = chatsArray.filter((chat: any) => {
        const isValid = chat && 
                       chat._id && 
                       Array.isArray(chat.users) && 
                       chat.users.length >= 2; // Each chat should have exactly 2 users
        
        if (!isValid) {
          console.warn('⚠️ Invalid chat filtered out:', {
            hasId: !!chat?._id,
            hasUsers: !!chat?.users,
            usersIsArray: Array.isArray(chat?.users),
            usersLength: chat?.users?.length
          });
        }
        
        return isValid;
      });
      
      console.log('✅ Valid chats:', validChats.length, 'out of', chatsArray.length);
      if (validChats.length > 0) {
        console.log('📋 Sample valid chat:', {
          _id: validChats[0]._id,
          users: validChats[0].users?.map((u: any) => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            AccountType: u.AccountType
          })),
          createdAt: validChats[0].createdAt
        });
      }
      
      // If no chats, set empty and return early
      if (validChats.length === 0) {
        console.log('ℹ️ No chats found for this seller');
        setChats([]);
        setLastMessages({});
        setError(null);
        setLoading(false);
        return;
      }
      
      // Fetch last message for each chat in parallel (with timeout to prevent hanging)
      const lastMessagesMap: Record<string, any> = {};
      const lastMessagePromises = validChats.map(async (chat: any) => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          );
          
          const messagesPromise = MessageAPI.getByConversation(chat._id);
          const messages = await Promise.race([messagesPromise, timeoutPromise]) as any[];
          
          if (Array.isArray(messages) && messages.length > 0) {
            // Sort messages to get the most recent
            const sortedMessages = [...messages].sort((a: any, b: any) => {
              const dateA = new Date(a.createdAt || 0).getTime();
              const dateB = new Date(b.createdAt || 0).getTime();
              return dateB - dateA; // Most recent first
            });
            lastMessagesMap[chat._id] = sortedMessages[0];
          }
        } catch (error) {
          console.warn(`Error fetching last message for chat ${chat._id}:`, error);
          // Continue even if one fails - conversations will still display
        }
      });
      
      // Wait for all promises but don't block if some fail
      const results = await Promise.allSettled(lastMessagePromises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failCount = results.filter(r => r.status === 'rejected').length;
      console.log(`📨 Last messages fetched: ${successCount} succeeded, ${failCount} failed`);
      
      setLastMessages(lastMessagesMap);
      
      // Sort chats by most recent activity (last message time or chat creation time)
      const sortedChats = [...validChats].sort((a: any, b: any) => {
        const lastMsgA = lastMessagesMap[a._id];
        const lastMsgB = lastMessagesMap[b._id];
        
        const timeA = lastMsgA 
          ? new Date(lastMsgA.createdAt || 0).getTime()
          : new Date(a.createdAt || 0).getTime();
        const timeB = lastMsgB
          ? new Date(lastMsgB.createdAt || 0).getTime()
          : new Date(b.createdAt || 0).getTime();
        
        return timeB - timeA; // Most recent first
      });
      
      console.log('✅ Setting chats:', sortedChats.length);
      setChats(sortedChats);
      setError(null);
    } catch (error: any) {
      console.error('❌ Error fetching chats:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response?.data
      });
      setError('Failed to load chats. Please try refreshing.');
      setChats([]); // Set empty array on error
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

    // Find the other user (receiver) - the one who is not the current user
    const receiver = selectedChat.users?.find((user: any) => user._id !== auth.user._id) || selectedChat.users?.[0];
    if (!receiver || !receiver._id) {
      console.error('Receiver not found in chat users');
      setNewMessage(messageText); // Restore text
      return;
    }

    // Add message to UI immediately for instant feedback
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      idChat: selectedChat._id,
      message: messageText,
      sender: auth.user._id,
      reciver: receiver._id,
      createdAt: new Date().toISOString(),
      isSocket: true
    };

    // Add message to UI instantly
    setMessages(prev => [...prev, tempMessage]);
    
    const messageData = {
      idChat: selectedChat._id,
      message: messageText,
      sender: auth.user._id,
      reciver: receiver._id
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
        
        // Update last message for this chat
        if (selectedChat._id) {
          setLastMessages((prev: Record<string, any>) => ({
            ...prev,
            [selectedChat._id]: { ...response, idChat: selectedChat._id }
          }));
        }
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
    // Check URL query parameters first (for cross-app navigation from buyer app)
    const urlParams = new URLSearchParams(window.location.search);
    const userIdFromUrl = urlParams.get('userId') || urlParams.get('buyerId');
    
    if (location.state?.chat) {
      handleChatSelect(location.state.chat);
    } else if ((location.state?.userId || userIdFromUrl) && auth?.user?._id) {
      // Handle opening chat with specific userId (from state or URL)
      const openChatWithUser = async () => {
        try {
          const userId = location.state?.userId || userIdFromUrl;
          console.log('💬 Opening chat with user:', userId, 'from:', location.state?.userId ? 'state' : 'URL');
          
          // Get all chats
          const chatsResponse = await ChatAPI.getChats({
            id: auth.user._id,
            from: 'seller'
          });
          
          // Find existing chat with this user
          const existingChat = chatsResponse?.find((chat: any) => 
            chat.users?.some((user: any) => {
              const userIdStr = user._id?.toString() || user._id;
              return userIdStr === userId?.toString() || userIdStr === userId;
            })
          );
          
          if (existingChat) {
            // Open existing chat
            console.log('✅ Found existing chat:', existingChat._id);
            handleChatSelect(existingChat);
            // Clean up URL parameters
            if (userIdFromUrl) {
              window.history.replaceState({}, '', window.location.pathname);
            }
          } else if (location.state?.createChat || userIdFromUrl) {
            // Create new chat with this user (if createChat flag is set or coming from URL)
            try {
              console.log('📝 Creating new chat with user:', userId);
              
              // Fetch buyer user details
              const buyerUser = await UserAPI.findById(userId);
              
              if (!buyerUser) {
                console.error('❌ Buyer user not found:', userId);
                return;
              }
              
              // Create proper user objects for chat creation
              const sellerUser = {
                _id: auth.user._id,
                firstName: auth.user.firstName || '',
                lastName: auth.user.lastName || '',
                AccountType: (auth.user as any).AccountType || 'seller',
                phone: auth.user.phone || ''
              };
              
              const buyerUserObj = {
                _id: buyerUser._id || userId,
                firstName: buyerUser.firstName || '',
                lastName: buyerUser.lastName || '',
                AccountType: buyerUser.AccountType || 'client',
                phone: buyerUser.phone || ''
              };
              
              const newChatResponse = await ChatAPI.createChat({
                users: [sellerUser, buyerUserObj],
                createdAt: new Date().toISOString()
              });
              
              if (newChatResponse && newChatResponse._id) {
                // Select the newly created chat
                console.log('✅ Created new chat:', newChatResponse._id);
                handleChatSelect(newChatResponse);
                // Clean up URL parameters
                if (userIdFromUrl) {
                  window.history.replaceState({}, '', window.location.pathname);
                }
              } else {
                // Fallback: refresh chats and find the new chat
                await fetchChats();
                const updatedChats = await ChatAPI.getChats({
                  id: auth.user._id,
                  from: 'seller'
                });
                const newChat = updatedChats?.find((chat: any) => 
                  chat.users?.some((user: any) => {
                    const userIdStr = user._id?.toString() || user._id;
                    return userIdStr === userId?.toString() || userIdStr === userId;
                  })
                );
                if (newChat) {
                  handleChatSelect(newChat);
                  // Clean up URL parameters
                  if (userIdFromUrl) {
                    window.history.replaceState({}, '', window.location.pathname);
                  }
                }
              }
            } catch (createError) {
              console.error('❌ Error creating chat:', createError);
            }
          }
        } catch (error) {
          console.error('❌ Error opening chat with user:', error);
        }
      };
      
      openChatWithUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, auth?.user?._id]);

  // Periodically merge socket messages into main messages to prevent accumulation
  useEffect(() => {
    if (socketMessages.length > 0) {
      // Merge socket messages immediately for the selected chat
      setMessages(prev => {
        const newMessages = socketMessages.filter(socketMsg => 
          socketMsg.idChat === selectedChat?._id && // Only merge messages for selected chat
          !prev.some(msg => msg._id === socketMsg._id)
        );
        return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
      });
      // Clear processed messages
      const filtered = socketMessages.filter((msg: any) => msg.idChat !== selectedChat?._id);
      if (filtered.length !== socketMessages.length) {
        setSocketMessages(filtered);
      }
    }
  }, [socketMessages, selectedChat?._id]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('📨 New message received:', data);
      // Check if message is for any of the user's chats, not just the selected one
      const isForUserChat = chats.some(chat => chat._id === data.idChat);
      
      if (isForUserChat) {
        // If it's for the selected chat, add it directly to messages immediately
        if (data.idChat === selectedChat?._id) {
          const newMessage = {
            _id: data._id,
            idChat: data.idChat,
            message: data.message,
            sender: data.sender,
            reciver: data.reciver,
            createdAt: data.createdAt
          };
          
          // Add directly to messages state for immediate display
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === data._id);
            return exists ? prev : [...prev, newMessage];
          });
        }
        // Refresh chat list to show unread indicator even if chat is not selected
        fetchChats();
      }
    };

    const handleBuyerToSellerMessage = (data: any) => {
      console.log('📨 Buyer to seller message received:', data);
      // Check if message is for any of the user's chats
      const isForUserChat = chats.some(chat => chat._id === data.chatId);
      
      if (isForUserChat) {
        const newMessage = {
          _id: data.messageId || data._id,
          idChat: data.chatId,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          createdAt: data.timestamp || data.createdAt
        };
        
        // Update last message for this chat
        setLastMessages((prev: Record<string, any>) => ({
          ...prev,
          [data.chatId]: newMessage
        }));
        
        // If it's for the selected chat, add it directly to messages immediately
        if (data.chatId === selectedChat?._id) {
          // Add directly to messages state for immediate display
          setMessages(prev => {
            const exists = prev.some(msg => msg._id === newMessage._id);
            return exists ? prev : [...prev, newMessage];
          });
        }
        // Refresh chat list to show unread indicator even if chat is not selected
        fetchChats();
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
          
          // Update last message if this is for a chat in our list
          if (data.idChat && chats.some((chat: any) => chat._id === data.idChat)) {
            setLastMessages((prev: Record<string, any>) => ({
              ...prev,
              [data.idChat]: newMessage
            }));
          }
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
  }, [socket, selectedChat?._id, chats]);

  // ===== UTILITY FUNCTIONS =====

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // If less than 1 minute ago
    if (diffMins < 1) return 'Just now';
    // If less than 1 hour ago
    if (diffMins < 60) return `${diffMins}m ago`;
    // If less than 24 hours ago
    if (diffHours < 24) return `${diffHours}h ago`;
    // If less than 7 days ago
    if (diffDays < 7) return `${diffDays}d ago`;
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  const formatTimeShort = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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

  const filteredChats = useMemo(() => {
    console.log('Filtering chats. Total chats:', chats.length, 'Search query:', searchQuery);
    
    let filtered = chats.filter(chat => {
      if (!searchQuery) return true;
      // Find the other user (not the current user)
      const otherUser = chat.users?.find((user: any) => user._id !== auth?.user?._id) || chat.users?.[0];
      if (!otherUser) return false;
      const nameMatch = (otherUser.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (otherUser.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
      // Also search in last message
      const lastMessage = lastMessages[chat._id];
      const messageMatch = lastMessage?.message?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || messageMatch;
    });
    
    console.log('Filtered chats count:', filtered.length);
    
    // Maintain sort order by most recent activity
    const sorted = filtered.sort((a: any, b: any) => {
      const lastMsgA = lastMessages[a._id];
      const lastMsgB = lastMessages[b._id];
      
      const timeA = lastMsgA 
        ? new Date(lastMsgA.createdAt || 0).getTime()
        : new Date(a.createdAt || 0).getTime();
      const timeB = lastMsgB
        ? new Date(lastMsgB.createdAt || 0).getTime()
        : new Date(b.createdAt || 0).getTime();
      
      return timeB - timeA; // Most recent first
    });
    
    return sorted;
  }, [chats, searchQuery, lastMessages, auth?.user?._id]);

  // ===== RENDER FUNCTIONS =====

  const renderContactCard = (chat, index) => {
    const notificationStatus = getChatNotificationStatus(chat._id);
    const isActive = selectedChat?._id === chat._id;
    const lastMessage = lastMessages[chat._id];
    
    // Find the other user (not the current user) - handle both string and ObjectId formats
    const currentUserId = auth?.user?._id?.toString() || auth?.user?._id;
    const otherUser = chat.users?.find((user: any) => {
      const userId = user._id?.toString() || user._id;
      return userId !== currentUserId;
    }) || chat.users?.[0];
    
    if (!otherUser) {
      console.warn('⚠️ Chat has no other user:', {
        chatId: chat._id,
        users: chat.users,
        currentUserId: currentUserId
      });
      return null;
    }
    
    // Ensure user data is properly formatted
    const formattedOtherUser = {
      _id: otherUser._id?.toString() || otherUser._id,
      firstName: otherUser.firstName || '',
      lastName: otherUser.lastName || '',
      AccountType: otherUser.AccountType || '',
      phone: otherUser.phone || ''
    };
    
    // Determine last message preview text
    let lastMessageText = '';
    let lastMessageTime = chat.createdAt;
    
    if (lastMessage) {
      lastMessageTime = lastMessage.createdAt;
      const isLastMessageFromMe = lastMessage.sender === auth?.user?._id;
      const messageText = lastMessage.message || '';
      // Truncate to 50 characters
      const truncatedText = messageText.length > 50 
        ? messageText.substring(0, 50) + '...' 
        : messageText;
      lastMessageText = isLastMessageFromMe ? `You: ${truncatedText}` : truncatedText;
    } else {
      lastMessageText = 'No messages yet';
    }

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
                  width: 52,
                  height: 52,
                  border: isActive 
                    ? '3px solid rgba(102, 126, 234, 0.5)' 
                    : notificationStatus.hasUnread 
                      ? '2px solid rgba(102, 126, 234, 0.4)'
                      : '2px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: notificationStatus.isNew 
                    ? '0 0 20px rgba(102, 126, 234, 0.3)' 
                    : isActive
                      ? '0 4px 16px rgba(102, 126, 234, 0.2)'
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  transition: 'all 0.3s ease',
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
                    color: isActive ? '#667eea' : '#2d3748',
                    fontSize: '0.95rem',
                  }}
                  noWrap
                >
                  {formattedOtherUser.firstName} {formattedOtherUser.lastName}
                  {notificationStatus.isNew && (
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        ml: 1,
                        fontSize: '0.6rem',
                        height: '18px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)',
                      }}
                    />
                  )}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: isActive ? 'rgba(102, 126, 234, 0.7)' : 'rgba(0, 0, 0, 0.5)', 
                    fontSize: '0.7rem',
                    fontWeight: 500,
                  }}
                >
                  {formatTimeShort(lastMessageTime)}
                </Typography>
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  color: isActive ? 'rgba(102, 126, 234, 0.8)' : (notificationStatus.hasUnread ? '#2d3748' : 'rgba(0, 0, 0, 0.6)'),
                  fontWeight: notificationStatus.hasUnread ? 500 : 400,
                  fontSize: '0.8rem',
                  mt: 0.5,
                }}
                noWrap
              >
                {lastMessageText}
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
          justifyContent: isSender ? 'flex-start' : 'flex-end',
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
            <Typography variant="h6" fontWeight={700} sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('chat.title')}
            </Typography>
            <Box display="flex" gap={1}>
              <IconButton 
                onClick={fetchChats}
                sx={{ 
                  color: '#667eea',
                  '&:hover': { 
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'rotate(180deg)',
                    transition: 'transform 0.5s ease',
                  }
                }}
              >
                <RefreshRounded />
              </IconButton>
              <IconButton sx={{ 
                color: '#667eea',
                '&:hover': { background: 'rgba(102, 126, 234, 0.1)' }
              }}>
                <MoreVertRounded />
              </IconButton>
              {isMobile && (
                <IconButton 
                  onClick={() => setSidebarOpen(false)}
                  sx={{ 
                    color: '#667eea',
                    '&:hover': { background: 'rgba(102, 126, 234, 0.1)' }
                  }}
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
                  <SearchRounded sx={{ color: 'rgba(102, 126, 234, 0.6)' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                '& input': {
                  color: '#2d3748',
                  '&::placeholder': {
                    color: 'rgba(102, 126, 234, 0.5)',
                    opacity: 1,
                  },
                },
                '& fieldset': {
                  border: 'none',
                },
                '&:hover': {
                  background: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(102, 126, 234, 0.3)',
                },
                '&.Mui-focused': {
                  background: 'rgba(255, 255, 255, 1)',
                  borderColor: 'rgba(102, 126, 234, 0.5)',
                  boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                },
              }
            }}
          />
        </SidebarHeader>

        <ContactsList>
          {loading && chats.length === 0 ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" gap={2}>
              <CircularProgress sx={{ color: '#667eea' }} />
              <Typography variant="body2" sx={{ color: 'rgba(102, 126, 234, 0.7)' }}>
                Loading conversations...
              </Typography>
            </Box>
          ) : filteredChats.length > 0 ? (
            <Box>
              {filteredChats.map((chat, index) => {
                const card = renderContactCard(chat, index);
                return card; // Filter out null cards
              }).filter(Boolean)}
            </Box>
          ) : chats.length > 0 && searchQuery ? (
            <EmptyState>
              <ChatRounded sx={{ fontSize: 48, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#2d3748', mb: 1, fontWeight: 500 }}>
                No conversations match your search
              </Typography>
            </EmptyState>
          ) : (
            <EmptyState>
              <ChatRounded sx={{ fontSize: 48, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#2d3748', mb: 1, fontWeight: 500 }}>
                {searchQuery ? 'No conversations match your search' : 'No conversations yet'}
              </Typography>
              {!searchQuery && (
                <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
                  Start a conversation from an order notification
                </Typography>
              )}
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
                    {(() => {
                      const currentUserId = auth?.user?._id?.toString() || auth?.user?._id;
                      const otherUser = selectedChat.users?.find((user: any) => {
                        const userId = user._id?.toString() || user._id;
                        return userId !== currentUserId;
                      }) || selectedChat.users?.[0];
                      return otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';
                    })()}
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
                  <CircularProgress sx={{ color: '#667eea' }} />
                </Box>
              ) : combinedMessages.length > 0 ? (
                <>
                  {combinedMessages.map((message, index) => renderMessage(message, index))}
                  
                  
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <EmptyState>
                  <ChatRounded sx={{ fontSize: 64, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: '#2d3748' }}>
                    No messages yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
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
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : '#e2e8f0',
                    color: 'white',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: newMessage.trim() 
                        ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' 
                        : '#e2e8f0',
                      transform: 'scale(1.1)',
                      boxShadow: newMessage.trim() ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none',
                    },
                    '&:disabled': {
                      background: '#e2e8f0',
                      color: '#cbd5e0',
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
            <ChatRounded sx={{ fontSize: 64, color: 'rgba(102, 126, 234, 0.3)', mb: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ color: '#2d3748' }}>
              Select a conversation
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.5)' }}>
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