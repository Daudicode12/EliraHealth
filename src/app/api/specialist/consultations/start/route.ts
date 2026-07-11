import { NextRequest, NextResponse } from 'next/server';
import { requireSpecialist } from '@/lib/auth/specialist';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';
import { z } from 'zod';

const startSchema = z.object({
  appointmentId: z.string().min(1),
});


export async function POST(req: NextRequest) {
  try {
    const auth = await requireSpecialist(req);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;


    const expert = await getExpertByUserId(userId);
    if (!expert) return NextResponse.json({ error: 'Specialist not found' }, { status: 404 });

    const body = await req.json();
    const { appointmentId } = startSchema.parse(body);

    const consultationId = await ConsultationService.startConsultation(appointmentId, expert.id);

    return NextResponse.json({ consultationId }, { status: 201 });
  } catch (error) {
    console.error('Start Consultation Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
