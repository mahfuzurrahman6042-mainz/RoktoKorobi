import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Prevent static generation
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting: 100 requests per minute per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 100, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many requests. Please try again later.' 
      }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    const language = searchParams.get('language') || 'en';

    let query = supabase
      .from('illustrations')
      .select('id, title, description, image_url, section_id, language, created_at')
      .eq('status', 'approved');

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    if (language) {
      query = query.eq('language', language);
    }

    const { data: illustrations, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch illustrations' }, { status: 500 });
    }

    return NextResponse.json({ illustrations }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
