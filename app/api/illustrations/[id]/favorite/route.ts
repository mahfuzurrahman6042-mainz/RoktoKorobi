import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('illustration_id', id)
      .single();

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('illustration_id', id);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, favorited: false }, { status: 200 });
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          illustration_id: id,
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, favorited: true }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
