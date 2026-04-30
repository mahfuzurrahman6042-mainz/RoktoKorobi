// Simple monitoring and logging utility for production

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  log(level: LogEntry['level'], message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: context?.userId,
      ip: context?.ip,
      userAgent: context?.userAgent
    };

    // Add to memory buffer
    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console in development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[logMethod](`[${level.toUpperCase()}] ${message}`, context || '');
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context);
  }

  logApiRequest(endpoint: string, context?: Record<string, any>): void {
    this.log('info', `API request: ${endpoint}`, context);
  }

  logApiSuccess(endpoint: string, context?: Record<string, any>): void {
    this.log('info', `API success: ${endpoint}`, context);
  }

  logApiError(endpoint: string, error: any, context?: Record<string, any>): void {
    this.log('error', `API error: ${endpoint} - ${error?.message || 'Unknown error'}`, {
      ...context,
      error: error?.message,
      stack: error?.stack
    });
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context);
  }

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();

// Performance monitoring
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  startTimer(name: string, metadata?: Record<string, any>): PerformanceMetric {
    const metric: PerformanceMetric = {
      name,
      startTime: Date.now(),
      metadata
    };
    
    this.metrics.push(metric);
    return metric;
  }

  endTimer(metric: PerformanceMetric): number {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    // Log performance data
    logger.info(`Performance: ${metric.name}`, {
      duration: `${metric.duration}ms`,
      metadata: metric.metadata
    });
    
    return metric.duration;
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name).filter(m => m.duration);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + (m.duration || 0), 0);
    return Math.round(total / metrics.length);
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Utility function to track API performance
export function trackApiPerformance(
  name: string, 
  handler: (req: any) => Promise<any>
) {
  return async (req: any) => {
    const metric = performanceMonitor.startTimer(name, {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent')
    });

    try {
      const result = await handler(req);
      performanceMonitor.endTimer(metric);
      
      logger.info(`API Success: ${name}`, {
        method: req.method,
        duration: `${metric.duration}ms`,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      performanceMonitor.endTimer(metric);
      
      logger.error(`API Error: ${name}`, {
        method: req.method,
        duration: `${metric.duration}ms`,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };
}

// Error tracking
export interface ErrorReport {
  timestamp: string;
  error: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  userAgent?: string;
  url?: string;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;

  report(error: Error, context?: Record<string, any>) {
    const report: ErrorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      context,
      userId: context?.userId,
      userAgent: context?.userAgent,
      url: context?.url
    };

    this.errors.push(report);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log the error
    logger.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  getRecentErrors(count: number = 50): ErrorReport[] {
    return this.errors.slice(-count);
  }

  getErrorsByType(errorMessage: string): ErrorReport[] {
    return this.errors.filter(e => e.error.includes(errorMessage));
  }

  clearErrors() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

// Global error handler for uncaught exceptions
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorTracker.report(event.error || new Error(event.message), {
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.report(new Error(event.reason), {
      url: window.location.href,
      userAgent: navigator.userAgent,
      type: 'unhandled_promise_rejection'
    });
  });
}
