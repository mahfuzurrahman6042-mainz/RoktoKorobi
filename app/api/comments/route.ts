import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/validation';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('user_comments')
      .select('id, user_name, comment, rating, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check request size (max 10KB for comments)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Apply rate limiting: 5 comments per hour per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 5, 60 * 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { user_id, user_name, user_email, comment, rating } = body;

    if (!user_name || !comment) {
      return NextResponse.json(
        { error: 'User name and comment are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(user_name);
    const sanitizedEmail = user_email ? sanitizeInput(user_email) : null;
    const sanitizedComment = sanitizeInput(comment);

    const { data, error } = await supabase
      .from('user_comments')
      .insert([{
        user_id,
        user_name: sanitizedName,
        user_email: sanitizedEmail,
        comment: sanitizedComment,
        rating: rating || null,
        is_approved: false // Comments require approval
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    );
  }
}
