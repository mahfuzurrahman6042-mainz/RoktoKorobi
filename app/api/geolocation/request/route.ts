import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifySessionToken } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    // Get the blood request with hospital location
    const { data, error } = await supabase
      .from('blood_requests')
      .select('id, hospital_name, hospital_address, hospital_city, hospital_district, hospital_latitude, hospital_longitude, status')
      .eq('id', requestId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({
      hospital: {
        name: data.hospital_name,
        address: data.hospital_address,
        city: data.hospital_city,
        district: data.hospital_district,
        latitude: data.hospital_latitude,
        longitude: data.hospital_longitude
      },
      status: data.status
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
