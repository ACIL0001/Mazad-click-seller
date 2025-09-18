import { requests } from './utils';
import { monitorApiCall } from '@/utils/requestMonitor';

export interface Notification {
  _id: string;
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  data?: any;
  read: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  receiverId?: string;
  chatId?: string;
}

export const NotificationService = {
  /**
   * Get all notifications for the current user
   * The backend will filter by the authenticated user from the JWT token
   * @returns Promise<Notification[]> Array of notifications for the current user
   */
  getAllNotifications: (): Promise<Notification[]> => {
    return monitorApiCall(
      () => requests.get('notification/auction'), // Use auction endpoint for all user notifications
      'notification/auction',
      'GET'
    );
  },

  /**
   * Get unread count of notifications for the current user
   * The backend will count only unread notifications for the authenticated user
   * @returns Promise<number> Count of unread notifications for the current user
   */
  getUnreadCount: (): Promise<number> => {
    return monitorApiCall(
      () => requests.get('notification/unread-count'),
      'notification/unread-count',
      'GET'
    );
  },

  /**
   * Mark a notification as read
   * @param id Notification ID
   * @returns Promise<Notification> Updated notification
   */
  markAsRead: (id: string): Promise<Notification> => {
    return monitorApiCall(
      () => requests.put(`notification/${id}/read`, {}).then((result) => {
        // Dispatch event to update UI components
        window.dispatchEvent(new CustomEvent('databaseNotificationUpdate', { 
          detail: { action: 'markAsRead', id } 
        }));
        return result;
      }),
      `notification/${id}/read`,
      'PUT'
    );
  },

  /**
   * Mark all notifications as read for the current user
   * @returns Promise<{modifiedCount: number}> Number of notifications marked as read
   */
  markAllAsRead: (): Promise<{modifiedCount: number}> => {
    return monitorApiCall(
      () => requests.put('notification/read-all', {}).then((result) => {
        // Dispatch event to update UI components
        window.dispatchEvent(new CustomEvent('databaseNotificationUpdate', { 
          detail: { action: 'markAllAsRead', modifiedCount: result.modifiedCount } 
        }));
        return result;
      }),
      'notification/read-all',
      'PUT'
    );
  },

  /**
   * Create a test notification for debugging
   * @param message - Optional custom message for the test notification
   * @returns Promise<{success: boolean, notification: Notification}>
   */
  createTestNotification: (message?: string): Promise<{success: boolean, notification: Notification}> => {
    return monitorApiCall(
      () => requests.post('notification/test/create', { message }),
      'notification/test/create',
      'POST'
    );
  },

  /**
   * Create a test CHAT_CREATED notification for debugging
   * @param buyerName - Optional buyer name for the test
   * @param productTitle - Optional product title for the test
   * @returns Promise<{success: boolean, notification: Notification}>
   */
  createTestChatNotification: (buyerName?: string, productTitle?: string): Promise<{success: boolean, notification: Notification}> => {
    return monitorApiCall(
      () => requests.post('notification/test/chat', { buyerName, productTitle }),
      'notification/test/chat',
      'POST'
    );
  },

  /**
   * Create a test MESSAGE_RECEIVED notification for debugging admin messages
   * @param message - Optional custom message for the test
   * @returns Promise<{success: boolean, notification: Notification}>
   */
  createTestAdminMessageNotification: (message?: string): Promise<{success: boolean, notification: Notification}> => {
    return monitorApiCall(
      () => requests.post('notification/test/admin-message', { message }),
      'notification/test/admin-message',
      'POST'
    );
  },

  /**
   * Delete a notification
   * @param id Notification ID
   * @returns Promise<{deletedCount: number}> Number of notifications deleted
   */
  deleteNotification: (id: string): Promise<{deletedCount: number}> => {
    return monitorApiCall(
      () => requests.delete(`notification/${id}`).then((result) => {
        // Dispatch event to update UI components
        window.dispatchEvent(new CustomEvent('databaseNotificationUpdate', { 
          detail: { action: 'delete', id } 
        }));
        return result;
      }),
      `notification/${id}`,
      'DELETE'
    );
  },

  /**
   * Delete all notifications for the current user
   * @returns Promise<{deletedCount: number}> Number of notifications deleted
   */
  deleteAllNotifications: (): Promise<{deletedCount: number}> => {
    return monitorApiCall(
      () => requests.delete('notification/delete-all').then((result) => {
        // Dispatch event to update UI components
        window.dispatchEvent(new CustomEvent('databaseNotificationUpdate', { 
          detail: { action: 'deleteAll', deletedCount: result.deletedCount } 
        }));
        return result;
      }),
      'notification/delete-all',
      'DELETE'
    );
  },

  /**
   * Get notification statistics for the current user
   * @returns Promise<{total: number, unread: number, read: number}>
   */
  getNotificationStats: (): Promise<{total: number, unread: number, read: number}> => {
    return monitorApiCall(
      () => requests.get('notification/stats'),
      'notification/stats',
      'GET'
    );
  },

  /**
   * Mark notifications as read by type
   * @param type Notification type to mark as read
   * @returns Promise<{modifiedCount: number}> Number of notifications marked as read
   */
  markAsReadByType: (type: string): Promise<{modifiedCount: number}> => {
    return monitorApiCall(
      () => requests.put(`notification/read-by-type/${type}`, {}).then((result) => {
        // Dispatch event to update UI components
        window.dispatchEvent(new CustomEvent('databaseNotificationUpdate', { 
          detail: { action: 'markAsReadByType', type, modifiedCount: result.modifiedCount } 
        }));
        return result;
      }),
      `notification/read-by-type/${type}`,
      'PUT'
    );
  }
};