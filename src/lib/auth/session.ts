import { cookies } from "next/headers";
import * as jose from "jose";
import { z } from "zod";
import type { SessionPayload } from "./types";
import { getEnv } from "@/lib/env";

export const SESSION_COOKIE_NAME = "pat_session";

const sessionSchema = z.object({
  sub: z.literal("pat"),
  userId: z.string(),
  username: z.string(),
  name: z.string(),
  role: z.enum(["ADMIN", "COACH", "PLAYER"]),
});

function encSecret() {
  return new TextEncoder().encode(getEnv().SESSION_SECRET);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return await new jose.SignJWT({
    sub: "pat",
    userId: payload.userId,
    username: payload.username,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload: raw } = await jose.jwtVerify(token, encSecret(), {
      algorithms: ["HS256"],
    });
    const parsed = sessionSchema.safeParse(raw);
    if (!parsed.success) return null;
    const p = parsed.data;
    return {
      userId: p.userId,
      username: p.username,
      name: p.name,
      role: p.role,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
