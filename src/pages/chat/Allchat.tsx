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
  Chip
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
  CheckCircleRounded
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import imageBuyer from '../../assets/logo/buyerImage.jpg';
import { NotificationService } from "@/api/notificationService"

// Styled components with modern design
const ChatLayout = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: 'calc(85vh - 50px)',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
}));

const Sidebar = styled(Box)(({ theme }) => ({
  width: '320px',
  borderRight: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1),
}));

const ContactsContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '10px',
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
  '&:hover': {
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.5),
  },
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflow: 'hidden',
}));

const ChatMain = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  position: 'relative',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
}));

const ChatContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  '&::-webkit-scrollbar': {
    width: '4px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.divider,
    borderRadius: '10px',
  },
}));

const MessageGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const MessageBubbleContainer = styled(motion.div)<{ sender?: boolean }>(({ theme, sender }) => ({
  display: 'flex',
  justifyContent: sender ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(0.5),
  position: 'relative',
}));

const MessageBubble = styled(Box)<{ sender?: boolean }>(({ theme, sender }) => ({
  maxWidth: '75%',
  minWidth: 'min-content',
  padding: theme.spacing(1.5, 2),
  borderRadius: '50px', // Make it more circular
  backgroundColor: sender 
    ? theme.palette.primary.main 
    : theme.palette.background.paper,
  color: sender 
    ? theme.palette.primary.contrastText 
    : theme.palette.text.primary,
  boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
  position: 'relative',
  display: 'block',
  textAlign: 'left',
  width: 'fit-content',
  wordBreak: 'normal',
  whiteSpace: 'normal',
  boxSizing: 'border-box',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '10px',
    height: '10px',
    transform: 'rotate(45deg)',
    top: '14px',
    [sender ? 'right' : 'left']: -5,
    backgroundColor: sender ? theme.palette.primary.main : theme.palette.background.paper,
    zIndex: -1,
  },
}));

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  opacity: 0.7,
}));

const ChatInputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  position: 'relative',
}));

const ChatInputWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: theme.shape.borderRadius * 5,
  boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
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

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const chatContentRef = useRef<HTMLDivElement | null>(null);
    const theme = useTheme();

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
        // Mark all notifications for this chat as read
        if (chat._id) {
          await NotificationService.markAsRead(chat._id);
          markAllSocketMessagesAsRead(); // Also mark socket messages as read
        }
        
        // Set the chat as active
        setUserChat(chat.users[1]);
        setIdChat(chat._id);
        
        console.log(`✅ Opened chat and marked notifications as read for chatId: ${chat._id}`);
      } catch (error) {
        console.error("❌ Error marking chat notifications as read:", error);
        // Still open the chat even if marking as read fails
        setUserChat(chat.users[1]);
        setIdChat(chat._id);
      }
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
      setLoading(true);
      console.log("CHATS",auth.user._id);
      try {
        const res = await ChatAPI.getChats({ id: auth.user._id, from: 'seller' });
        console.log("CHATS",res);
        setChats(res);
        setFilteredChats(res);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    useEffect(() => {
      if (idChat === '') return;
      getAllMessage();
    }, [idChat, reget]);

    const getAllMessage = async () => {
      setLoading(true);
      try {
        const res = await MessageAPI.getByConversation(idChat);
        setMessages(res);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const createMessage = async () => {
      if (!text.trim()) return;
      
      // Simulate typing indicator
      setIsTyping(true);

      try {
        await MessageAPI.send({
          idChat, 
          message: text, 
          sender: auth.user._id,
          reciver: userChat._id
        });
        
        setText('');
        SetSocketMessages([]);
        setReget(p => !p);
      } catch (error) {
        console.error("Error sending message:", error);
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

    return (
      <ChatLayout>
        <Sidebar>
          <SidebarHeader>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={600}>
                {t('chat.title')} 
              </Typography>
              {/* {totalUnreadCount > 0 && (
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
              )} */}
            </Box>
            <Box display="flex" gap={1}>
              <Tooltip title={t('chat.newChat')}>
                <IconButton size="small">
                  <Badge color="error" variant="dot">
                    <MoreVertRounded fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
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
        <ChatMain>
          <ChatHeader>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={600}>
                {userChat?.firstName} {userChat?.lastName}
              </Typography>
              {statusIndicator(userChat?.status)}
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
            {messages.length > 0 ? (
              <div>
                {groupMessagesByDate(messages).map((group, index) => (
                  <MessageGroup key={index}>
                    {group.map((message, msgIndex) => (
                      <MessageBubbleContainer key={message._id} sender={message.sender === auth.user._id}>
                        <MessageBubble>
                          {message.message}
                        </MessageBubble>
                        <MessageTime>{formatTime(message.createdAt)}</MessageTime>
                      </MessageBubbleContainer>
                    ))}
                  </MessageGroup>
                ))}
              </div>
            ) : (
              <EmptyChatState>
                <Typography variant="body1">{t('chat.noMessagesYet')}</Typography>
              </EmptyChatState>
            )}
          </ChatContent>
          <ChatInputContainer>
            <ChatInputWrapper>
              <TextField
                fullWidth
                placeholder={t('chat.typeMessage')}
                size="small"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <>
                      <IconButton size="small" title={t('chat.addEmoji')}>
                        <InsertEmoticonRounded fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title={t('chat.attachFile')}>
                        <AttachFileRounded fontSize="small" />
                      </IconButton>
                      <IconButton size="small" title={t('chat.voiceMessage')}>
                        <MicRounded fontSize="small" />
                      </IconButton>
                    </>
                  ),
                  sx: {
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
            </ChatInputWrapper>
          </ChatInputContainer>
        </ChatMain>
      </ChatLayout>
    );
}