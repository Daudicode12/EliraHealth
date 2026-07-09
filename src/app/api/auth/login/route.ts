import { NextRequest, NextResponse } from 'next/server';
import { getProfileByEmail } from '@/lib/db/queries';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    
    const profile = await getProfileByEmail(validatedData.email);
    
    if (!profile) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // In a real app, we'd verify the password here.
    // For this implementation, we'll assume any password works if the email exists.
    
    // Generate a proper mock-jwt token that roles.ts expects
    const payload = JSON.stringify({
      userId: profile.id,
      role: profile.role,
      status: profile.status || 'active'
    });
    const mockToken = `mock-jwt-\${Buffer.from(payload).toString('base64')}`;
    
    const response = NextResponse.json({
      userId: profile.id,
      role: profile.role,
      token: mockToken,
    });
    
    response.cookies.set('auth-token', mockToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('Login Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
