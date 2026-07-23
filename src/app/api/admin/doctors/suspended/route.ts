import { NextRequest, NextResponse } from 'next/server';
import { getExpertsByStatus } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const doctors = await getExpertsByStatus('suspended');
    return NextResponse.json({ success: true, data: doctors });
  } catch (error) {
    console.error('Fetch Suspended Doctors Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
