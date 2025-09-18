import {requests} from "./utils";


export const ChatAPI = {
  createChat: (data): Promise<any> => requests.post('/chat/create', data),
  getChats: (data): Promise<any> => requests.post('/chat/getchats', data),
}; 