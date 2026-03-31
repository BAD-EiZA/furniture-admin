import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./constants";

export type SessionRole = "SUPER_ADMIN" | "ADMIN" | "SALES";

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: SessionRole;
};

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signSession(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: String(payload.userId),
      name: String(payload.name),
      email: String(payload.email),
      role: payload.role as SessionRole,
    };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  return verifySession(token);
}
