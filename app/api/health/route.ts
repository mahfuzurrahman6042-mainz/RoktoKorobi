import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    let dbStatus = 'healthy';
    let dbResponseTime = 0;
    
    try {
      const dbStart = Date.now();
      await supabase.from('profiles').select('count').limit(1);
      dbResponseTime = Date.now() - dbStart;
    } catch (error) {
      dbStatus = 'unhealthy';
    }
    
    // Check environment variables
    const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'JWT_SECRET'];
    const envStatus = requiredEnvVars.every(varName => process.env[varName]) ? 'healthy' : 'unhealthy';
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryStatus = memoryUsage.heapUsed < 500 * 1024 * 1024 ? 'healthy' : 'warning'; // 500MB threshold
    
    // Check uptime
    const uptime = process.uptime();
    
    const healthCheck = {
      status: dbStatus === 'healthy' && envStatus === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${dbResponseTime}ms`
        },
        environment: {
          status: envStatus,
          requiredVars: requiredEnvVars
        },
        memory: {
          status: memoryStatus,
          usage: {
            heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
            external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
          }
        }
      },
      responseTime: `${Date.now() - startTime}ms`
    };
    
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthCheck, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    }, { status: 503 });
  }
}
