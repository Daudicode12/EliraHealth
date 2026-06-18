import { NextResponse } from 'next/server';
import { getPendingExperts } from '@/lib/db/queries';

export async function GET() {
  try {
    // Role check should be handled by middleware, but we'll keep it in mind
    const experts = await getPendingExperts();
    return NextResponse.json(experts);
  } catch (error) {
    console.error('Fetch Pending Experts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
