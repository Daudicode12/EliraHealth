import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedExperts } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const specialty = searchParams.get('specialty') || undefined;
    
    const experts = await getVerifiedExperts({ specialty });
    return NextResponse.json(experts);
  } catch (error) {
    console.error('Fetch Experts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
