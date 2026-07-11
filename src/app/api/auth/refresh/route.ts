import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, signAccessToken } from '@/lib/auth/jwt';
import { getOne } from '@/lib/db/queries';
import { Profile } from '@/lib/db/types';
import { z } from 'zod';

const refreshSchema = z.object({
  refreshToken: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = refreshSchema.parse(body);

    const payload = verifyToken(validatedData.refreshToken);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const profile = await getOne<Profile>("SELECT id, status, role FROM profiles WHERE id = ?", [payload.userId]);
    if (!profile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 401 });
    }

    const status = profile.status || "active";
    if (status === "deleted" || status === "suspended" || status === "inactive") {
      return NextResponse.json({ success: false, error: `User is ${status}` }, { status: 403 });
    }

    const newAccessToken = signAccessToken({
      userId: profile.id,
      role: profile.role,
      email: profile.email,
      status: status
    });

    const response = NextResponse.json({
      success: true,
      accessToken: newAccessToken
    });

    response.cookies.set('auth-token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 mins
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Refresh Token Error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
