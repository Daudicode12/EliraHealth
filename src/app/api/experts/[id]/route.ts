import { NextRequest, NextResponse } from 'next/server';
import { getExpertById } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expert = await getExpertById(id);
    
    if (!expert) {
      return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
    }
    
    return NextResponse.json(expert);
  } catch (error) {
    console.error('Fetch Expert Details Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
