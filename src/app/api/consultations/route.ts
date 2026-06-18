import { NextRequest, NextResponse } from 'next/server';
import { 
  createConsultation, 
  getPatientConsultations, 
  getExpertConsultations 
} from '@/lib/db/queries';
import { z } from 'zod';

const consultationSchema = z.object({
  expertId: z.string(),
  clientId: z.string(),
  scheduledAt: z.string().optional(),
  issueCategory: z.string(),
  issueDescription: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = consultationSchema.parse(body);
    
    const consultationId = await createConsultation({
      client_id: validatedData.clientId,
      expert_id: validatedData.expertId,
      scheduled_at: validatedData.scheduledAt,
      issue_category: validatedData.issueCategory,
      issue_description: validatedData.issueDescription,
    });
    
    return NextResponse.json({
      consultationId,
      status: 'pending'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create Consultation Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const expertId = searchParams.get('expertId');
    
    if (clientId) {
      const consultations = await getPatientConsultations(clientId);
      return NextResponse.json(consultations);
    }
    
    if (expertId) {
      const consultations = await getExpertConsultations(expertId);
      return NextResponse.json(consultations);
    }
    
    return NextResponse.json({ error: 'Missing clientId or expertId' }, { status: 400 });
    
  } catch (error) {
    console.error('Fetch Consultations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
