import { requests } from './utils';
import Message from '../types/Message';


interface IMessage {
  message : string , 
  sender : string , 
  reciver : string , 
  idChat : string , 
} 
export const MessageAPI = {
  send: (data: Partial<IMessage>): Promise<any> => requests.post('message/create', data),
  getByConversation: (idChat: string): Promise<any> => requests.get(`message/getAll/${idChat}`),
  markAsRead: (conversationId: string): Promise<any> => requests.post(`message/mark-read/${conversationId}`, {}),
  markAllAsRead: (chatId: string): Promise<any> => requests.post(`message/mark-read/${chatId}`, {}),
  getUnreadCount: (): Promise<any> => requests.get('message/unread-count'),
};
