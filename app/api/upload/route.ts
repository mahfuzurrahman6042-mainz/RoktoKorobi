import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateChecksum } from '@/lib/file-validation';
import { validateCSRFToken, validateRateLimit } from '@/lib/security';
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
    
    if (!validateRateLimit(clientIP, 'upload', 10, 60 * 1000)) { // 10 uploads per minute
      return NextResponse.json(
        { error: 'Too many upload attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check request size (max 10MB for upload)
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file - basic validation
    const isValidType = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

    if (!isValidType || !isValidSize) {
      return NextResponse.json(
        { error: 'Invalid file type or size' },
        { status: 400 }
      );
    }

    // EXIF stripping and malware scanning are placeholders
    // These require external libraries (sharp, VirusTotal API, etc.)
    const strippedFile = file;

    // Calculate checksum
    const checksum = await calculateChecksum(strippedFile);

    // Create Supabase client
    const supabase = createClient();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('roktokorobi-chitro') // Using the Bengali name as requested
      .upload(`uploads/${Date.now()}-${checksum}`, strippedFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: strippedFile.type
      });

    if (uploadError) {
      logger.logApiError('upload', uploadError, {
        fileName: file.name,
        fileSize: file.size
      });
      return NextResponse.json(
        { error: 'File upload failed' },
        { status: 500 }
      );
    }

    // Log successful upload
    logger.logApiSuccess('upload', {
      fileName: file.name,
      fileSize: file.size,
      checksum,
      uploadPath: uploadData?.path,
      originalSize: file.size,
      optimizedSize: strippedFile.size
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        name: file.name,
        size: strippedFile.size,
        type: strippedFile.type,
        checksum,
        uploadPath: uploadData?.path,
        url: uploadData?.path ? `https://your-project.supabase.co/storage/v1/object/public/${uploadData.path}` : null
      }
    });

  } catch (error) {
    logger.logApiError('upload', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
