// Performance Monitoring and Optimization Utilities
// Provides tools for monitoring application performance and optimizing bottlenecks

export interface PerformanceMetrics {
  timestamp: string;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  responseTime?: number;
  endpoint?: string;
  statusCode?: number;
  userAgent?: string;
  userId?: string;
}

export interface LoadTestResult {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  // Record performance metric
  recordMetric(metric: Partial<PerformanceMetrics>): void {
    const fullMetric: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      ...metric
    };

    this.metrics.push(fullMetric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get recent metrics
  getRecentMetrics(count: number = 100): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  // Get metrics by endpoint
  getMetricsByEndpoint(endpoint: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.endpoint === endpoint);
  }

  // Get average response time by endpoint
  getAverageResponseTime(endpoint: string): number {
    const endpointMetrics = this.getMetricsByEndpoint(endpoint);
    if (endpointMetrics.length === 0) return 0;
    
    const totalTime = endpointMetrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return totalTime / endpointMetrics.length;
  }

  // Get slowest endpoints
  getSlowestEndpoints(limit: number = 5): Array<{ endpoint: string; avgResponseTime: number }> {
    const endpointAverages = new Map<string, number>();
    
    // Group metrics by endpoint
    this.metrics.forEach(metric => {
      const current = endpointAverages.get(metric.endpoint) || 0;
      const count = this.metrics.filter(m => m.endpoint === metric.endpoint).length;
      endpointAverages.set(metric.endpoint, (current * (count - 1) + metric.responseTime) / count);
    });

    // Sort by average response time
    return Array.from(endpointAverages.entries())
      .map(([endpoint, avgTime]) => ({ endpoint, avgResponseTime: avgTime }))
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
      .slice(0, limit);
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
  }
}

export class LoadTester {
  private results: LoadTestResult[] = [];
  private concurrent = 5; // Number of concurrent requests
  private duration = 30000; // 30 seconds of testing

  // Perform load test on an endpoint
  async testEndpoint(
    endpoint: string,
    method: string = 'GET',
    payload?: any
  ): Promise<LoadTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'RoktoKorobi-LoadTest/1.0'
        },
        body: payload ? JSON.stringify(payload) : undefined
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const result: LoadTestResult = {
        endpoint,
        method,
        statusCode: response.status,
        responseTime,
        success: response.ok,
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      return result;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const result: LoadTestResult = {
        endpoint,
        method,
        statusCode: 0,
        responseTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

      this.results.push(result);
      return result;
    }
  }

  // Perform concurrent load test
  async testConcurrentLoad(
    endpoint: string,
    requestsPerSecond: number = 10,
    duration: number = 30000
  ): Promise<LoadTestResult[]> {
    const promises: Promise<LoadTestResult>[] = [];
    const startTime = Date.now();

    // Create concurrent requests
    for (let i = 0; i < this.concurrent; i++) {
      promises.push(this.testEndpoint(endpoint));
    }

    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      
      return results.map(result => ({
        ...result,
        concurrentRequests: this.concurrent,
        totalRequests: this.concurrent,
        duration: endTime - startTime
      }));
    } catch (error) {
      const endTime = Date.now();
      
      return Array.from({ length: this.concurrent }, (_, index) => ({
        endpoint,
        method: 'GET',
        statusCode: 0,
        responseTime: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        concurrentRequests: this.concurrent,
        totalRequests: this.concurrent,
        duration: endTime - startTime
      }));
    }
  }

  // Get load test results
  getResults(): LoadTestResult[] {
    return this.results;
  }

  // Calculate load test statistics
  getStatistics(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    requestsPerSecond: number;
  } {
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    const responseTimes = this.results.filter(r => r.success).map(r => r.responseTime);
    
    return {
      totalRequests: this.results.length,
      successfulRequests: successful.length,
      failedRequests: failed.length,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0,
      minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
      maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
      requestsPerSecond: this.results.length > 0 ? (this.results.length / (this.duration / 1000)) : 0
    };
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }
}

export class ResponseTimeTracker {
  private startTime: number = 0;

  // Start timing
  start(): void {
    this.startTime = Date.now();
  }

  // End timing and return duration
  end(): number {
    return Date.now() - this.startTime;
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  // Optimize database queries
  static optimizeQuery(query: string): string {
    // Basic query optimization - remove unnecessary whitespace
    return query.trim();
  }

  // Optimize image for web
  static async optimizeImage(file: File): Promise<File> {
    // Image optimization placeholder - requires external library
    return file;
  }

  // Cache optimization hints
  static getCacheHeaders(maxAge: number = 3600): Record<string, string> {
    return {
      'Cache-Control': `public, max-age=${maxAge}`,
      'ETag': Math.random().toString(36),
      'Vary': 'Accept-Encoding'
    };
  }

  // Compression settings
  static getCompressionSettings(): Record<string, string> {
    return {
      'Content-Encoding': 'gzip',
      'Vary': 'Accept-Encoding'
    };
  }
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const loadTester = new LoadTester();
export const responseTimeTracker = new ResponseTimeTracker();
export const performanceOptimizer = new PerformanceOptimizer();
