import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { parseSessionCookie, verifySessionToken } from '@/lib/auth';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { parseCSRFCookie, validateCSRFToken } from '@/lib/csrf';
import { validateFileContent, calculateChecksum, stripExifData, scanForMalware } from '@/lib/file-validation';
import { logSecurityEvent } from '@/lib/audit-log';

// Prevent static generation
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting: 10 uploads per hour per user
    const identifier = getClientIdentifier(request);
    const { success } = await rateLimit(identifier, 10, 60 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Too many upload attempts. Please try again later.' 
      }, { status: 429 });
    }

    // Check request size (max 10MB for file uploads)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    // Validate CSRF token
    const cookieHeader = request.headers.get('cookie');
    const csrfCookieToken = parseCSRFCookie(cookieHeader);
    const csrfHeaderToken = request.headers.get('x-csrf-token');
    
    if (!validateCSRFToken(csrfCookieToken, csrfHeaderToken)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const sectionId = formData.get('sectionId') as string;
    const language = formData.get('language') as string;

    if (!file || !title || !description || !sectionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // File validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' }, { status: 400 });
    }

    // Enhanced validation: Check file content (magic bytes)
    const isValidContent = await validateFileContent(file, file.type);
    if (!isValidContent) {
      return NextResponse.json({ error: 'File content does not match declared type' }, { status: 400 });
    }

    // Enhanced validation: Scan for malware
    const isClean = await scanForMalware(file);
    if (!isClean) {
      return NextResponse.json({ error: 'File rejected by security scan' }, { status: 400 });
    }

    // Enhanced validation: Strip EXIF data
    const cleanedFile = await stripExifData(file);

    // Enhanced validation: Calculate checksum for integrity
    const checksum = await calculateChecksum(cleanedFile);

    // Validate session from httpOnly cookie
    const sessionToken = parseSessionCookie(cookieHeader);
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifySessionToken(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    if (user.role !== 'super_admin' && !(user.role === 'admin' && user.can_upload_illustrations)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Upload file to Supabase Storage
    const fileExt = cleanedFile.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('Roktokorobi Chitrokothon')
      .upload(filePath, cleanedFile, {
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('Roktokorobi Chitrokothon')
      .getPublicUrl(filePath);

    // Determine status
    const status = user.role === 'super_admin' ? 'approved' : 'pending';

    // Insert into database
    const { data: insertData, error: insertError } = await supabase
      .from('illustrations')
      .insert({
        title,
        description,
        section_id: parseInt(sectionId),
        image_url: urlData.publicUrl,
        uploaded_by: user.id,
        status,
        language,
        file_checksum: checksum,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create illustration' }, { status: 500 });
    }

    // Log successful upload
    await logSecurityEvent(
      'ILLUSTRATION_UPLOADED',
      'illustration',
      insertData.id,
      user.id,
      user.email,
      request.headers.get('x-forwarded-for') || 'unknown',
      true,
      `Uploaded illustration: ${title}`
    );

    return NextResponse.json({ success: true, illustration: insertData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
