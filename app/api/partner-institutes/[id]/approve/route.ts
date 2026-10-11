import { NextResponse } from 'next/server';

// The previous endpoint accepted approve/reject/suspend without verifying the
// caller. Keep it closed until a server-verified super-admin API replaces it.
export async function POST() {
  return NextResponse.json(
    { error: 'Partner approval is temporarily unavailable. Use the authenticated super-admin activation page.' },
    { status: 503 }
  );
}
