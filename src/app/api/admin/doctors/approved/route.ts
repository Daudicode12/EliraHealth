import { NextRequest, NextResponse } from 'next/server';
import { getExpertsByStatus } from '@/lib/db/queries';

export async function GET() {
  try {
    const doctors = await getExpertsByStatus('approved');
    return NextResponse.json({ success: true, data: doctors });
  } catch (error) {
    console.error('Fetch Approved Doctors Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
