"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
  signSession,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const username = parsed.data.username.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) redirect("/login?error=invalid");

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) redirect("/login?error=invalid");

  const token = await signSession({
    userId: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  });
  await setSessionCookie(token);
  redirect("/teams");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function requireStaffSession() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "COACH")) {
    redirect("/login");
  }
  return session;
}
