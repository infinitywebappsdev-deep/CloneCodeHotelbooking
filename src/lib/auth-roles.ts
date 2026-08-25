import { firestoreRest } from "./firebase-server";

/** Master administrator emails with guaranteed full backend and CMS privileges. */
export const MASTER_ADMIN_EMAILS = ["chrisbllack@gmail.com", "infinitywebappsdev@gmail.com"];

export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return MASTER_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}

export type AuthContext = {
  userId: string;
  claims?: Record<string, unknown>;
};

/**
 * Asserts that the authenticated user has staff or admin privileges.
 * Guaranteed for configured master admins, stored user_roles, or initial setup.
 */
export async function assertStaff(context: AuthContext): Promise<void> {
  const userEmail = (context.claims?.["email"] as string) || "";
  if (isMasterAdmin(userEmail)) {
    return;
  }

  const roles = await firestoreRest.list<{
    id?: string;
    user_id: string;
    role: string;
    email?: string;
  }>("user_roles");

  // If no roles exist in the database at all, allow initial setup
  if (!roles || roles.length === 0) {
    return;
  }

  const matched = roles.some(
    (r) =>
      (r.user_id === context.userId ||
        (r.email && r.email.toLowerCase() === userEmail.toLowerCase())) &&
      (r.role === "admin" || r.role === "staff"),
  );

  if (!matched) {
    throw new Error("Forbidden: Staff or Administrator access required.");
  }
}

/**
 * Asserts that the authenticated user has full Administrator privileges.
 */
export async function assertAdmin(context: AuthContext): Promise<void> {
  const userEmail = (context.claims?.["email"] as string) || "";
  if (isMasterAdmin(userEmail)) {
    return;
  }

  const roles = await firestoreRest.list<{
    id?: string;
    user_id: string;
    role: string;
    email?: string;
  }>("user_roles");

  if (!roles || roles.length === 0) {
    return;
  }

  const matched = roles.some(
    (r) =>
      (r.user_id === context.userId ||
        (r.email && r.email.toLowerCase() === userEmail.toLowerCase())) &&
      r.role === "admin",
  );

  if (!matched) {
    throw new Error("Forbidden: Administrator access required.");
  }
}

/**
 * Evaluates the staff/admin status of a user.
 */
export async function getUserStaffStatus(userId: string, email?: string) {
  const userEmail = email || "";
  const isMaster = isMasterAdmin(userEmail);

  const roles = await firestoreRest.list<{
    id: string;
    user_id: string;
    role: string;
    email?: string;
  }>("user_roles");

  const matchingRoles = (roles || [])
    .filter(
      (r) =>
        r.user_id === userId ||
        (userEmail && r.email && r.email.toLowerCase() === userEmail.toLowerCase()),
    )
    .map((r) => r.role);

  const adminCount = (roles || []).filter((r) => r.role === "admin").length;
  const isStaffMember =
    isMaster ||
    matchingRoles.includes("admin") ||
    matchingRoles.includes("staff") ||
    (roles || []).length === 0;
  const isAdminMember = isMaster || matchingRoles.includes("admin") || (roles || []).length === 0;

  return {
    isStaff: isStaffMember,
    isAdmin: isAdminMember,
    canBootstrap: !isMaster && adminCount === 0,
    email: userEmail,
  };
}
