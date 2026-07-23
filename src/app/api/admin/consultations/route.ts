import { NextRequest, NextResponse } from 'next/server';
import { getPendingConsultations } from '@/lib/db/queries';
import { requireAdmin } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const consultations = await getPendingConsultations();
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Fetch Pending Consultations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
