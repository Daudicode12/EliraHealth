import { NextResponse } from 'next/server';
import { getPendingConsultations } from '@/lib/db/queries';

export async function GET() {
  try {
    const consultations = await getPendingConsultations();
    return NextResponse.json(consultations);
  } catch (error) {
    console.error('Fetch Pending Consultations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
