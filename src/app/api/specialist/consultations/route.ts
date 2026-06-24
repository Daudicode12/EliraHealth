import { NextRequest, NextResponse } from 'next/server';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';

function getUserIdFromToken(token: string | undefined): string | null {
  if (!token) return null;
  let userId = token.replace('mock-token-', '');
  if (token.startsWith('mock-jwt-')) {
    try {
      const decoded = JSON.parse(Buffer.from(token.replace('mock-jwt-', ''), 'base64').toString('utf-8'));
      userId = decoded.id;
    } catch(e) { return null; }
  }
  return userId || null;
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
