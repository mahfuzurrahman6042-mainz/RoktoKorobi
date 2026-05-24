import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock stats data for the original GitHub design
    const stats = {
      registered_donors: 15420,
      blood_requests_fulfilled: 8934,
      partner_organizations: 127
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
