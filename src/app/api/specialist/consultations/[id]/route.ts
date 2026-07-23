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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
