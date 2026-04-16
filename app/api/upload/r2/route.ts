import { NextRequest, NextResponse } from 'next/server';
import * as R2 from '@cloudflare/r2';

// FIX NEW-001: ASCII pipe (|) used for regex alternation — not U+2502 (│)
// FIX NEW-002: ASCII || used for logical OR — not U+2502U+2502 (││)

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get('origin') || '';
    if (!origin.startsWith(process.env.NEXT_PUBLIC_APP_URL!)) {
      return NextResponse.json(
        { error: 'Forbidden: invalid origin' }, { status: 403 }
      );
    }

    const body = await req.json();
    const { base64Data } = body;

    // Validate base64 + MIME prefix — FIXED REGEX
    const b64Pattern = /^data:image\/(jpeg|png|webp);base64,/;
    //                              ^ ASCII | not Unicode │
    if (!b64Pattern.test(base64Data)) {
      return NextResponse.json(
        { error: 'Invalid image format' }, { status: 400 }
      );
    }

    // Extract base64 data
    const base64 = base64Data.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    // Upload to Cloudflare R2
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
    const result = await R2.put(fileName, buffer, {
      httpMetadata: { contentType: 'image/jpeg' },
    });

    return NextResponse.json({
      success: true,
      url: `https://${process.env.R2_BUCKET_URL}/${fileName}`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' }, { status: 500 }
    );
  }
}
