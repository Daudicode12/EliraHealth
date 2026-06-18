import { NextRequest, NextResponse } from 'next/server';
import { createReview, getConsultationById } from '@/lib/db/queries';
import { z } from 'zod';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  isAnonymous: z.boolean().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validatedData = reviewSchema.parse(body);
    
    const consultation = await getConsultationById(id);
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }
    
    await createReview({
      consultation_id: id,
      client_id: consultation.client_id,
      expert_id: consultation.expert_id,
      rating: validatedData.rating,
      comment: validatedData.comment,
      is_anonymous: validatedData.isAnonymous ? 1 : 0,
    });
    
    return NextResponse.json({ success: true, message: 'Review submitted' }, { status: 201 });
  } catch (error) {
    console.error('Submit Review Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
