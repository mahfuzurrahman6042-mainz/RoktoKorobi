import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { sanitizeInput, validateEmail, validatePassword } from '@/lib/validation';
import { logSecurityEvent } from '@/lib/audit-log';

export async function POST(request: NextRequest) {
  try {
    console.log('Super admin signup request received');
    const body = await request.json();
    const { email, password } = body;
    console.log('Email received:', email);

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
    const { data: existingAdmin, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'super_admin')
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing admin:', checkError);
      return NextResponse.json({ 
        error: 'Database error checking existing admin',
        details: checkError.message
      }, { status: 500 });
    }

    console.log('Existing admin check passed');

    if (existingAdmin) {
      return NextResponse.json({ 
      error: 'Super admin already exists. Contact the existing super admin.' 
      }, { status: 400 });
    }

    // Check if self-claim is enabled
    const { data: settingData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'self_claim_super_admin')
      .maybeSingle();

    const selfClaimEnabled = settingData?.value ?? true; // Default to true if not set
    
    if (!selfClaimEnabled) {
      return NextResponse.json({
        error: 'Self-claim super admin signup is disabled. Contact the existing super admin.'
      }, { status: 403 });
    }

    // Hash password before storing
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Create super admin
    console.log('Inserting super admin into database...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          name: 'Super Admin',
          email: sanitizedEmail,
          password: hashedPassword,
          role: 'super_admin',
          is_donor: true,
          age: 18,
          location: 'System',
          weight: 50,
          email_verified: true,
        },
      ]);

    if (insertError) {
      console.error('Insert error details:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create super admin',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }

    console.log('Insert successful');

    // Log super admin creation (don't fail if logging fails)
    try {
      await logSecurityEvent(
        'SUPER_ADMIN_CREATED',
        'user',
        undefined,
        undefined,
        sanitizedEmail,
        request.headers.get('x-forwarded-for') || 'unknown',
        true
      );
    } catch (logError) {
      console.error('Logging failed (non-critical):', logError);
    }

    console.log('Super admin created successfully');
    return NextResponse.json({ 
      success: true,
      message: 'Super admin created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Super admin signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
