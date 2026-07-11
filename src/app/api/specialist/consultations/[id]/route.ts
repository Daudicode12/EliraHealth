import { NextRequest, NextResponse } from 'next/server';
import { requireSpecialist } from '@/lib/auth/specialist';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';


export async function GET(
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
    const consultation = await ConsultationService.getConsultationById(id);
    
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    // Security: verify specialist owns this consultation
    if (consultation.specialist_id !== expert.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notes = await ConsultationService.getConsultationNotes(id);

    return NextResponse.json({ consultation, notes });
  } catch (error) {
    console.error('Get Consultation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
