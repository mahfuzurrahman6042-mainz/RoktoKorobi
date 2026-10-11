import { NextResponse } from 'next/server';

// Public partner applications need a separately secured intake and abuse
// controls. For the pilot, partners are activated by the super admin.
export async function POST() {
  return NextResponse.json(
    { error: 'Partner applications are temporarily closed. Contact the RedReach team directly.' },
    { status: 503 }
  );
}
