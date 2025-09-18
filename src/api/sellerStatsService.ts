import { requests } from './utils';

export interface SellerDashboardStats {
  auctions: {
    total: number;
    active: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  offers: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
  };
  financial: {
    totalEarnings: number;
    averagePrice: number;
    highestSale: number;
    pendingPayments: number;
  };
  performance: {
    viewsTotal: number;
    conversionRate: number;
    averageRating: number;
    responseTime: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    name: string;
    data: number[];
    color: string;
  }[];
}

export interface CategoryDistribution {
  name: string;
  value: number;
  percentage: number;
}

export interface PriceRangeData {
  range: string;
  count: number;
  percentage: number;
}

export interface QuickSummary {
  totalAuctions: number;
  activeAuctions: number;
  totalOffers: number;
  pendingOffers: number;
  totalEarnings: number;
  averagePrice: number;
  conversionRate: number;
  viewsTotal: number;
}

export interface FinancialStats {
  earnings: {
    total: number;
    average: number;
    highest: number;
    pending: number;
  };
  auctions: {
    completed: number;
    active: number;
    total: number;
  };
  offers: {
    accepted: number;
    pending: number;
    total: number;
  };
}

export interface PerformanceStats {
  views: number;
  conversion: number;
  rating: number;
  responseTime: number;
  efficiency: {
    auctionsPerMonth: number;
    averageOffers: number;
    successRate: number;
  };
}

export interface RecentActivity {
  auctions: any[];
  offers: any[];
}

// Circuit breaker to prevent continued failed requests
let circuitBreakerOpen = false;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

// Retry utility with exponential backoff and circuit breaker
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = 1, // Reduced retries
  delay: number = 2000
): Promise<T> => {
  // Check circuit breaker
  if (circuitBreakerOpen) {
    const timeSinceLastFailure = Date.now() - lastFailureTime;
    if (timeSinceLastFailure < CIRCUIT_BREAKER_TIMEOUT) {
      console.warn('Circuit breaker is open, skipping API call');
      throw new Error('Service temporarily unavailable');
    } else {
      // Reset circuit breaker
      circuitBreakerOpen = false;
      console.log('Circuit breaker reset, attempting API call');
    }
  }

  try {
    return await fn();
  } catch (error) {
    lastFailureTime = Date.now();
    
    // Open circuit breaker after multiple failures
    if (retries === 0) {
      circuitBreakerOpen = true;
      console.warn('Circuit breaker opened due to repeated failures');
    }
    
    if (retries > 0) {
      console.warn(`API call failed, retrying in ${delay}ms...`, error?.response?.status || error?.message);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export const SellerStatsAPI = {
  // Get complete dashboard statistics
  getDashboardStats: (): Promise<SellerDashboardStats> => 
    retryWithBackoff(() => requests.get('seller-stats/dashboard-overview')),

  // Get quick summary for widgets
  getQuickSummary: (): Promise<QuickSummary> => 
    retryWithBackoff(() => requests.get('seller-stats/quick-summary')),

  // Get auction time series data for charts
  getAuctionTimeSeries: (months: number = 12): Promise<ChartData> => 
    retryWithBackoff(() => requests.get(`seller-stats/auctions/timeseries?months=${months}`)),

  // Get offer time series data for charts
  getOfferTimeSeries: (months: number = 12): Promise<ChartData> => 
    retryWithBackoff(() => requests.get(`seller-stats/offers/timeseries?months=${months}`)),

  // Get category distribution for pie charts
  getCategoryDistribution: (): Promise<CategoryDistribution[]> => 
    retryWithBackoff(() => requests.get('seller-stats/categories/distribution')),

  // Get price range distribution
  getPriceRangeDistribution: (): Promise<PriceRangeData[]> => 
    retryWithBackoff(() => requests.get('seller-stats/price-ranges')),

  // Get recent activity
  getRecentActivity: (limit: number = 10): Promise<RecentActivity> => 
    retryWithBackoff(() => requests.get(`seller-stats/recent-activity?limit=${limit}`)),

  // Get detailed financial statistics
  getFinancialStats: (): Promise<FinancialStats> => 
    retryWithBackoff(() => requests.get('seller-stats/financial')),

  // Get performance statistics
  getPerformanceStats: (): Promise<PerformanceStats> => 
    retryWithBackoff(() => requests.get('seller-stats/performance')),

  // Get monthly statistics for charts
  getMonthlyStats: (months: number = 12): Promise<any> => 
    retryWithBackoff(() => requests.get(`seller-stats/monthly-stats?months=${months}`)),

  // Get top performing categories
  getTopCategories: (limit: number = 5): Promise<any> => 
    retryWithBackoff(() => requests.get(`seller-stats/top-categories?limit=${limit}`)),

  // Get detailed performance metrics
  getPerformanceMetrics: (): Promise<any> => 
    retryWithBackoff(() => requests.get('seller-stats/performance-metrics')),

  // Get engagement metrics
  getEngagementMetrics: (days: number = 30): Promise<any> => 
    retryWithBackoff(() => requests.get(`seller-stats/engagement-metrics?days=${days}`)),

  // Get seller ranking
  getSellerRanking: (): Promise<any> => 
    retryWithBackoff(() => requests.get('seller-stats/seller-ranking')),

  // Track view
  trackView: (auctionId: string, viewType?: string, metadata?: any): Promise<any> => 
    retryWithBackoff(() => requests.post(`seller-stats/track-view/${auctionId}`, { viewType, metadata })),

  // Track dashboard view
  trackDashboardView: (metadata?: any): Promise<any> => 
    retryWithBackoff(() => requests.post('seller-stats/track-dashboard-view', { metadata })),

  // Get view analytics
  getViewAnalytics: (days: number = 30): Promise<any> => 
    retryWithBackoff(() => requests.get(`seller-stats/view-analytics?days=${days}`)),

  // Get complete dashboard overview
  getDashboardOverview: (): Promise<any> => 
    retryWithBackoff(() => requests.get('seller-stats/dashboard-overview')),
};

export class SellerStatsService {
  // Get complete dashboard statistics
  static async getDashboardStats(): Promise<SellerDashboardStats> {
    return SellerStatsAPI.getDashboardStats();
  }

  // Get quick summary for widgets
  static async getQuickSummary(): Promise<QuickSummary> {
    return SellerStatsAPI.getQuickSummary();
  }

  // Get auction time series data for charts
  static async getAuctionTimeSeries(months: number = 12): Promise<ChartData> {
    return SellerStatsAPI.getAuctionTimeSeries(months);
  }

  // Get offer time series data for charts
  static async getOfferTimeSeries(months: number = 12): Promise<ChartData> {
    return SellerStatsAPI.getOfferTimeSeries(months);
  }

  // Get category distribution for pie charts
  static async getCategoryDistribution(): Promise<CategoryDistribution[]> {
    return SellerStatsAPI.getCategoryDistribution();
  }

  // Get price range distribution
  static async getPriceRangeDistribution(): Promise<PriceRangeData[]> {
    return SellerStatsAPI.getPriceRangeDistribution();
  }

  // Get recent activity
  static async getRecentActivity(limit: number = 10): Promise<RecentActivity> {
    return SellerStatsAPI.getRecentActivity(limit);
  }

  // Get detailed financial statistics
  static async getFinancialStats(): Promise<FinancialStats> {
    return SellerStatsAPI.getFinancialStats();
  }

  // Get performance statistics
  static async getPerformanceStats(): Promise<PerformanceStats> {
    return SellerStatsAPI.getPerformanceStats();
  }

  // Get monthly statistics for charts
  static async getMonthlyStats(months: number = 12): Promise<any> {
    return SellerStatsAPI.getMonthlyStats(months);
  }

  // Get top performing categories
  static async getTopCategories(limit: number = 5): Promise<any> {
    return SellerStatsAPI.getTopCategories(limit);
  }

  // Get detailed performance metrics
  static async getPerformanceMetrics(): Promise<any> {
    return SellerStatsAPI.getPerformanceMetrics();
  }

  // Get engagement metrics
  static async getEngagementMetrics(days: number = 30): Promise<any> {
    return SellerStatsAPI.getEngagementMetrics(days);
  }

  // Get seller ranking
  static async getSellerRanking(): Promise<any> {
    return SellerStatsAPI.getSellerRanking();
  }


  // Track view
  static async trackView(auctionId: string, viewType?: string, metadata?: any): Promise<any> {
    return SellerStatsAPI.trackView(auctionId, viewType, metadata);
  }

  // Track dashboard view
  static async trackDashboardView(metadata?: any): Promise<any> {
    return SellerStatsAPI.trackDashboardView(metadata);
  }

  // Get view analytics
  static async getViewAnalytics(days: number = 30): Promise<any> {
    return SellerStatsAPI.getViewAnalytics(days);
  }

  // Get complete dashboard overview
  static async getDashboardOverview(): Promise<any> {
    return SellerStatsAPI.getDashboardOverview();
  }
}

export default SellerStatsService;
