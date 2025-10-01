import {io , Socket } from 'socket.io-client';
import { createContext, useEffect, useState, useCallback, useContext, useMemo, useRef } from 'react';

import { INotification } from '@/types/Notification';
import useAuth from '@/hooks/useAuth';
import app from '@/config';

interface ISocketContext {
  socket: Socket | undefined;
  onlineUsers: any[];
  messages: any[];
  unread: number;
  setUnread: (count: number) => void;
  notificationSocket: INotification[];
  setNotificationSocket: (notifications: INotification[]) => void;
  relode: boolean;
  setRelode: React.Dispatch<React.SetStateAction<boolean>>;
  reget: string;
  setRegetNoti: (value: string) => void;
  setMessages: (messages: any[]) => void;
}

const CreateSocket = createContext<ISocketContext | null>(null);

export function useCreateSocket() {
    const context = useContext(CreateSocket);
    if (!context) {
        throw new Error('useCreateSocket must be used within a SocketProvider');
    }
    return context;
}

export function useSocket() {
    const context = useContext(CreateSocket);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket>();
  const { auth } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const [reget, setRegetNoti] = useState('cool');
  const [relode, setRelode] = useState(false);
  const [notificationSocket, setNotificationSocket] = useState<INotification[]>([]);
  
  // Refs to track connection state and prevent duplicate connections
  const socketRef = useRef<Socket | null>(null);
  const isConnecting = useRef(false);
  const eventListenersSet = useRef(false);
  
  console.log('🔌 SocketContext: Auth state:', { user: auth.user?._id, isLogged: !!auth.user });

  // Optimized socket connection with deduplication
  useEffect(() => {
    if (!auth.user?._id) {
      console.log('🔌 SocketContext: No user, skipping connection');
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current?.connected || isConnecting.current) {
      console.log('🔌 SocketContext: Socket already connected or connecting, skipping');
      return;
    }

    isConnecting.current = true;
    console.log('🔌 SocketContext: Creating new socket connection for user:', auth.user._id);

    const newSocket: Socket = io(app.socket, {
      query: { userId: auth.user._id },
      transports: ['websocket', 'polling'], // Prefer WebSocket, fallback to polling
      timeout: 20000, // 20 second timeout
      reconnection: true,
      reconnectionAttempts: 10, // Fixed property name
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000, // Max delay between attempts
      forceNew: true, // Force new connection
    });

    newSocket.on('connect', () => {
      console.log('✅ SocketContext: Connected to backend! Socket ID:', newSocket.id);
      isConnecting.current = false;
      socketRef.current = newSocket;
      setSocket(newSocket);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ SocketContext: Disconnected from backend:', reason);
      isConnecting.current = false;
      socketRef.current = null;
      setSocket(undefined);
      
      // Attempt to reconnect if it wasn't a manual disconnect
      if (reason !== 'io client disconnect' && auth.user?._id) {
        console.log('🔄 SocketContext: Attempting to reconnect...');
        setTimeout(() => {
          isConnecting.current = false; // Reset flag to allow reconnection
        }, 2000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ SocketContext: Connection error:', error);
      isConnecting.current = false;
      
      // Try polling if websocket fails
      const currentTransports = newSocket.io.opts.transports as string[];
      if (currentTransports.includes('websocket')) {
        console.log('🔄 SocketContext: WebSocket failed, trying polling...');
        newSocket.io.opts.transports = ['polling'];
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('✅ SocketContext: Reconnected after', attemptNumber, 'attempts');
      isConnecting.current = false;
      socketRef.current = newSocket;
      setSocket(newSocket);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('❌ SocketContext: Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ SocketContext: Reconnection failed after all attempts');
      isConnecting.current = false;
    });

    // Cleanup function
    return () => {
      console.log('🔌 SocketContext: Cleaning up socket connection');
      isConnecting.current = false;
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [auth.user?._id]);

  // Optimized event listeners setup with deduplication
  useEffect(() => {
    if (!socket || eventListenersSet.current) {
      return;
    }

    console.log('🔌 SocketContext: Setting up event listeners');

    // Online users handler
    const handleOnlineUsers = (users: any[]) => {
      setOnlineUsers(users);
    };

    // Message handlers with deduplication
    const handleSendMessage = (data: any) => {
      console.log('💬 SocketContext: Message received:', data);
      setMessages(prev => {
        // Check for duplicates before adding
        const exists = prev.some(msg => 
          msg._id === data._id || 
          (msg.chatId === data.chatId && msg.message === data.message && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt).getTime()) < 1000)
        );
        return exists ? prev : [...prev, data];
      });
    };

    const handleNewMessage = () => {
      setUnread(prev => prev + 1);
    };

    // Notification handler with deduplication - DISABLED for admin messages to prevent duplicates
    const handleNotification = (data: any) => {
      console.log('🔔 SocketContext: Received notification via socket:', {
        type: data.type,
        title: data.title,
        isMessage: data.type === 'CHAT_CREATED' || data.type === 'MESSAGE_RECEIVED' || data.type === 'conversation' || data.type === 'chat' || data.type === 'message'
      });
      
      // Skip MESSAGE_RECEIVED notifications to prevent duplicate counting
      // These are handled by useAdminMessageNotifications hook
      if (data.type === 'MESSAGE_RECEIVED') {
        console.log('🚫 SocketContext: Skipping MESSAGE_RECEIVED notification to prevent duplicates');
        return;
      }
      
      setNotificationSocket(prev => {
        // Check for duplicates before adding
        const exists = prev.some(notif => 
          (notif as any)._id === data._id || 
          (notif.type === data.type && notif.title === data.title && 
           Math.abs(new Date(notif.createdAt || 0).getTime() - new Date(data.createdAt || 0).getTime()) < 1000)
        );
        return exists ? prev : [...prev, data];
      });
    };

    // Set up event listeners
    socket.on('online-users', handleOnlineUsers);
    socket.on('sendMessage', handleSendMessage);
    socket.on('newMessage', handleNewMessage);
    socket.on('notification', handleNotification);
    
    // Add specific event listeners for buyer-seller communication
    socket.on('buyerToSellerMessage', (data: any) => {
      console.log('💬 SocketContext: Buyer-to-seller message received:', data);
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg._id === data._id || 
          (msg.chatId === data.chatId && msg.message === data.message && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(data.createdAt).getTime()) < 1000)
        );
        return exists ? prev : [...prev, data];
      });
    });
    
    socket.on('messageReceived', (data: any) => {
      console.log('💬 SocketContext: Message received event:', data);
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg._id === data.messageId || 
          (msg.chatId === data.chatId && msg.message === data.message && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(data.timestamp).getTime()) < 1000)
        );
        return exists ? prev : [...prev, {
          _id: data.messageId,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          idChat: data.chatId,
          createdAt: data.timestamp
        }];
      });
    });
    
    socket.on('chatMessageUpdate', (data: any) => {
      console.log('💬 SocketContext: Chat message update:', data);
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg._id === data.messageId || 
          (msg.chatId === data.chatId && msg.message === data.message && 
           Math.abs(new Date(msg.createdAt).getTime() - new Date(data.timestamp).getTime()) < 1000)
        );
        return exists ? prev : [...prev, {
          _id: data.messageId,
          message: data.message,
          sender: data.sender,
          reciver: data.reciver,
          idChat: data.chatId,
          createdAt: data.timestamp
        }];
      });
    });

    eventListenersSet.current = true;

    // Cleanup function
    return () => {
      console.log('🔌 SocketContext: Cleaning up event listeners');
      socket.off('online-users', handleOnlineUsers);
      socket.off('sendMessage', handleSendMessage);
      socket.off('newMessage', handleNewMessage);
      socket.off('notification', handleNotification);
      socket.off('buyerToSellerMessage');
      socket.off('messageReceived');
      socket.off('chatMessageUpdate');
      eventListenersSet.current = false;
    };
  }, [socket]);

  // Reset event listeners flag when socket changes
  useEffect(() => {
    eventListenersSet.current = false;
  }, [socket]);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    relode,
    setRelode,
    setNotificationSocket,
    reget,
    setRegetNoti,
    socket,
    setMessages,
    notificationSocket,
    messages,
    onlineUsers,
    unread,
    setUnread
  }), [
    relode,
    setRelode,
    setNotificationSocket,
    reget,
    setRegetNoti,
    socket,
    setMessages,
    notificationSocket,
    messages,
    onlineUsers,
    unread,
    setUnread
  ]);

  return <CreateSocket.Provider value={contextValue}>{children}</CreateSocket.Provider>;
}