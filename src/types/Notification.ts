
export enum NotificationType {
    BID_CREATED = 'BID_CREATED',
    NEW_OFFER = 'NEW_OFFER',
    BID_ENDED = 'BID_ENDED',
    BID_WON = 'BID_WON',
    CHAT_CREATED = 'CHAT_CREATED',
    MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
    MESSAGE_ADMIN = 'MESSAGE_ADMIN',
    CONVERSATION = 'conversation',
    CHAT = 'chat',
    MESSAGE = 'message',
    NEW_MESSAGE = 'newMessage',
    SEND_MESSAGE = 'sendMessage',
    ORDER = 'ORDER',
    ARRIVAL = 'ARRIVAL',
    ITEM_SOLD = 'ITEM_SOLD',
  }

  export interface INotification {
    _id?: string;
    id?: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    data: any;
    read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    test?: boolean;
    receiverId?: string;
    chatId?: string;
  }

