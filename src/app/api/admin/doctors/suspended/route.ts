import { NextRequest, NextResponse } from 'next/server';
import { getExpertsByStatus } from '@/lib/db/queries';

export async function GET() {
  try {
    const doctors = await getExpertsByStatus('suspended');
    return NextResponse.json({ success: true, data: doctors });
  } catch (error) {
    console.error('Fetch Suspended Doctors Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
