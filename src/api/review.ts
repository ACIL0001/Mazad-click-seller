import { requests } from './utils';
import { monitorApiCall } from '@/utils/requestMonitor';

export interface ReviewData {
  userId: string;
  type: 'like' | 'dislike';
  comment?: string;
}

export interface ReviewResponse {
  _id: string;
  reviewer: string;
  targetUser: string;
  type: 'like' | 'dislike';
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ReviewService = {
  /**
   * Get all reviews
   * @returns Promise<any> All reviews data
   */
  find: (): Promise<any> => {
    return monitorApiCall(
      () => requests.get('review'),
      'review',
      'GET'
    );
  },

  /**
   * Like a user
   * @param userId Target user ID to like
   * @param comment Optional comment for the review
   * @returns Promise<ReviewResponse> Review data
   */
  likeUser: (userId: string, comment?: string): Promise<ReviewResponse> => {
    return monitorApiCall(
      () => requests.post(`review/like/${userId}`, { comment }),
      `review/like/${userId}`,
      'POST'
    );
  },

  /**
   * Dislike a user
   * @param userId Target user ID to dislike
   * @param comment Optional comment for the review
   * @returns Promise<ReviewResponse> Review data
   */
  dislikeUser: (userId: string, comment?: string): Promise<ReviewResponse> => {
    return monitorApiCall(
      () => requests.post(`review/dislike/${userId}`, { comment }),
      `review/dislike/${userId}`,
      'POST'
    );
  },

  /**
   * Submit a review (like or dislike)
   * @param reviewData Review data containing userId, type, and optional comment
   * @returns Promise<ReviewResponse> Review data
   */
  submitReview: (reviewData: ReviewData): Promise<ReviewResponse> => {
    const { userId, type, comment } = reviewData;
    
    if (type === 'like') {
      return ReviewService.likeUser(userId, comment);
    } else if (type === 'dislike') {
      return ReviewService.dislikeUser(userId, comment);
    } else {
      throw new Error('Invalid review type. Must be "like" or "dislike".');
    }
  },

  /**
   * Remove a review
   * @param reviewId Review ID to remove
   * @returns Promise<any> Response data
   */
  remove: (reviewId: string): Promise<any> => {
    return monitorApiCall(
      () => requests.delete(`review/${reviewId}`),
      `review/${reviewId}`,
      'DELETE'
    );
  },
};

// Export as ReviewAPI for backward compatibility with existing code
export const ReviewAPI = ReviewService;

