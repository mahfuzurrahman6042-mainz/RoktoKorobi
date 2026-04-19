import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sectionId = searchParams.get('sectionId');
    const language = searchParams.get('language') || 'en';

    let query = supabase
      .from('illustrations')
      .select('*')
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
