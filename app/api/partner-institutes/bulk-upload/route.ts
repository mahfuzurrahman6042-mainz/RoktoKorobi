import { NextResponse } from 'next/server';

// Every student must create their own account after reviewing consent terms.
// This legacy endpoint must not create accounts from a partner-supplied list.
export async function POST() {
  return NextResponse.json(
    { error: 'Bulk account creation is disabled. Share the partner signup link instead.' },
    { status: 410 }
  );
}
