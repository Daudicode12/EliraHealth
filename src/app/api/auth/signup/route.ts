import { NextRequest, NextResponse } from 'next/server';
import { createProfile, createExpert } from '@/lib/db/queries';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
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
    
    // In a real app, we'd hash the password here if provided.
    // For this implementation, we'll focus on the data structure as requested.
    const userId = crypto.randomUUID();
    
    // 1. Create Profile
    await createProfile({
      id: userId,
      email: validatedData.email,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      phone_number: validatedData.phoneNumber,
      role: validatedData.specialties ? 'expert' : 'user',
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
    
    return NextResponse.json({
      userId,
      status: validatedData.specialties ? 'pending_verification' : 'active'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
