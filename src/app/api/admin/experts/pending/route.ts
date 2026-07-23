import { NextRequest, NextResponse } from 'next/server';
import { getPendingExperts } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const experts = await getPendingExperts();
    return NextResponse.json(experts);
  } catch (error) {
    console.error('Fetch Pending Experts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
