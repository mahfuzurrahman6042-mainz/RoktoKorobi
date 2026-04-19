import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const sectionId = formData.get('sectionId') as string;
    const language = formData.get('language') as string;

    if (!file || !title || !description || !sectionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user from localStorage (in production, use proper auth)
    const userStr = request.headers.get('x-user-data');
    if (!userStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = JSON.parse(userStr);

    // Check permissions
    if (user.role !== 'super_admin' && !(user.role === 'admin' && user.can_upload_illustrations)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('illustrations')
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('illustrations')
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
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, illustration: insertData }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
