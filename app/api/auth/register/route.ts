import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateRegistrationData } from '@/lib/auth-validation';
import { sanitizeInput } from '@/lib/enhanced-validation';
import { hash } from 'bcryptjs';
import { validateCSRFToken, validateRateLimit, validateSessionToken } from '@/lib/security';
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
    
    if (!validateRateLimit(clientIP, 'register', 5, 15 * 60 * 1000)) { // 5 requests per 15 minutes
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate input data
    const validation = validateRegistrationData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const { sanitizedData } = validation;
    if (!sanitizedData) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${sanitizedData.email},phone.eq.${sanitizedData.phone}`)
      .limit(1);

    if (checkError) {
      logger.logApiError('register', checkError, { email: sanitizedData.email });
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(sanitizedData.password, 10);

    // Create user
    const { data: newUser, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          name: sanitizedData.name,
          email: sanitizedData.email,
          phone: sanitizedData.phone,
          blood_group: sanitizedData.bloodGroup,
          date_of_birth: sanitizedData.dateOfBirth,
          district: sanitizedData.district,
          location: sanitizedData.location,
          weight: parseFloat(sanitizedData.weight),
          is_donor: sanitizedData.wantsToBeDonor,
          password_hash: hashedPassword,
          role: 'user',
          is_available: true,
          total_donations: 0,
          privacy_consent: sanitizedData.privacyConsent,
          age_declaration: sanitizedData.ageConfirmed,
        }
      ])
      .select('id, email, name, created_at')
      .single();

    if (insertError) {
      logger.logApiError('register', insertError, { email: sanitizedData.email });
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Log successful registration
    logger.logApiSuccess('register', { 
      userId: newUser.id, 
      email: sanitizedData.email,
      timestamp: new Date().toISOString()
    });

    // Return success response without sensitive data
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    logger.logApiError('register', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
