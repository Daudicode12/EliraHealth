import { NextRequest, NextResponse } from 'next/server';
import { requireSpecialist } from '@/lib/auth/specialist';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';


export async function GET(req: NextRequest) {
  try {
    const auth = await requireSpecialist(req);
    if (auth instanceof NextResponse) return auth;
    const userId = auth.userId;


    const expert = await getExpertByUserId(userId);
    if (!expert) return NextResponse.json({ error: 'Specialist not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'upcoming';

    let consultations;
    switch (status) {
      case 'in_progress':
        consultations = await ConsultationService.getInProgressConsultations(expert.id);
        break;
      case 'completed':
        consultations = await ConsultationService.getCompletedConsultations(expert.id);
        break;
      default:
        consultations = await ConsultationService.getUpcomingConsultations(expert.id);
    }

    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Get Consultations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
