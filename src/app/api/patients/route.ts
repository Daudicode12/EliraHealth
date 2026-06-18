import { NextRequest, NextResponse } from 'next/server';
import { getAllPatients } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    const patients = await getAllPatients({ limit, offset });
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Fetch Patients Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
