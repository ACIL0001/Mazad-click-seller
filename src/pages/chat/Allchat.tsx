import { ChatAPI } from "@/api/Chat"
import useAuth from "@/hooks/useAuth"
import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MessageAPI } from "@/api/message"
import { useCreateSocket } from "@/contexts/SocketContext"
import useMessageNotifications from "@/hooks/useMessageNotifications"
import { 
  Box, 
  Typography, 
  TextField, 
  Paper, 
  Avatar, 
  List, 
  ListItem, 
  IconButton, 
  InputAdornment, 
  Badge, 
  Tooltip,
  CircularProgress,
  useTheme,
  alpha,
  Chip,
  Drawer,
  useMediaQuery,
  Fade,
  Slide,
  Divider,
  Stack
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
  KeyboardBackspaceRounded
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import imageBuyer from '../../assets/logo/buyerImage.jpg';
import { NotificationService } from "@/api/notificationService"

// Modern responsive styled components
const ChatLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(100vh - 120px)',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    height: 'calc(100vh - 80px)',
    borderRadius: theme.shape.borderRadius,
  },
  [theme.breakpoints.down('sm')]: {
    height: 'calc(100vh - 60px)',
    borderRadius: 0,
    boxShadow: 'none',
  },
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: '360px',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    width: '320px',
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    zIndex: 1200,
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&.open': {
      transform: 'translateX(0)',
    },
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2, 1.5),
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5, 1.5, 1),
  },
}));

const ContactsContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '10px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.3),
    },
  },
}));

const ContactItem = styled(motion.div)<{ active?: boolean }>(({ theme, active }) => ({
  padding: theme.spacing(1.5, 2),
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.5),
    transform: 'translateX(4px)',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.2, 1.5),
    margin: theme.spacing(0.3, 0.5),
  },
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
  minWidth: 0,
}));

const ChatMain = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    width: '100%',
  },
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.2, 2),
    gap: theme.spacing(1),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 1.5),
  },
}));

const ChatContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '10px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.3),
    },
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const MessageGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const MessageBubbleContainer = styled(motion.div)<{ sender?: boolean }>(({ theme, sender }) => ({
  display: 'flex',
  justifyContent: sender ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
  position: 'relative',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
}));

const MessageBubble = styled(Box)<{ sender?: boolean }>(({ theme, sender }) => ({
  maxWidth: '75%',
  minWidth: 'min-content',
  padding: theme.spacing(1.2, 1.8),
  borderRadius: sender ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  backgroundColor: sender 
    ? theme.palette.primary.main 
    : theme.palette.background.paper,
  color: sender 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
  position: 'relative',
  display: 'block',
  textAlign: 'left',
  width: 'fit-content',
  wordBreak: 'normal',
  whiteSpace: 'normal',
  boxSizing: 'border-box',
  border: sender ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '85%',
    padding: theme.spacing(1, 1.5),
  },
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.3),
  opacity: 0.7,
  alignSelf: 'flex-end',
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const ChatInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(0.8, 1.5),
  borderRadius: theme.shape.borderRadius * 5,
  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
  transition: 'all 0.2s ease',
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.6, 1.2),
    gap: theme.spacing(0.8),
  },
}));

const EmptyChatState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

// New modern components
const MobileHeader = styled(Box)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(1.5, 2),
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
    position: 'sticky',
    top: 0,
    zIndex: 1000,
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
    backgroundColor: alpha(theme.palette.common.black, 0.5),
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

const FloatingActionButton = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: 1000,
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

const scrollToBottomVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
};

const MessageBubbleVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
};

const contactItemVariants = {
  initial: { x: -10, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 30 } }
};

// Add new styled components for modern new chat indicators
const NewChatIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 4,
  right: 4,
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main, // Use project's primary blue
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}`,
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
    },
    '70%': {
      boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0)}`,
    },
    '100%': {
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
    },
  },
}));

const UnreadBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    minWidth: '20px',
    height: '20px',
    borderRadius: '10px',
    border: `2px solid ${theme.palette.background.paper}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.3)}`,
    animation: 'bounce 1s ease-in-out',
    '@keyframes bounce': {
      '0%, 20%, 50%, 80%, 100%': {
        transform: 'translateY(0)',
      },
      '40%': {
        transform: 'translateY(-4px)',
      },
      '60%': {
        transform: 'translateY(-2px)',
      },
    },
  },
}));

const ModernContactItem = styled(ContactItem)<{ isNew?: boolean; hasUnread?: boolean }>(({ theme, isNew, hasUnread }) => ({
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  ...(isNew && {
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
      borderRadius: '0 2px 2px 0',
    },
  }),
  ...(hasUnread && !isNew && {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '3px',
      height: '100%',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '0 2px 2px 0',
    },
  }),
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
}));

const NewChatChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  fontSize: '0.7rem',
  height: '20px',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontWeight: 'bold',
  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.4)}`,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

// Utility to deduplicate messages by _id or composite key
const getUniqueMessages = (messagesArr1, messagesArr2) => {
  const map = new Map();
  [...messagesArr1, ...messagesArr2].forEach(msg => {
    if (!msg) return;
    // Use _id if present, otherwise use a composite key
    const key = msg._id || `${msg.sender}_${msg.message}_${msg.createdAt}`;
    map.set(key, msg);
  });
  return Array.from(map.values());
};

// Utility to deduplicate messages by _id (keep the first occurrence)
const deduplicateMessagesById = (messagesArr: any[]) => {
  const seen = new Set();
  return messagesArr.filter(msg => {
    if (!msg || !msg._id) return true;
    if (seen.has(msg._id)) return false;
    seen.add(msg._id);
    return true;
  });
};

// Utility to filter only messages with unique _id in MessagesSocket
const filterUniqueMessagesInSocket = (messagesArr: any[]) => {
  const idCount = messagesArr.reduce((acc, msg) => {
    if (msg && msg._id) {
      acc[msg._id] = (acc[msg._id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  return messagesArr.filter(msg => !msg._id || idCount[msg._id] === 1);
};


export default function Allchat() {
    const { t } = useTranslation();
    const { auth } = useAuth();
    const [chats, setChats] = useState([]);
    const [search, setSearch] = useState('');
    const nav = useNavigate();
    const [idChat, setIdChat] = useState("");
    const [text, setText] = useState('');
    const [reget, setReget] = useState(false);
    const { messages: MessagesSocket, setMessages: SetSocketMessages } = useCreateSocket();
    const [userChat, setUserChat] = useState<any>({});
    const [messages, setMessages] = useState([]);
    const [filteredChats, setFilteredChats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    
    // New responsive state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);
    
    // Circuit breaker for API calls
    const [apiErrorCount, setApiErrorCount] = useState(0);
    const [lastApiError, setLastApiError] = useState<number | null>(null);
    const MAX_API_ERRORS = 3;
    const API_ERROR_RESET_TIME = 30000; // 30 seconds

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const chatContentRef = useRef<HTMLDivElement | null>(null);
    const theme = useTheme();
    
    // Responsive breakpoints
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

    // Circuit breaker function
    const shouldBlockApiCall = () => {
      const now = Date.now();
      
      // Reset error count if enough time has passed
      if (lastApiError && (now - lastApiError) > API_ERROR_RESET_TIME) {
        setApiErrorCount(0);
        setLastApiError(null);
        return false;
      }
      
      // Block if too many errors
      return apiErrorCount >= MAX_API_ERRORS;
    };

    const handleApiError = (error: any) => {
      const now = Date.now();
      setApiErrorCount(prev => prev + 1);
      setLastApiError(now);
      
      console.error(`🚨 API Error #${apiErrorCount + 1}:`, error);
      
      // If it's a 500 error, don't treat it as auth error
      if (error?.response?.status === 500) {
        console.error('🚨 Internal Server Error - not treating as auth error');
        return false; // Don't clear auth
      }
      
      return true; // Treat as auth error
    };

    // Get message notification data for new chat indicators
    const { totalUnreadCount, uniqueChatMessages, markAllSocketMessagesAsRead } = useMessageNotifications();
    
    // Helper function to check if a chat is new/unread
    const getChatNotificationStatus = (chatId) => {
      // Check if this chat has unread messages from notifications
      const chatNotifications = uniqueChatMessages.filter(msg => 
        msg.chatId === chatId && (msg.isUnRead || (!msg.read && !msg.isSocket))
      );
      
      const hasUnreadNotifications = chatNotifications.length > 0;
      const unreadCount = chatNotifications.length;
      
      // Consider a chat "new" if it was created in the last 24 hours and has unread messages
      const chat = chats.find(c => c._id === chatId);
      const isNewChat = chat ? 
        (new Date().getTime() - new Date(chat.createdAt).getTime()) < 24 * 60 * 60 * 1000 && hasUnreadNotifications
        : false;
      
      return {
        isNew: isNewChat,
        hasUnread: hasUnreadNotifications,
        unreadCount: unreadCount
      };
    };

    // Function to handle chat opening and mark notifications as read
    const handleChatClick = async (chat) => {
      try {
        // Validate chat data before proceeding
        if (!chat || !chat._id || !chat.users || !chat.users[1]) {
          console.error("❌ Invalid chat data:", chat);
          return;
        }

        // Check if user is still authenticated
        if (!auth?.user?._id) {
          console.error("❌ User not authenticated, cannot open chat");
          return;
        }

        console.log(`🔄 Opening chat for chatId: ${chat._id}`);
        
        // Set the chat as active first (this is the main action)
        setUserChat(chat.users[1]);
        setIdChat(chat._id);
        
        // Handle responsive behavior
        if (isMobile) {
          setSidebarOpen(false);
          setShowChat(true);
        }
        
        // Try to mark notifications as read (this is secondary and completely optional)
        try {
          if (chat._id && !shouldBlockApiCall()) {
            // Mark all notifications as read instead of trying to mark by chat ID
            await NotificationService.markAllAsRead();
            markAllSocketMessagesAsRead(); // Also mark socket messages as read
            console.log(`✅ All notifications marked as read`);
          } else if (shouldBlockApiCall()) {
            console.warn("⚠️ Skipping notification marking due to circuit breaker");
          }
        } catch (notificationError) {
          console.warn("⚠️ Failed to mark notifications as read (non-critical):", notificationError);
          // Don't prevent chat opening if notification marking fails
          // Don't count this as an API error since it's optional
        }
        
        console.log(`✅ Chat opened successfully for chatId: ${chat._id}`);
      } catch (error) {
        console.error("❌ Error opening chat:", error);
        
        // If it's an authentication error, don't try to open the chat
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.error("❌ Authentication error, cannot open chat");
          return;
        }
        
        // For other errors, still try to open the chat
        if (chat && chat.users && chat.users[1]) {
          setUserChat(chat.users[1]);
          setIdChat(chat._id);
          
          if (isMobile) {
            setSidebarOpen(false);
            setShowChat(true);
          }
        }
      }
    };

    // Handle sidebar toggle for mobile
    const handleSidebarToggle = () => {
      setSidebarOpen(!sidebarOpen);
    };

    // Handle back to chat list on mobile
    const handleBackToChats = () => {
      setShowChat(false);
      setSidebarOpen(true);
    };

    useEffect(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, [messages, MessagesSocket, idChat]);

    // Detect scroll position to show/hide scroll to bottom button
    useEffect(() => {
      const handleScroll = () => {
        if (!chatContentRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = chatContentRef.current;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        
        setShowScrollButton(isScrolledUp);
      };

      const chatContent = chatContentRef.current;
      if (chatContent) {
        chatContent.addEventListener('scroll', handleScroll);
      }

      return () => {
        if (chatContent) {
          chatContent.removeEventListener('scroll', handleScroll);
        }
      };
    }, [idChat]);

    useEffect(() => {
      if (search === '') {
        setFilteredChats(chats);
        return;
      }
      
      const newAr = chats.filter((e) => 
        e.users[1].firstName.trim().toLowerCase().includes(search.trim().toLowerCase()) ||
        e.users[1].lastName.trim().toLowerCase().includes(search.trim().toLowerCase())
      );
      setFilteredChats(newAr);
    }, [search, chats]);

    const location = useLocation();

    useEffect(() => {
      if (location.state && location.state.chat) {
        setIdChat(location.state.chat._id);
        setUserChat(location.state.chat.users[1]);
      }
    }, [location]);

    useEffect(() => {
      if (MessagesSocket.length === 0) return;
      SetSocketMessages([]);
    }, [idChat]);

    useEffect(() => {
      if (!auth.user) return;
      getAllChats();
    }, [auth.user]);

    const getAllChats = async () => {
      // Check if user is authenticated before making API call
      if (!auth?.user?._id) {
        console.error("❌ User not authenticated, cannot fetch chats");
        setLoading(false);
        return;
      }

      // Check circuit breaker
      if (shouldBlockApiCall()) {
        console.warn("🚨 API calls blocked due to too many errors");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log("🔄 Fetching chats for user:", auth.user._id);
      
      try {
        const res = await ChatAPI.getChats({ id: auth.user._id, from: 'seller' });
        console.log("✅ Chats fetched successfully:", res);
        setChats(res);
        setFilteredChats(res);
        
        // Reset error count on success
        setApiErrorCount(0);
        setLastApiError(null);
      } catch (error) {
        const shouldClearAuth = handleApiError(error);
        
        // If it's an authentication error, don't clear existing chats
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.error("❌ Authentication error while fetching chats");
          // Keep existing chats but show error
        } else if (error?.response?.status === 500) {
          console.error("❌ Internal server error while fetching chats - not clearing auth");
          // Don't clear auth for 500 errors
        } else {
          // For other errors, you might want to show a retry option
          console.error("❌ Failed to fetch chats, please try again");
        }
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      if (idChat === '') return;
      getAllMessage();
    }, [idChat, reget]);

    const getAllMessage = async () => {
      // Check if user is authenticated and we have a valid chat ID
      if (!auth?.user?._id) {
        console.error("❌ User not authenticated, cannot fetch messages");
        setLoading(false);
        return;
      }

      if (!idChat) {
        console.error("❌ No chat ID provided, cannot fetch messages");
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log(`🔄 Fetching messages for chatId: ${idChat}`);
      
      try {
        const res = await MessageAPI.getByConversation(idChat);
        console.log(`✅ Messages fetched successfully for chatId: ${idChat}`, res);
        setMessages(res);
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
        
        // If it's an authentication error, don't clear existing messages
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.error("❌ Authentication error while fetching messages");
          // Keep existing messages but show error
        } else {
          // For other errors, you might want to show a retry option
          console.error("❌ Failed to fetch messages, please try again");
        }
      } finally {
        setLoading(false);
      }
    };
    
    const createMessage = async () => {
      if (!text.trim()) return;
      
      // Check if user is still authenticated
      if (!auth?.user?._id) {
        console.error("❌ User not authenticated, cannot send message");
        return;
      }

      // Check if we have a valid chat
      if (!idChat || !userChat?._id) {
        console.error("❌ No valid chat selected, cannot send message");
        return;
      }

      // Check circuit breaker
      if (shouldBlockApiCall()) {
        console.warn("🚨 API calls blocked due to too many errors");
        return;
      }
      
      // Simulate typing indicator
      setIsTyping(true);

      try {
        console.log(`🔄 Sending message to chatId: ${idChat}`);
        
        await MessageAPI.send({
          idChat, 
          message: text, 
          sender: auth.user._id,
          reciver: userChat._id
        });
        
        setText('');
        SetSocketMessages([]);
        setReget(p => !p);
        
        // Reset error count on success
        setApiErrorCount(0);
        setLastApiError(null);
        
        console.log(`✅ Message sent successfully to chatId: ${idChat}`);
      } catch (error) {
        const shouldClearAuth = handleApiError(error);
        
        // If it's an authentication error, don't clear the message
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          console.error("❌ Authentication error, message not sent");
          // Optionally show a user-friendly message
        } else if (error?.response?.status === 500) {
          console.error("❌ Internal server error while sending message - not clearing auth");
          // Don't clear auth for 500 errors
        } else {
          // For other errors, you might want to show a retry option
          console.error("❌ Failed to send message, please try again");
        }
      } finally {
        setIsTyping(false);
      }
    };

    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        createMessage();
      }
    };

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatMessageDate = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear();
      
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() &&
                          date.getMonth() === yesterday.getMonth() &&
                          date.getFullYear() === yesterday.getFullYear();
      
      if (isYesterday) {
        return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }

      return date.toLocaleDateString([], { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    // Group messages by date for better UI organization
    const groupMessagesByDate = (messages) => {
      if (!messages || messages.length === 0) return [];

      let currentSender = null;
      let currentGroup = [];
      const groupedMessages = [];

      messages.forEach((message, index) => {
        // Start a new group when sender changes
        if (currentSender !== message.sender) {
          if (currentGroup.length > 0) {
            groupedMessages.push([...currentGroup]);
          }
          currentGroup = [message];
          currentSender = message.sender;
        } else {
          // Add to current group if same sender
          currentGroup.push(message);
        }

        // Push the last group
        if (index === messages.length - 1 && currentGroup.length > 0) {
          groupedMessages.push([...currentGroup]);
        }
      });

      return groupedMessages;
    };

    const statusIndicator = (status: 'online' | 'offline' | 'away' = 'online') => {
      const colors = {
        online: theme.palette.success.main,
        offline: theme.palette.grey[400],
        away: theme.palette.warning.main
      };
      
      return (
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: colors[status],
            border: `2px solid ${theme.palette.background.paper}`,
            position: 'absolute',
            bottom: 2,
            right: 2
          }}
        />
      );
    };

    // Deduplicate MessagesSocket by _id whenever it changes
    useEffect(() => {
      if (!MessagesSocket || MessagesSocket.length === 0) return;
      const uniqueMessages = deduplicateMessagesById(MessagesSocket);
      if (uniqueMessages.length !== MessagesSocket.length) {
        SetSocketMessages(uniqueMessages);
      }
    }, [MessagesSocket, SetSocketMessages]);

    // Safety check: Don't render if user is not authenticated
    if (!auth?.user?._id) {
      console.error("❌ User not authenticated, cannot render chat component");
      return (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography variant="h6" color="error">
            Authentication required. Please log in again.
          </Typography>
        </Box>
      );
    }

    return (
      <ChatLayout>
        {/* Mobile Header */}
        <MobileHeader>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={handleSidebarToggle} size="small">
              <MenuRounded />
            </IconButton>
            <Typography variant="h6" fontWeight={600}>
              {t('chat.title')}
            </Typography>
            {totalUnreadCount > 0 && (
              <Badge 
                badgeContent={totalUnreadCount} 
                color="error" 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    fontSize: '0.75rem',
                    minWidth: '18px',
                    height: '18px'
                  } 
                }}
              >
                <Box />
              </Badge>
            )}
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title={t('chat.refresh')}>
              <IconButton size="small" onClick={() => getAllChats()}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('chat.newChat')}>
              <IconButton size="small">
                <Badge color="error" variant="dot">
                  <MoreVertRounded fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </MobileHeader>

        {/* Sidebar Overlay for Mobile */}
        <SidebarOverlay 
          className={sidebarOpen ? 'open' : ''} 
          onClick={() => setSidebarOpen(false)}
        />

        <Sidebar className={sidebarOpen ? 'open' : ''}>
          <SidebarHeader>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={600}>
                {t('chat.title')} 
              </Typography>
              {totalUnreadCount > 0 && (
                <Badge 
                  badgeContent={totalUnreadCount} 
                  color="error" 
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      fontSize: '0.75rem',
                      minWidth: '18px',
                      height: '18px'
                    } 
                  }}
                >
                  <Box />
                </Badge>
              )}
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title={t('chat.refresh')}>
                <IconButton size="small" onClick={() => getAllChats()}>
                  <RefreshRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('chat.newChat')}>
                <IconButton size="small">
                  <Badge color="error" variant="dot">
                    <MoreVertRounded fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
              {isMobile && (
                <IconButton size="small" onClick={() => setSidebarOpen(false)}>
                  <CloseRounded fontSize="small" />
                </IconButton>
              )}
            </Box>
          </SidebarHeader>
          
          <SearchContainer>
            <TextField
              fullWidth
              placeholder={t('chat.searchConversations')}
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 5,
                  backgroundColor: theme.palette.background.default,
                  '& fieldset': {
                    borderWidth: '1px !important',
                    borderColor: `${theme.palette.divider} !important`,
                  },
                  '&:hover fieldset': {
                    borderColor: `${theme.palette.divider} !important`,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: `${theme.palette.primary.main} !important`,
                  },
                }
              }}
            />
          </SearchContainer>
          
          <ContactsContainer>
            {loading && filteredChats.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={30} />
              </Box>
            ) : filteredChats.length > 0 ? (
              <AnimatePresence>
                {filteredChats.map((chat, index) => {
                  const notificationStatus = getChatNotificationStatus(chat._id);
                  
                  return (
                    <motion.div 
                      key={chat._id} 
                      variants={contactItemVariants} 
                      initial="initial" 
                      animate="animate" 
                      transition={{ delay: index * 0.05 }}
                    >
                      <ModernContactItem 
                        active={idChat === chat._id}
                        isNew={notificationStatus.isNew}
                        hasUnread={notificationStatus.hasUnread}
                        onClick={() => handleChatClick(chat)}
                        whileTap={{ scale: 0.98 }}
                        sx={
                          !notificationStatus.isNew && !notificationStatus.hasUnread
                            ? {
                                background: 'transparent',
                                border: 'none',
                                boxShadow: 'none',
                                fontWeight: 400,
                                color: 'inherit',
                              }
                            : {}
                        }
                      >
                        <Box position="relative">
                          <Avatar 
                            src={imageBuyer} 
                            alt={`${chat.users[1].firstName} ${chat.users[1].lastName}`}
                            sx={{ 
                              width: 48, 
                              height: 48,
                              border: idChat === chat._id ? `3px solid ${theme.palette.primary.main}` : 
                                      notificationStatus.isNew ? `3px solid ${theme.palette.primary.main}` :
                                      notificationStatus.hasUnread ? `2px solid ${theme.palette.primary.main}` : 'none',
                              boxShadow: notificationStatus.isNew ? `0 0 12px ${alpha(theme.palette.primary.main, 0.4)}` : 'none',
                            }}
                          />
                          {statusIndicator(index % 3 === 0 ? 'online' : (index % 3 === 1 ? 'away' : 'offline'))}
                          {/* New chat indicator */}
                          {notificationStatus.isNew && <NewChatIndicator />}
                        </Box>
                        <ContactInfo>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography 
                              variant="subtitle2" 
                              fontWeight={
                                idChat === chat._id ? 700 : 
                                notificationStatus.hasUnread ? 600 : 400
                              } 
                              noWrap
                              sx={{
                                color: notificationStatus.isNew ? theme.palette.primary.main : 
                                       notificationStatus.hasUnread ? theme.palette.primary.main : 'inherit',
                                fontWeight: !notificationStatus.isNew && !notificationStatus.hasUnread ? 400 : undefined
                              }}
                            >
                              {chat.users[1].firstName} {chat.users[1].lastName}
                              {notificationStatus.isNew && (
                                <Chip 
                                  label={t('chat.new')} 
                                  size="small" 
                                  sx={{ 
                                    ml: 1, 
                                    fontSize: '0.6rem', 
                                    height: '16px',
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }} 
                                />
                              )}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <Typography variant="caption" color="text.secondary">
                                {formatTime(chat.createdAt)}
                              </Typography>
                              {notificationStatus.hasUnread && notificationStatus.unreadCount > 0 && (
                                <UnreadBadge badgeContent={notificationStatus.unreadCount > 0 ? notificationStatus.unreadCount : null} color="error" />
                              )}
                            </Box>
                          </Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            noWrap 
                            sx={{ 
                              opacity: notificationStatus.hasUnread ? 1 : 0.8,
                              fontWeight: notificationStatus.hasUnread ? 500 : 400,
                            }}
                          >
                            {notificationStatus.isNew ? t('chat.newConversationStarted') : 
                             notificationStatus.hasUnread ? t('chat.unreadMessages', { count: notificationStatus.unreadCount }) :
                             t('chat.noNewMessages')}
                          </Typography>
                        </ContactInfo>
                        {/* Modern unread indicator */}
                        {notificationStatus.hasUnread && (
                          <Box
                            sx={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: notificationStatus.isNew ? theme.palette.primary.main : theme.palette.primary.main,
                              boxShadow: notificationStatus.isNew ? `0 0 8px ${alpha(theme.palette.primary.main, 0.6)}` : 
                                         `0 0 6px ${alpha(theme.palette.primary.main, 0.6)}`,
                              animation: 'pulse 2s infinite',
                            }}
                          />
                        )}
                      </ModernContactItem>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            ) : (
              <EmptyChatState>
                <Typography variant="body1">{t('chat.noChatsFound')}</Typography>
              </EmptyChatState>
            )}
          </ContactsContainer>
        </Sidebar>
        
        {/* Chat Main Area - Show conditionally on mobile */}
        <ChatMain sx={{ display: { xs: showChat ? 'flex' : 'none', md: 'flex' } }}>
          <ChatHeader>
            <Box display="flex" alignItems="center" gap={1}>
              {isMobile && (
                <IconButton onClick={handleBackToChats} size="small" sx={{ mr: 1 }}>
                  <KeyboardBackspaceRounded />
                </IconButton>
              )}
              <Avatar 
                src={imageBuyer} 
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {userChat?.firstName} {userChat?.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userChat?.status === 'online' ? 'Online now' : 'Last seen recently'}
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title={t('chat.moreOptions')}>
                <IconButton size="small">
                  <MoreVertRounded fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ChatHeader>
          <ChatContent ref={chatContentRef}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress size={30} />
              </Box>
            ) : messages.length > 0 ? (
              <div>
                {groupMessagesByDate(messages).map((group, index) => (
                  <MessageGroup key={index}>
                    {group.map((message, msgIndex) => (
                      <MessageBubbleContainer 
                        key={message._id} 
                        sender={message.sender === auth.user._id}
                        variants={MessageBubbleVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: msgIndex * 0.05 }}
                      >
                        <MessageBubble sender={message.sender === auth.user._id}>
                          <Typography variant="body2" sx={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                            {message.message}
                          </Typography>
                        </MessageBubble>
                        <MessageTime>{formatTime(message.createdAt)}</MessageTime>
                      </MessageBubbleContainer>
                    ))}
                  </MessageGroup>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <MessageBubbleContainer sender={false}>
                    <MessageBubble sender={false}>
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 0.5, 
                        alignItems: 'center',
                        padding: '4px',
                        minWidth: '40px'
                      }}>
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                            transition: { repeat: Infinity, duration: 0.5, repeatDelay: 0.2 }
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                        </motion.div>
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                            transition: { repeat: Infinity, duration: 0.5, delay: 0.2, repeatDelay: 0.2 }
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                        </motion.div>
                        <motion.div
                          animate={{
                            y: [0, -5, 0],
                            transition: { repeat: Infinity, duration: 0.5, delay: 0.4, repeatDelay: 0.2 }
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                        </motion.div>
                      </Box>
                    </MessageBubble>
                  </MessageBubbleContainer>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <EmptyChatState>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChatRounded sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {t('chat.noMessagesYet')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
                    Start the conversation by sending a message below
                  </Typography>
                </motion.div>
              </EmptyChatState>
            )}
          </ChatContent>
          <ChatInputContainer>
            <ChatInputWrapper>
              <Tooltip title={t('chat.attachFile')}>
                <IconButton size="small" color="primary">
                  <AttachFileRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <TextField
                fullWidth
                placeholder={t('chat.typeMessage')}
                size="small"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                multiline
                maxRows={3}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: '0.9rem',
                    '& fieldset': {
                      border: 'none',
                    },
                  }
                }}
              />
              
              <Tooltip title={t('chat.addEmoji')}>
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  <InsertEmoticonRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title={t('chat.voiceMessage')}>
                <IconButton size="small" color="primary">
                  <MicRounded fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <IconButton 
                color="primary" 
                disabled={!text.trim()}
                onClick={createMessage}
                sx={{ 
                  backgroundColor: text.trim() ? theme.palette.primary.main : alpha(theme.palette.action.disabled, 0.1),
                  color: text.trim() ? theme.palette.primary.contrastText : theme.palette.action.disabled,
                  '&:hover': {
                    backgroundColor: text.trim() ? theme.palette.primary.dark : alpha(theme.palette.action.disabled, 0.1),
                  },
                  transition: 'all 0.2s ease',
                  padding: '8px'
                }}
              >
                <SendRounded fontSize="small" />
              </IconButton>
            </ChatInputWrapper>
          </ChatInputContainer>
        </ChatMain>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton>
          <Tooltip title={t('chat.openChats')}>
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                width: 56,
                height: 56,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ChatRounded />
            </IconButton>
          </Tooltip>
        </FloatingActionButton>
      </ChatLayout>
    );
}