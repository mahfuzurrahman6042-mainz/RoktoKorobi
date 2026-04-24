import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sanitizeInput, validateEmail } from '@/lib/validation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 3 verification emails per hour per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 3, 60 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many verification requests. Please try again later.' 
      }, { status: 429 });
    }

    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Fetch user
    const { data: user, error } = await supabase
      .from('profiles')
      .select('id, name, email_verified')
      .eq('email', sanitizedEmail)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email_verified) {
      return NextResponse.json({ error: 'Email already verified' }, { status: 400 });
    }

    // Generate verification token
    const { data: tokenData, error: tokenError } = await supabase.rpc(
      'generate_email_verification_token',
      { user_id: user.id }
    );

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Failed to generate verification token' }, { status: 500 });
    }

    // Send email using Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationLink = `${appUrl}/verify-email?token=${tokenData}`;

    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'RoktoKorobi <noreply@resend.dev>',
          to: sanitizedEmail,
          subject: 'Verify your email for RoktoKorobi',
          html: `
            <h1>Welcome to RoktoKorobi!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href="${verificationLink}">Verify Email</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you did not create an account, please ignore this email.</p>
          `,
        }),
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.text();
        throw new Error(`Resend API error: ${errorData}`);
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      // In production, you might want to retry or alert admins
      return NextResponse.json({ 
        error: 'Failed to send verification email. Please try again.' 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Verification email sent. Please check your inbox.',
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
