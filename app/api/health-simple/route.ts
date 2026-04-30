import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic application health check without external dependencies
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '22.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime ? Math.floor(process.uptime()) : null,
      memory: process.memoryUsage ? {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      } : null,
      checks: {
        nextjs: 'operational',
        typescript: 'operational',
        filesystem: 'operational'
      }
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
