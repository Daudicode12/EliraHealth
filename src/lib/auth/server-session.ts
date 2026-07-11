import { cookies } from 'next/headers';
import { verifyToken, JWTPayload } from './jwt';

export async function getServerSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return null;

  return verifyToken(token);
}
