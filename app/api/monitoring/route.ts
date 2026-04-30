import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor, loadTester } from '@/lib/performance';
import { validateCSRFToken } from '@/lib/security';
import { logger } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Get recent performance metrics
    const recentMetrics = performanceMonitor.getRecentMetrics(100);
    const slowestEndpoints = performanceMonitor.getSlowestEndpoints(5);

    // Return performance data
    return NextResponse.json({
      success: true,
      data: {
        recentMetrics,
        slowestEndpoints,
        systemInfo: {
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });

  } catch (error) {
    logger.logApiError('monitoring', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, endpoint, options } = body;

    switch (action) {
      case 'clear-metrics':
        performanceMonitor.clearMetrics();
        return NextResponse.json({
          success: true,
          message: 'Performance metrics cleared'
        });

      case 'load-test':
        if (!endpoint) {
          return NextResponse.json(
            { error: 'Endpoint required for load testing' },
            { status: 400 }
          );
        }

        const testResults = await loadTester.testConcurrentLoad(
          endpoint,
          options?.requestsPerSecond || 10,
          options?.duration || 30000
        );

        return NextResponse.json({
          success: true,
          data: {
            results: testResults,
            statistics: loadTester.getStatistics()
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    logger.logApiError('monitoring', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
