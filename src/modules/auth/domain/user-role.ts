export type Role = "ADMIN" | "EDITOR" | "CLIENT";

export const ROLES = ["ADMIN", "EDITOR", "CLIENT"] as const;

export function isRole(value: unknown): value is Role {
  return ROLES.includes(value as Role);
}
