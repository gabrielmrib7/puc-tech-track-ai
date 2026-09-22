import type { UserRole } from "@prisma/client";

export const staffRoles: readonly UserRole[] = ["ADMIN", "ATTENDANT", "TECHNICIAN"];

export function hasRole(role: UserRole | null | undefined, allowedRoles: readonly UserRole[]) {
  return role !== null && role !== undefined && allowedRoles.includes(role);
}

export function isStaffRole(role: UserRole | null | undefined) {
  return hasRole(role, staffRoles);
}

export function getPostLoginPath(role: UserRole) {
  return role === "CUSTOMER" ? "/portal" : "/admin/dashboard";
}
