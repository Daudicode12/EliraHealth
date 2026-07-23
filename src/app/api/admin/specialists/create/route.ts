// src/app/api/admin/specialists/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/roles';
import { getProfileByEmail, createSpecialistByAdmin } from '@/lib/db/queries';
import { addSpecialistSchema } from '@/lib/schemas/specialist';
import { generateTempPassword } from '@/lib/utils/password';
import { sendSpecialistCredentialsEmail } from '@/lib/services/email';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify user is admin
    const adminCheck = await requireAdmin(req);
    if (adminCheck instanceof NextResponse) {
      return adminCheck;
    }

    // 2. Parse and validate input
    const body = await req.json();
    const validatedData = addSpecialistSchema.parse(body);

    // 3. Check if email already exists
    const existingProfile = await getProfileByEmail(validatedData.email);
    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 409 }
      );
    }

    // 4. Generate secure temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    // 5. Generate secure UUID for the new expert user
    const userId = crypto.randomUUID();

    // 6. Create specialist records in DB
    await createSpecialistByAdmin({
      userId,
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      phoneNumber: validatedData.phoneNumber,
      specialties: validatedData.specialties,
      yearsOfExperience: validatedData.yearsOfExperience,
      credentials: validatedData.credentials,
      hospital: validatedData.hospital,
      bio: validatedData.bio,
      hourlyRate: validatedData.hourlyRate,
      passwordHash,
    });

    // 7. Send credentials email
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const loginUrl = `${origin}/login`;

    await sendSpecialistCredentialsEmail({
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      tempPassword,
      loginUrl,
    });

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: 'Specialist created successfully',
      specialistId: userId,
      email: validatedData.email,
      tempPassword,
      nextSteps: 'Email with login credentials has been sent',
    });

  } catch (error) {
    console.error('Create Specialist Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
