import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findNearestDistrict, calculateDistance } from '@/lib/bangladesh-districts';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const bloodGroup = searchParams.get('bloodGroup');
    const radius = searchParams.get('radius') || '50'; // Default 50km radius

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseFloat(radius);

    // Find the nearest district
    const nearestDistrict = findNearestDistrict(latitude, longitude);
    if (!nearestDistrict) {
      return NextResponse.json(
        { error: 'Could not determine location' },
        { status: 400 }
      );
    }

    // Build query for available donors
    let query = supabase
      .from('profiles')
      .select('id, name, blood_group, location, phone, age, latitude, longitude, is_available, total_donations')
      .eq('is_donor', true)
      .eq('is_available', true);

    // Filter by blood group if provided
    if (bloodGroup) {
      query = query.eq('blood_group', bloodGroup);
    }

    const { data: donors, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch donors' },
        { status: 500 }
      );
    }

    // Calculate distance for each donor and filter by radius
    const nearbyDonors = (donors || [])
      .map(donor => ({
        ...donor,
        distance: donor.latitude && donor.longitude 
          ? calculateDistance(latitude, longitude, donor.latitude, donor.longitude)
          : null
      }))
      .filter(donor => donor.distance !== null && donor.distance <= maxDistance)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return NextResponse.json({
      location: {
        district: nearestDistrict.name,
        districtBN: nearestDistrict.nameBN,
        division: nearestDistrict.division,
        coordinates: { lat: latitude, lng: longitude }
      },
      donors: nearbyDonors,
      count: nearbyDonors.length
    });
  } catch (error) {
    console.error('Error finding nearby donors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
