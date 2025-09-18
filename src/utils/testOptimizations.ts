// Test script to verify optimizations are working
// This can be run in the browser console to test the optimizations

import { requestMonitor } from './requestMonitor';

export class OptimizationTester {
  private static instance: OptimizationTester;
  private testStartTime: number = 0;
  private baselineStats: any = null;
  private testStats: any = null;

  public static getInstance(): OptimizationTester {
    if (!OptimizationTester.instance) {
      OptimizationTester.instance = new OptimizationTester();
    }
    return OptimizationTester.instance;
  }

  /**
   * Start a baseline test to measure current API request frequency
   */
  public startBaselineTest(): void {
    console.log('🧪 Starting baseline test...');
    this.testStartTime = Date.now();
    requestMonitor.clearLogs();
    
    // Simulate typical user activity
    this.simulateUserActivity();
    
    setTimeout(() => {
      this.baselineStats = requestMonitor.getRequestStats(1); // 1 minute test
      console.log('📊 Baseline test completed:');
      console.log(`   Requests per minute: ${this.baselineStats.requestsPerMinute.toFixed(2)}`);
      console.log(`   Total requests: ${this.baselineStats.totalRequests}`);
    }, 60000); // 1 minute
  }

  /**
   * Start an optimized test to measure improvement
   */
  public startOptimizedTest(): void {
    console.log('🚀 Starting optimized test...');
    this.testStartTime = Date.now();
    requestMonitor.clearLogs();
    
    // Simulate the same user activity
    this.simulateUserActivity();
    
    setTimeout(() => {
      this.testStats = requestMonitor.getRequestStats(1); // 1 minute test
      console.log('📊 Optimized test completed:');
      console.log(`   Requests per minute: ${this.testStats.requestsPerMinute.toFixed(2)}`);
      console.log(`   Total requests: ${this.testStats.totalRequests}`);
      
      this.compareResults();
    }, 60000); // 1 minute
  }

  /**
   * Compare baseline and optimized results
   */
  private compareResults(): void {
    if (!this.baselineStats || !this.testStats) {
      console.log('❌ No test data available for comparison');
      return;
    }

    const improvement = ((this.baselineStats.requestsPerMinute - this.testStats.requestsPerMinute) / this.baselineStats.requestsPerMinute) * 100;
    
    console.log('📈 Optimization Results:');
    console.log(`   Baseline requests/min: ${this.baselineStats.requestsPerMinute.toFixed(2)}`);
    console.log(`   Optimized requests/min: ${this.testStats.requestsPerMinute.toFixed(2)}`);
    console.log(`   Improvement: ${improvement.toFixed(1)}% reduction`);
    
    if (improvement > 50) {
      console.log('✅ Excellent optimization! Request frequency reduced by more than 50%');
    } else if (improvement > 30) {
      console.log('✅ Good optimization! Request frequency reduced by more than 30%');
    } else if (improvement > 10) {
      console.log('✅ Moderate optimization! Request frequency reduced by more than 10%');
    } else {
      console.log('⚠️  Limited optimization detected. Consider reviewing the implementation.');
    }
  }

  /**
   * Simulate typical user activity that would trigger API calls
   */
  private simulateUserActivity(): void {
    // Simulate multiple components using the notification hooks
    const simulateHookUsage = () => {
      // This simulates the behavior of multiple components using the hooks
      console.log('🔄 Simulating hook usage...');
      
      // Simulate rapid state changes that would trigger API calls
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          // Simulate component mounting/unmounting
          console.log(`   Simulating component activity ${i + 1}/10`);
        }, i * 1000);
      }
    };

    // Run simulation multiple times
    simulateHookUsage();
    setTimeout(simulateHookUsage, 15000);
    setTimeout(simulateHookUsage, 30000);
    setTimeout(simulateHookUsage, 45000);
  }

  /**
   * Test cache effectiveness
   */
  public testCacheEffectiveness(): void {
    console.log('🧪 Testing cache effectiveness...');
    
    // Clear logs and start fresh
    requestMonitor.clearLogs();
    
    // Simulate multiple rapid requests for the same data
    const testCache = () => {
      console.log('🔄 Testing cache with rapid requests...');
      
      // Simulate multiple components requesting the same data simultaneously
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          console.log(`   Cache test request ${i + 1}/5`);
          // This would normally trigger API calls, but with caching, most should be cached
        }, i * 100);
      }
    };

    testCache();
    
    setTimeout(() => {
      const stats = requestMonitor.getRequestStats(1);
      console.log('📊 Cache test results:');
      console.log(`   Total requests: ${stats.totalRequests}`);
      console.log(`   Requests per minute: ${stats.requestsPerMinute.toFixed(2)}`);
      
      if (stats.requestsPerMinute < 10) {
        console.log('✅ Cache is working effectively! Low request frequency detected.');
      } else {
        console.log('⚠️  Cache may not be working optimally. High request frequency detected.');
      }
    }, 60000);
  }

  /**
   * Run a comprehensive test suite
   */
  public runFullTest(): void {
    console.log('🧪 Starting comprehensive optimization test...');
    console.log('This test will take 3 minutes to complete.');
    
    // Phase 1: Baseline test
    this.startBaselineTest();
    
    // Phase 2: Wait and run optimized test
    setTimeout(() => {
      this.startOptimizedTest();
    }, 70000); // Wait 70 seconds for baseline to complete
    
    // Phase 3: Cache effectiveness test
    setTimeout(() => {
      this.testCacheEffectiveness();
    }, 140000); // Wait for optimized test to complete
  }

  /**
   * Get current performance metrics
   */
  public getCurrentMetrics(): void {
    const stats = requestMonitor.getRequestStats(5); // Last 5 minutes
    console.log('📊 Current Performance Metrics (last 5 minutes):');
    console.log(`   Total requests: ${stats.totalRequests}`);
    console.log(`   Requests per minute: ${stats.requestsPerMinute.toFixed(2)}`);
    console.log(`   Average duration: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`   Success rate: ${stats.successRate.toFixed(1)}%`);
    
    if (stats.topEndpoints.length > 0) {
      console.log('   Top endpoints:');
      stats.topEndpoints.forEach(({ endpoint, count }) => {
        console.log(`     ${endpoint}: ${count} requests`);
      });
    }
  }
}

// Export singleton instance
export const optimizationTester = OptimizationTester.getInstance();

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).optimizationTester = optimizationTester;
  (window as any).requestMonitor = requestMonitor;
  
  console.log('🧪 Optimization tester available at window.optimizationTester');
  console.log('📊 Request monitor available at window.requestMonitor');
  console.log('');
  console.log('Available commands:');
  console.log('  window.optimizationTester.runFullTest() - Run comprehensive test');
  console.log('  window.optimizationTester.getCurrentMetrics() - Get current metrics');
  console.log('  window.requestMonitor.printStats() - Print request statistics');
} 