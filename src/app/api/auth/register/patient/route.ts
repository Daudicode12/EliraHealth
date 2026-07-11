import { NextRequest, NextResponse } from 'next/server';
import { createProfile, getProfileByEmail } from '@/lib/db/queries';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    
    const existingUser = await getProfileByEmail(validatedData.email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);
    const userId = crypto.randomUUID();
    
    await createProfile({
      id: userId,
      email: validatedData.email,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      phone_number: validatedData.phoneNumber,
      role: 'user',
      password_hash: passwordHash,
      status: 'active'
    });
    
    const jwtPayload = {
      userId,
      role: 'user' as const,
      email: validatedData.email,
      status: 'active'
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'user'
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Register Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
