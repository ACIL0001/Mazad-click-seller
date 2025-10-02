// terms.api.ts
import { requests } from "./utils";
import { Terms } from "../types/terms";

export const TermsAPI = {
  /**
   * Get all terms and conditions (Public endpoint)
   */
  getPublic: async (): Promise<Terms[]> => {
    // Don't make requests if offline
    if (!navigator.onLine) {
      return [];
    }
    
    try {
      return await requests.get('terms/public');
    } catch (error) {
      // Silently handle network errors
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return [];
      }
      console.error('Failed to fetch public terms:', error);
      return [];
    }
  },

  /**
   * Get latest terms (Public endpoint)
   */
  getLatest: async (): Promise<Terms | null> => {
    // Don't make requests if offline
    if (!navigator.onLine) {
      return null;
    }
    
    try {
      const response = await requests.get('terms/latest');
      // Handle the case where no terms are found
      if (response && response.message && response.data === null) {
        return null;
      }
      return response;
    } catch (error) {
      // Silently handle network errors
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        return null;
      }
      console.error('Failed to fetch latest terms:', error);
      return null;
    }
  },
}