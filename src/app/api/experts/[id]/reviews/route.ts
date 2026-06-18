import { NextRequest, NextResponse } from 'next/server';
import { getExpertReviews } from '@/lib/db/queries';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await getExpertReviews(id);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Fetch Expert Reviews Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
