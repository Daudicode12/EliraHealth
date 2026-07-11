import { NextRequest, NextResponse } from 'next/server';
import { requireSpecialist } from '@/lib/auth/specialist';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';
import { z } from 'zod';

const completeSchema = z.object({
  chief_complaint: z.string().min(1, 'Chief complaint is required'),
  symptoms: z.string().optional(),
  assessment: z.string().min(1, 'Assessment is required'),
  recommendations: z.string().optional(),
  follow_up_required: z.union([z.boolean(), z.number()]).optional(),
  follow_up_date: z.string().optional(),
});


export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSpecialist(req);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;


    const expert = await getExpertByUserId(userId);
    if (!expert) return NextResponse.json({ error: 'Specialist not found' }, { status: 404 });

    const { id } = await params;
    const body = await req.json();
    const validatedNotes = completeSchema.parse(body);

    const notesData = {
      ...validatedNotes,
      follow_up_required: validatedNotes.follow_up_required ? 1 : 0,
    };

    await ConsultationService.completeConsultation(id, expert.id, notesData);

    return NextResponse.json({ success: true, message: 'Consultation completed' });
  } catch (error) {
    console.error('Complete Consultation Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
