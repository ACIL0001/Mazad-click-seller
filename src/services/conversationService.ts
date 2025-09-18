import axios from 'axios';
import { API_BASE_URL } from '../config';
import Conversation from '../types/Conversation';
import Message from '../types/Message';

const API_URL = `${API_BASE_URL}`;

export const conversationService = {
  // Get all conversations
  getConversations: async (): Promise<Conversation[]> => {
    const response = await axios.get(`${API_URL}/conversation`);
    return response.data;
  },

  // Get conversation by id
  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await axios.get(`${API_URL}/conversation/${id}`);
    return response.data;
  },

  // Get conversations with specific user
  getConversationsWith: async (userId: string): Promise<Conversation[]> => {
    const response = await axios.get(`${API_URL}/conversation/findWith/${userId}`);
    return response.data;
  },

  // Create a new conversation
  createConversation: async (conversation: Partial<Conversation>): Promise<Conversation> => {
    const response = await axios.post(`${API_URL}/conversation/create`, conversation);
    return response.data;
  },

  // Create a conversation for an auction winner
  createAuctionConversation: async (bidId: string): Promise<Conversation> => {
    const response = await axios.post(`${API_URL}/conversation/create-for-auction`, { bidId });
    return response.data.conversation;
  },

  // Get messages from a conversation
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await axios.get(`${API_URL}/message/conversation/${conversationId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (message: { message: string, conversation: string, sender: string }): Promise<Message> => {
    const response = await axios.post(`${API_URL}/message/create`, message);
    return response.data;
  },

  // Mark all messages in a conversation as read
  markAsRead: async (conversationId: string): Promise<void> => {
    await axios.post(`${API_URL}/message/mark-read/${conversationId}`);
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get(`${API_URL}/message/unread-count`);
    return response.data.count;
  }
};