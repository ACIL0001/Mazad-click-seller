import { requests } from './utils';

export enum NotificationCategory {
  TASK = 'Task',
  EVENT = 'Event',
  NOTE = 'Note',
  CONTACT = 'User',
  All = 'All',
  SYSTEM = 'SYSTEM',
}

export enum NotificationAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
}

export const NotificationAPI = {
  getAll: (): Promise<any> => requests.get(`notifications`),
  markAsRead: (notificationId: string): Promise<any> => requests.put(`notification/${notificationId}/read`, {}),
  markAllAsRead: (): Promise<any> => requests.put('notification/read-all', {}),
  markChatAsRead: (chatId: string): Promise<any> => requests.put(`notification/chat/${chatId}/read`, {}),
  getUnreadCount: (): Promise<any> => requests.get('notification/unread-count'),
  SubmitPushNotification: async (notificationData: {
    title: string;
    description: string;
    client: boolean;
    rider: boolean;
    retaurant: boolean;
  }) => requests.post('notification/a/submit/pushnotifcation', notificationData),
  SubmitEmailNotification: async (notificationData: {
    title: string;
    description: string;
    client: boolean;
    rider: boolean;
    restaurant: boolean;
  }) => requests.post('notification/a/submit/emailnotification', notificationData),
};