import { NextRequest, NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/db/queries';
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    
    const profile = await getProfileByEmail(validatedData.email);
    
    if (!profile || !profile.password_hash) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    if (profile.status === 'suspended' || profile.status === 'deleted' || profile.status === 'inactive') {
      return NextResponse.json({ success: false, error: 'Account disabled' }, { status: 403 });
    }
    
    const isValid = await bcrypt.compare(validatedData.password, profile.password_hash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    
    const jwtPayload = {
      userId: profile.id,
      role: profile.role,
      email: profile.email,
      status: profile.status || 'active'
    };

    const accessToken = signAccessToken(jwtPayload);
    const refreshToken = signRefreshToken(jwtPayload);
    
    const response = NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      }
    });
    
    response.cookies.set('auth-token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Login Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
