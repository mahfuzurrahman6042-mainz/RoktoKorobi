import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    // Validate CSRF token
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Validate session
    const sessionToken = parseSessionCookie(cookieHeader);
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session using our custom JWT verification
    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { commentId, action } = body;

    if (!commentId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const isApproved = action === 'approve';

    const { data, error } = await supabase
      .from('user_comments')
      .update({ is_approved: isApproved })
      .eq('id', commentId)
      .select('id, user_name, user_email, comment, rating, is_approved, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    // Validate CSRF token
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Validate session
    const sessionToken = parseSessionCookie(cookieHeader);
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session using our custom JWT verification
    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('user_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
