// Request Monitor Utility
// This utility helps track API request frequency and monitor the effectiveness of optimizations

interface RequestLog {
  endpoint: string;
  timestamp: number;
  method: string;
  duration: number;
  success: boolean;
}

class RequestMonitor {
  private static instance: RequestMonitor;
  private requestLogs: RequestLog[] = [];
  private isEnabled: boolean = true;
  private maxLogs: number = 1000; // Keep last 1000 requests

  private constructor() {
    // Initialize monitoring
    this.setupConsoleLogging();
  }

  public static getInstance(): RequestMonitor {
    if (!RequestMonitor.instance) {
      RequestMonitor.instance = new RequestMonitor();
    }
    return RequestMonitor.instance;
  }

  public logRequest(endpoint: string, method: string = 'GET', duration: number = 0, success: boolean = true): void {
    if (!this.isEnabled) return;

    const log: RequestLog = {
      endpoint,
      timestamp: Date.now(),
      method,
      duration,
      success
    };

    this.requestLogs.push(log);

    // Keep only the last maxLogs entries
    if (this.requestLogs.length > this.maxLogs) {
      this.requestLogs = this.requestLogs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 API Request: ${method} ${endpoint} - ${duration}ms - ${success ? '✅' : '❌'}`);
    }
  }

  public getRequestStats(timeWindowMinutes: number = 5): {
    totalRequests: number;
    requestsPerMinute: number;
    averageDuration: number;
    successRate: number;
    topEndpoints: Array<{ endpoint: string; count: number }>;
  } {
    const now = Date.now();
    const timeWindowMs = timeWindowMinutes * 60 * 1000;
    
    const recentLogs = this.requestLogs.filter(log => 
      now - log.timestamp < timeWindowMs
    );

    if (recentLogs.length === 0) {
      return {
        totalRequests: 0,
        requestsPerMinute: 0,
        averageDuration: 0,
        successRate: 0,
        topEndpoints: []
      };
    }

    const totalRequests = recentLogs.length;
    const requestsPerMinute = totalRequests / timeWindowMinutes;
    const averageDuration = recentLogs.reduce((sum, log) => sum + log.duration, 0) / totalRequests;
    const successRate = (recentLogs.filter(log => log.success).length / totalRequests) * 100;

    // Get top endpoints
    const endpointCounts = recentLogs.reduce((acc, log) => {
      acc[log.endpoint] = (acc[log.endpoint] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRequests,
      requestsPerMinute,
      averageDuration,
      successRate,
      topEndpoints
    };
  }

  public getCacheStats(): {
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
  } {
    // This would need to be implemented with the actual cache system
    // For now, return placeholder data
    return {
      cacheHits: 0,
      cacheMisses: 0,
      hitRate: 0
    };
  }

  public enable(): void {
    this.isEnabled = true;
    console.log('📊 Request monitoring enabled');
  }

  public disable(): void {
    this.isEnabled = false;
    console.log('📊 Request monitoring disabled');
  }

  public clearLogs(): void {
    this.requestLogs = [];
    console.log('📊 Request logs cleared');
  }

  public printStats(timeWindowMinutes: number = 5): void {
    const stats = this.getRequestStats(timeWindowMinutes);
    
    console.log('📊 Request Monitor Stats:');
    console.log(`⏱️  Time Window: ${timeWindowMinutes} minutes`);
    console.log(`📈 Total Requests: ${stats.totalRequests}`);
    console.log(`⚡ Requests/Minute: ${stats.requestsPerMinute.toFixed(2)}`);
    console.log(`⏱️  Average Duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`✅ Success Rate: ${stats.successRate.toFixed(1)}%`);
    
    if (stats.topEndpoints.length > 0) {
      console.log('🔝 Top Endpoints:');
      stats.topEndpoints.forEach(({ endpoint, count }) => {
        console.log(`   ${endpoint}: ${count} requests`);
      });
    }
  }

  private setupConsoleLogging(): void {
    // Log stats every 5 minutes in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        this.printStats(5);
      }, 5 * 60 * 1000);
    }
  }
}

// Export singleton instance
export const requestMonitor = RequestMonitor.getInstance();

// Helper function to wrap API calls with monitoring
export function monitorApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  method: string = 'GET'
): Promise<T> {
  const startTime = Date.now();
  
  return apiCall()
    .then((result) => {
      const duration = Date.now() - startTime;
      requestMonitor.logRequest(endpoint, method, duration, true);
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      requestMonitor.logRequest(endpoint, method, duration, false);
      throw error;
    });
}

// Export types for external use
export type { RequestLog }; 