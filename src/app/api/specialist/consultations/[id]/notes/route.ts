import { NextRequest, NextResponse } from 'next/server';
import { requireSpecialist } from '@/lib/auth/specialist';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';
import { z } from 'zod';

const notesSchema = z.object({
  chief_complaint: z.string().optional(),
  symptoms: z.string().optional(),
  assessment: z.string().optional(),
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
    
    // Verify ownership
    const consultation = await ConsultationService.getConsultationById(id);
    if (!consultation || consultation.specialist_id !== expert.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validatedNotes = notesSchema.parse(body);
    
    // Convert boolean follow_up_required to number
    const notesData = {
      ...validatedNotes,
      follow_up_required: validatedNotes.follow_up_required ? 1 : 0,
    };

    await ConsultationService.saveConsultationNotes(id, notesData);

    return NextResponse.json({ success: true, message: 'Notes saved' });
  } catch (error) {
    console.error('Save Notes Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
