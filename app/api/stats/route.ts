import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, errorTracker } from '@/lib/monitoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Log API request
    logger.info('Stats API request', { ip, endpoint: '/api/stats' });
    
    // Fetch real-time stats from database
    
    // Count registered donors (users with is_donor = true)
    const { count: donorCount, error: donorError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_donor', true);

    // Count fulfilled blood requests
    const { count: requestCount, error: requestError } = await supabase
      .from('blood_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'fulfilled');

    // Count partner organizations (organizations table)
    const { count: partnerCount, error: partnerError } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true });

    // Return stats with fallback to 0 if tables don't exist
    const response = NextResponse.json({
      registered_donors: donorCount || 0,
      blood_requests_fulfilled: requestCount || 0,
      partner_organizations: partnerCount || 0
    });
    
    // Log successful response
    const duration = Date.now() - startTime;
    logger.info('Stats API success', { 
      ip, 
      endpoint: '/api/stats',
      duration: `${duration}ms`,
      data: { donorCount, requestCount, partnerCount }
    });
    
    return response;
  } catch (error) {
    // Log error
    errorTracker.report(error instanceof Error ? error : new Error('Stats API error'), {
      ip,
      endpoint: '/api/stats',
      duration: `${Date.now() - startTime}ms`
    });
    
    // Return default values on any error
    return NextResponse.json({
      registered_donors: 0,
      blood_requests_fulfilled: 0,
      partner_organizations: 0
    });
  }
}
