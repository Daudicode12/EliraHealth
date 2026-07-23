import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload {
  id: string;
  role: string;
  status: string;
  [key: string]: unknown;
}

const secret = process.env.AUTH_SECRET;
if (!secret) {
  throw new Error("AUTH_SECRET environment variable is not set");
}
const encodedSecret = new TextEncoder().encode(secret);

const SESSION_DURATION = "7d";

/** Sign a session payload into a real, verifiable JWT. */
export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(encodedSecret);
}

/** Verify and decode a session JWT. Returns null if invalid, tampered, or expired. */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedSecret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/** Read and verify the session from the current request's cookies (Server Components/Actions). */
export async function getServerSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get("auth-token")?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/** Set the signed session cookie on the current response (Server Actions only). */
export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await createSessionToken(payload);
  (await cookies()).set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}
