import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { sanitizeInput, validateEmail, validatePassword } from '@/lib/validation';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 1 signup attempt per hour per IP
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 1, 60 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many signup attempts. Please try again later.' 
      }, { status: 429 });
    }

    const body = await request.json();
    const { email, password } = body;

    // Sanitize and validate inputs
    const sanitizedEmail = sanitizeInput(email);
    
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    // Check if super admin already exists
    const { data: existingAdmin } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json({ 
        error: 'Super admin already exists. Contact the existing super admin.' 
      }, { status: 400 });
    }

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Create super admin
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          name: 'Super Admin',
          email: sanitizedEmail,
          password: hashedPassword,
          role: 'super_admin',
          is_donor: false,
          age: 18,
          location: 'System',
          weight: 50,
          email_verified: true,
        },
      ]);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create super admin' }, { status: 500 });
    }

    // Log super admin creation
    await logSecurityEvent(
      'SUPER_ADMIN_CREATED',
      'user',
      undefined,
      undefined,
      sanitizedEmail,
      request.headers.get('x-forwarded-for') || 'unknown',
      true
    );

    return NextResponse.json({ 
      success: true,
      message: 'Super admin created successfully' 
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
