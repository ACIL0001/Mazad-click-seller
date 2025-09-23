import { useEffect, useState, useRef, useMemo } from 'react'
import { MessageAPI } from '@/api/message'
import { useCreateSocket } from '@/contexts/SocketContext'
import auth from '@/_mock/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import useMessageNotifications from '@/hooks/useMessageNotifications'
import { 
  Box, 
  Typography, 
  TextField, 
  Avatar, 
  IconButton, 
  useTheme,
  alpha,
  Tooltip,
  CircularProgress,
  Chip,
  Badge,
  Fab,
  Paper,
  Slide,
  useMediaQuery,
  Fade,
  Stack,
  Divider
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { 
  SendRounded, 
  MoreVertRounded,
  InsertEmoticonRounded,
  AttachFileRounded,
  MicRounded,
  KeyboardArrowDownRounded,
  CheckCircleRounded,
  KeyboardBackspaceRounded,
  CloseRounded,
  ChatRounded,
  RefreshRounded,
  InfoRounded
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import imageBuyer from '../../assets/logo/buyerImage.jpg'

// Message type definition
interface Message {
  _id?: string;
  message: string;
  sender: string;
  reciver: string;
  createdAt?: string | Date;
}

// Message group types
type DateGroup = { type: 'date'; date: string }
type MessageGroup = { type: 'messageGroup'; messages: Message[] }
type GroupedItem = DateGroup | MessageGroup

// Modern responsive styled components
const ChatContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  height: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
  overflow: 'hidden',
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
}))

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.2, 1.5),
    gap: theme.spacing(1),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1, 1.5),
  },
}))

const ChatContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
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
    padding: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}))

const MessageGroup = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
}))

const MessageBubbleContainer = styled(motion.div)<{ sender?: boolean }>(({ theme, sender }) => ({
  display: 'flex',
  justifyContent: sender ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
  position: 'relative',
  alignItems: 'flex-end',
  gap: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(0.8),
  },
}))

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
  wordBreak: 'normal',
  whiteSpace: 'normal',
  textAlign: 'left',
  width: 'fit-content',
  display: 'block',
  boxSizing: 'border-box',
  border: sender ? 'none' : `1px solid ${alpha(theme.palette.divider, 0.5)}`,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '85%',
    padding: theme.spacing(1, 1.5),
  },
}))

const MessageTime = styled(Typography)(({ theme }) => ({
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.3),
  opacity: 0.7,
  alignSelf: 'flex-end',
}))

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
}))

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
}))

const EmptyChatState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
}))

const DateDivider = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}))

// Custom avatar with consistent size
const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 28, // Reduced size for more compact layout
  height: 28, // Reduced size for more compact layout
  border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}))

const scrollToBottomVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 }
}

const MessageBubbleVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } },
}

export default function Chat() {
  const location = useLocation()
  const navigate = useNavigate()
  const { idReciver } = location.state
  
  const [text, setText] = useState('')
  const [reget, setReget] = useState(false)
  const idChat = window.location.href.replace(`${window.location.origin}/dashboard/chat/`, '')
  const socketContext = useCreateSocket()
  const socketMessages = (socketContext?.messages || []) as Message[]
  
  console.log("socketMessages )))) ",socketMessages);
  
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const chatContentRef = useRef<HTMLDivElement | null>(null)
  const theme = useTheme()
  
  // Responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'))
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))
  
  // Enhanced notification system with route awareness
  const { totalUnreadCount: allNewChatCount, uniqueChatMessages } = useMessageNotifications()
  
  // Smart filtering: Only show notifications for OTHER chats (not current one)
  const filteredChatMessages = useMemo(() => {
    return uniqueChatMessages.filter(msg => {
      // Exclude current chat notifications
      const isCurrentChat = msg.chatId === idChat
      // Only include unread messages
      const isUnread = msg.isUnRead
      
      return !isCurrentChat && isUnread
    })
  }, [uniqueChatMessages, idChat])
  
  const newChatCount = filteredChatMessages.length
  
  // Advanced notification context
  const notificationContext = useMemo(() => {
    const groupedByContact = filteredChatMessages.reduce((acc, msg) => {
      const contactName = msg.name || 'Contact inconnu'
      if (!acc[contactName]) {
        acc[contactName] = []
      }
      acc[contactName].push(msg)
      return acc
    }, {} as Record<string, any[]>)
    
    return {
      totalChats: Object.keys(groupedByContact).length,
      totalMessages: filteredChatMessages.length,
      contacts: Object.keys(groupedByContact),
      topContact: Object.keys(groupedByContact)[0] || 'Contact'
    }
  }, [filteredChatMessages])
  
  // State for notification dismissal
  const [notificationDismissed, setNotificationDismissed] = useState(false)
  
  // Reset dismissal when new notifications arrive
  useEffect(() => {
    if (newChatCount > 0) {
      setNotificationDismissed(false)
    }
  }, [newChatCount])
  
  // Auto-dismiss notification after a certain time
  useEffect(() => {
    if (newChatCount > 0 && !notificationDismissed) {
      const timer = setTimeout(() => {
        setNotificationDismissed(true)
      }, 10000) // Auto-dismiss after 10 seconds
      
      return () => clearTimeout(timer)
    }
  }, [newChatCount, notificationDismissed])
  
  // Handle notification click with dismissal
  const handleNotificationClick = () => {
    setNotificationDismissed(true)
    navigate('/dashboard/chat')
  }
  
  // Show notification only if not dismissed and has notifications
  const shouldShowNotification = newChatCount > 0 && !notificationDismissed
  
  // Enhanced debug logging for notification system
  console.log('💬 Chat.tsx Smart Notification System:', {
    currentRoute: location.pathname,
    currentChatId: idChat,
    allNotifications: allNewChatCount,
    filteredForOtherChats: newChatCount,
    notificationContext,
    isDismissed: notificationDismissed,
    shouldShowNotification,
    filteredChatMessages: filteredChatMessages.map(msg => ({
      id: msg._id,
      chatId: msg.chatId,
      name: msg.name,
      isCurrentChat: msg.chatId === idChat
    }))
  })
  
  useEffect(() => {
    getAllMessage()
  }, [reget])
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, socketMessages])
  
  // Detect scroll position to show/hide scroll to bottom button
  useEffect(() => {
    const handleScroll = () => {
      if (!chatContentRef.current) return
      
      const { scrollTop, scrollHeight, clientHeight } = chatContentRef.current
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100
      
      setShowScrollButton(isScrolledUp)
    }

    const chatContent = chatContentRef.current
    if (chatContent) {
      chatContent.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (chatContent) {
        chatContent.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])
  
  const getAllMessage = async () => {
    setLoading(true)
    try {
      const res = await MessageAPI.getByConversation(idChat)
      setMessages(res)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }
  
  const createMessage = async () => {
    if (!text.trim()) return
    
    // Simulate typing indicator
    setIsTyping(true)
    
    try {
      await MessageAPI.send({
        idChat,
        message: text,
        sender: auth.user._id,
        reciver: idReciver
      })
      
      setText('')
      setReget(prev => !prev)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsTyping(false)
    }
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      createMessage()
    }
  }
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.getDate() === now.getDate() && 
                    date.getMonth() === now.getMonth() && 
                    date.getFullYear() === now.getFullYear()
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = date.getDate() === yesterday.getDate() &&
                        date.getMonth() === yesterday.getMonth() &&
                        date.getFullYear() === yesterday.getFullYear()
    
    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    return date.toLocaleDateString([], { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  // Get date string for grouping messages
  const getDateString = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    if (
      date.getDate() === now.getDate() && 
      date.getMonth() === now.getMonth() && 
      date.getFullYear() === now.getFullYear()
    ) {
      return 'Today'
    }
    
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString([], { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }
  
  // Group messages by date and then by sender for better UI organization
  const groupMessages = (messages: Message[]): GroupedItem[] => {
    // Get all _id's from messages (ignore undefined)
    const messageIds = new Set(messages.map(m => m._id).filter(Boolean))

    // Debug logs
    console.log('messages:', messages.map(m => m._id))
    console.log('socketMessages:', socketMessages.map(m => m._id))

    // Filter socketMessages to only include those whose _id is not in messages
    const filteredSocketMessages = socketMessages.filter(
      (sm) => sm._id && !messageIds.has(sm._id)
    )
    console.log('filteredSocketMessages:', filteredSocketMessages.map(m => m._id))

    // Combine messages and filtered socketMessages
    const allMessages = [...messages, ...filteredSocketMessages].sort((a, b) => 
      new Date(a.createdAt || Date.now()).getTime() - new Date(b.createdAt || Date.now()).getTime()
    )
    console.log('allMessages:', allMessages.map(m => m._id))
    
    if (allMessages.length === 0) return []
    
    // First group by date
    const messagesByDate: Record<string, Message[]> = {}
    
    allMessages.forEach(message => {
      const dateString = getDateString(message.createdAt || Date.now())
      
      if (!messagesByDate[dateString]) {
        messagesByDate[dateString] = []
      }
      
      messagesByDate[dateString].push(message)
    })
    
    // Then group consecutive messages by the same sender within each date
    const result: GroupedItem[] = []
    
    Object.entries(messagesByDate).forEach(([date, messages]) => {
      result.push({ type: 'date', date })
      
      let currentGroup: Message[] = []
      let currentSender: string | null = null
      
      messages.forEach((message, index) => {
        if (currentSender !== message.sender) {
          if (currentGroup.length > 0) {
            result.push({ type: 'messageGroup', messages: [...currentGroup] })
          }
          currentGroup = [message]
          currentSender = message.sender
        } else {
          currentGroup.push(message)
        }
        
        // Push the last group
        if (index === messages.length - 1 && currentGroup.length > 0) {
          result.push({ type: 'messageGroup', messages: [...currentGroup] })
        }
      })
    })
    
    return result
  }

  return (
    <ChatContainer>
      <ChatHeader>
        <IconButton 
          edge="start" 
          color="inherit" 
          sx={{ mr: 1 }} 
          onClick={() => window.history.back()}
        >
          <KeyboardBackspaceRounded fontSize="small" />
        </IconButton>
        
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          color="success"
        >
          <Avatar 
            src={imageBuyer} 
            sx={{ width: 40, height: 40 }}
          />
        </Badge>
        
        <Box flexGrow={1} sx={{ ml: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            Direct Message
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Online now 
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={() => getAllMessage()}>
              <RefreshRounded fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="More options">
            <IconButton size="small">
              <MoreVertRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </ChatHeader>
     
      <ChatContent ref={chatContentRef}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <CircularProgress size={30} />
          </Box>
        ) : groupMessages(messages).length > 0 ? (
          <>
            {groupMessages(messages).map((item, index) => {
              if (item.type === 'date') {
                return (
                  <DateDivider key={`date-${index}`}>
                    <Chip 
                      label={item.date} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }} 
                    />
                  </DateDivider>
                )
              } else if (item.type === 'messageGroup') {
                const isCurrentUser = item.messages[0].sender === auth.user._id
                
                return (
                  <MessageGroup key={`group-${index}`}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'row',
                        mb: 0.5, // Reduced margin
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {!isCurrentUser && (
                        <UserAvatar
                          src={imageBuyer} 
                          alt="Contact"
                        />
                      )}
                      
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        fontWeight={500}
                      >
                        {isCurrentUser ? 'You' : 'Contact'}
                      </Typography>
                    </Box>
                    
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        pl: !isCurrentUser ? 5 : 0, // Adjusted for avatar alignment
                        pr: isCurrentUser ? 5 : 0, // Adjusted for avatar alignment
                        width: 'auto'
                      }}
                    >
                      {item.messages.map((message, msgIndex) => (
                        <MessageBubbleContainer 
                          key={message._id || `msg-${index}-${msgIndex}`}
                          sender={isCurrentUser}
                          variants={MessageBubbleVariants}
                          initial="initial"
                          animate="animate"
                          transition={{ delay: msgIndex * 0.05 }}
                        >
                          <MessageBubble sender={isCurrentUser}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                fontSize: '0.9rem',
                                lineHeight: 1.4,
                                whiteSpace: 'normal',
                                letterSpacing: 'normal',
                                textAlign: 'left',
                                display: 'block',
                                width: 'fit-content',
                                wordSpacing: 'normal'
                              }}
                            >
                              {message.message}
                            </Typography>
                          </MessageBubble>
                          
                          {/* Only show time for the last message in group */}
                          {msgIndex === item.messages.length - 1 && (
                            <MessageTime>
                              {formatMessageDate(message.createdAt || new Date())}
                              {isCurrentUser && (
                                <CheckCircleRounded sx={{ 
                                  ml: 0.5, 
                                  fontSize: 12,
                                  verticalAlign: 'middle',
                                  color: theme.palette.success.main
                                }} />
                              )}
                            </MessageTime>
                          )}
                        </MessageBubbleContainer>
                      ))}
                    </Box>
                  </MessageGroup>
                )
              }
              
              return null
            })}
            
            {isTyping && (
              <MessageBubbleContainer>
                <UserAvatar
                  src={imageBuyer} 
                  alt="Contact"
                />
                <MessageBubble>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    padding: '4px',
                    minWidth: '40px',
                    width: 'fit-content'
                  }}>
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        transition: { repeat: Infinity, duration: 0.5, repeatDelay: 0.2 }
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                    </motion.div>
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        transition: { repeat: Infinity, duration: 0.5, delay: 0.2, repeatDelay: 0.2 }
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                    </motion.div>
                    <motion.div
                      animate={{
                        y: [0, -5, 0],
                        transition: { repeat: Infinity, duration: 0.5, delay: 0.4, repeatDelay: 0.2 }
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                    </motion.div>
                  </Box>
                </MessageBubble>
              </MessageBubbleContainer>
            )}
            
            <div ref={messagesEndRef} />
          </>
        ) : (
          <EmptyChatState>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h6" gutterBottom fontWeight={600}>
                No messages yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto' }}>
                Start the conversation by sending a message below
              </Typography>
            </motion.div>
          </EmptyChatState>
        )}
        
        <AnimatePresence>
          {showScrollButton && (
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={scrollToBottomVariants}
              style={{
                position: 'absolute',
                bottom: 80,
                right: 20,
                zIndex: 10
              }}
            >
              <Tooltip title="Scroll to bottom">
                <IconButton 
                  color="primary" 
                  onClick={scrollToBottom}
                  sx={{ 
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      backgroundColor: theme.palette.background.paper,
                    }
                  }}
                >
                  <KeyboardArrowDownRounded />
                </IconButton>
              </Tooltip>
            </motion.div>
          )}
        </AnimatePresence>
      </ChatContent>
      
      <ChatInputContainer>
        <ChatInputWrapper>
          <Tooltip title="Attach file">
            <IconButton color="primary" size="small">
              <AttachFileRounded sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
          
          <TextField
            fullWidth
            multiline
            maxRows={3} 
            placeholder="Type a message..."
            variant="standard"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyPress}
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
          
          <Tooltip title="Add emoji">
            <IconButton 
              color="primary" 
              size="small"
              onClick={() => setShowEmoji(!showEmoji)}
            >
              <InsertEmoticonRounded sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Voice message">
            <IconButton color="primary" size="small">
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
              padding: '8px',
              minWidth: '40px',
              height: '40px'
            }}
          >
            <SendRounded sx={{ fontSize: '1rem' }} />
          </IconButton>
        </ChatInputWrapper>
      </ChatInputContainer>
      
      {/* Smart Chat Notifications Indicator - Only shows for OTHER chats, not current one */}
      {shouldShowNotification && (
        <Slide direction="up" in={true} mountOnEnter unmountOnExit>
          <Paper
            sx={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
              border: '2px solid #FF6B6B',
              borderRadius: 4,
              p: 2.5,
              minWidth: 300,
              maxWidth: 380,
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 12px 40px rgba(255, 107, 107, 0.35)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                transform: 'translateY(-3px) scale(1.02)',
                boxShadow: '0 16px 48px rgba(255, 107, 107, 0.45)',
                background: 'linear-gradient(135deg, #FF5252 0%, #FF7A7A 100%)',
              }
            }}
            onClick={handleNotificationClick}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box sx={{
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '50%',
                p: 1.2,
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
              }}>
                <Typography variant="h5">💬</Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {notificationContext.totalMessages === 1 ? 'Nouveau Message!' : `${notificationContext.totalMessages} Nouveaux Messages!`}
                </Typography>
                <Typography variant="caption" sx={{ 
                  opacity: 0.9,
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  {notificationContext.totalChats === 1 
                    ? `De ${notificationContext.topContact}`
                    : `De ${notificationContext.totalChats} contacts différents`
                  }
                </Typography>
              </Box>
              
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge 
                badgeContent={newChatCount} 
                color="secondary" 
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#fff',
                    color: '#FF6B6B',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    minWidth: '22px',
                    height: '22px',
                    border: '2px solid rgba(255,255,255,0.3)'
                  }
                }}
              >
                <Box />
              </Badge>
              
              <IconButton
                size="small"
                sx={{ 
                  color: 'rgba(255,255,255,0.8)',
                  p: 0.5,
                  '&:hover': {
                    color: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setNotificationDismissed(true)
                }}
              >
                <CloseRounded fontSize="small" />
              </IconButton>
            </Box>
            </Box>
            
            <Box sx={{ 
              borderTop: '1px solid rgba(255,255,255,0.2)',
              pt: 1.5,
              mt: 1.5
            }}>
              <Typography variant="body2" sx={{ 
                opacity: 0.95,
                lineHeight: 1.5,
                fontSize: '0.85rem'
              }}>
                {notificationContext.totalMessages === 1 
                  ? 'Un nouveau message vous attend'
                  : `${notificationContext.totalMessages} nouveaux messages vous attendent`
                }
              </Typography>
              
              <Typography variant="caption" sx={{ 
                opacity: 0.8,
                fontStyle: 'italic',
                fontSize: '0.7rem',
                display: 'block',
                mt: 0.5
              }}>
                Cliquez pour voir toutes les conversations →
              </Typography>
            </Box>
          </Paper>
        </Slide>
      )}
    </ChatContainer>
  )
}