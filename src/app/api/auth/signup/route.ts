import { NextRequest, NextResponse } from 'next/server';
import { createProfile, createExpert } from '@/lib/db/queries';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional(),
  // Expert specific fields
  specialties: z.array(z.string()).optional(),
  credentials: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  hourlyRate: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = signupSchema.parse(body);
    
    const userId = crypto.randomUUID();
    let passwordHash = null;
    
    if (validatedData.password) {
      passwordHash = await bcrypt.hash(validatedData.password, 10);
    }
    
    // 1. Create Profile
    await createProfile({
      id: userId,
      email: validatedData.email,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      phone_number: validatedData.phoneNumber,
      role: validatedData.specialties ? 'expert' : 'user',
      password_hash: passwordHash,
    });
    
    // 2. If it's an expert, create expert record
    if (validatedData.specialties) {
      await createExpert({
        user_id: userId,
        display_name: `${validatedData.firstName} ${validatedData.lastName}`,
        specialties: JSON.stringify(validatedData.specialties),
        license_number: validatedData.credentials || null,
        years_of_experience: validatedData.yearsOfExperience || 0,
        hourly_rate: validatedData.hourlyRate || 0,
        verification_status: 'pending',
      });
      
      const { createNotification } = await import('@/lib/services/notification.service');
      const { getMany } = await import('@/lib/db/client');
      
      // Notify Specialist
      await createNotification({
        userId,
        title: "Credentials Submitted",
        message: "Credentials submitted successfully. Awaiting admin review.",
        type: "system"
      });

      // Notify Admins
      const admins = await getMany<{id: string}>('SELECT id FROM profiles WHERE role = "admin"');
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title: "New Specialist Application",
          message: `Dr. ${validatedData.firstName} ${validatedData.lastName} has submitted an application for review.`,
          type: "system",
          actionUrl: "/admin/doctors"
        });
      }
    }
    
    const jwtPayload = {
      userId,
      role: (validatedData.specialties ? 'expert' : 'user') as 'expert' | 'user',
      email: validatedData.email,
      status: validatedData.specialties ? 'pending_verification' : 'active'
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    
    const response = NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: jwtPayload.role
      }
    }, { status: 201 });
    
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Signup Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
