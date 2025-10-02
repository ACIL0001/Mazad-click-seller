// terms.api.ts
import { requests } from "./utils";
import { Terms } from "../types/terms";

export const TermsAPI = {
  /**
   * Get all terms and conditions (Public endpoint)
   */
  getPublic: async (): Promise<Terms[]> => {
    try {
      return await requests.get('terms/public');
    } catch (error) {
      console.error('Failed to fetch public terms:', error);
      return [];
    }
  },

  /**
   * Get latest terms (Public endpoint)
   */
  getLatest: async (): Promise<Terms | null> => {
    try {
      return await requests.get('terms/latest');
    } catch (error) {
      console.error('Failed to fetch latest terms:', error);
      return null;
    }
  },
}