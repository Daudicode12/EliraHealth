import { NextRequest, NextResponse } from 'next/server';
import { getExpertAvailability } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const availability = await getExpertAvailability(id);
    return NextResponse.json(availability);
  } catch (error) {
    console.error('Fetch Expert Availability Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
