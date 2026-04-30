import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { compare } from 'bcryptjs';
import { validateCSRFToken, validateRateLimit, generateJWT } from '@/lib/security';
import { logger } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  try {
    // Validate request method
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Get request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate CSRF token
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !validateCSRFToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!validateRateLimit(clientIP, 'login', 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, password_hash, name, role, is_donor, email_verified')
      .eq('email', email)
      .single();

    if (userError || !user) {
      logger.logApiError('login', userError || new Error('User not found'), { 
        email: email,
        ip: clientIP 
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await compare(password, user.password_hash);
    if (!passwordMatch) {
      logger.logApiError('login', new Error('Invalid password'), { 
        userId: user.id,
        email: email,
        ip: clientIP 
      });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      isDonor: user.is_donor
    });

    // Log successful login
    logger.logApiSuccess('login', { 
      userId: user.id,
      email: user.email,
      ip: clientIP,
      timestamp: new Date().toISOString()
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        is_donor: user.is_donor,
        email_verified: user.email_verified
      },
      token
    });

  } catch (error) {
    logger.logApiError('login', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
