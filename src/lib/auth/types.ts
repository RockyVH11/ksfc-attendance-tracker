import type { UserRole } from "@prisma/client";

export type SessionPayload = {
  userId: string;
  username: string;
  name: string;
  role: UserRole;
};

export function isStaffRole(role: UserRole) {
  return role === "ADMIN" || role === "COACH";
}
