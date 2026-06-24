import { NextRequest, NextResponse } from 'next/server';
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

export async function PATCH(
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
