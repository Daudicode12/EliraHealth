import { NextRequest, NextResponse } from 'next/server';
import { ConsultationService } from '@/services/consultation.service';
import { getExpertByUserId } from '@/lib/db/queries';
import { z } from 'zod';

const startSchema = z.object({
  appointmentId: z.string().min(1),
});

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

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value;
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
