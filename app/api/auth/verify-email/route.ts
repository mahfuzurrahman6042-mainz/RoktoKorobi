import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting: 10 verifications per minute per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 10, 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many verification attempts. Please try again later.' 
      }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    // Verify email
    const { error: verifyError } = await supabase.rpc('verify_email', { token });

    if (verifyError) {
      return NextResponse.json({ error: 'Failed to verify email' }, { status: 500 });
    }

    const { data } = await supabase.rpc('verify_email', { token });

    if (!data) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully' 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
