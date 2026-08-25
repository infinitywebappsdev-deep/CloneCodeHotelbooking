import { firestoreRest } from "./firebase-server";

/** Master administrator emails with guaranteed full backend and CMS privileges. */
export const MASTER_ADMIN_EMAILS = [
  "chrisbllack@gmail.com",
  "infinitywebappsdev@gmail.com",
  "nathandev1978@gmail.com",
];

export function isMasterAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return MASTER_ADMIN_EMAILS.some((admin) => admin.toLowerCase() === normalized);
}

export type RoleType =
  | "super_admin"
  | "admin"
  | "manager"
  | "front_desk"
  | "housekeeping"
  | "content_editor"
  | "accountant"
  | "staff";

export type PrivilegeKey =
  | "can_manage_users"
  | "can_manage_reservations"
  | "can_manage_rooms"
  | "can_manage_cms"
  | "can_manage_media"
  | "can_manage_branding"
  | "can_view_reports"
  | "can_view_audit_logs"
  | "can_dispatch_alerts"
  | "can_manage_finances";

export interface PrivilegeDefinition {
  key: PrivilegeKey;
  label: string;
  description: string;
  category: "operations" | "content" | "admin" | "security";
}

export const ALL_PRIVILEGES: PrivilegeDefinition[] = [
  {
    key: "can_manage_users",
    label: "Manage Users & Roles",
    description: "Create, edit, suspend staff users and assign granular permissions",
    category: "admin",
  },
  {
    key: "can_manage_reservations",
    label: "Manage Reservations",
    description: "View, confirm, check-in, check-out, and modify guest bookings",
    category: "operations",
  },
  {
    key: "can_manage_rooms",
    label: "Manage Rooms & Rates",
    description: "Edit room inventory, rates, amenities, photos, and live availability",
    category: "operations",
  },
  {
    key: "can_manage_cms",
    label: "Manage CMS Content & Pages",
    description: "Publish news articles, custom dynamic pages, FAQs, and testimonials",
    category: "content",
  },
  {
    key: "can_manage_media",
    label: "Manage Media Library",
    description: "Upload photography, videos, documents, and organize media folders",
    category: "content",
  },
  {
    key: "can_manage_branding",
    label: "Manage Hotel Branding & Settings",
    description: "Customize hotel profile, contact information, colors, and payment links",
    category: "admin",
  },
  {
    key: "can_view_reports",
    label: "View Financial & Occupancy Reports",
    description: "Access revenue analytics, occupancy metrics, and financial summaries",
    category: "operations",
  },
  {
    key: "can_view_audit_logs",
    label: "View Security Audit Trail",
    description: "Inspect user activity logs, login history, and administrative actions",
    category: "security",
  },
  {
    key: "can_dispatch_alerts",
    label: "Dispatch Staff Alerts",
    description: "Broadcast instant priority instructions and task dispatches to staff",
    category: "operations",
  },
  {
    key: "can_manage_finances",
    label: "Manage Payments & Invoices",
    description: "Adjust payment statuses, confirm bank transfers, and log transactions",
    category: "operations",
  },
];

export interface RoleDefinition {
  key: RoleType;
  label: string;
  description: string;
  badgeColor: string;
  defaultPrivileges: PrivilegeKey[];
}

export const ROLE_DEFINITIONS: Record<RoleType, RoleDefinition> = {
  super_admin: {
    key: "super_admin",
    label: "Super Administrator",
    description:
      "Full system authority with unconstrained control over all hotel operations and accounts.",
    badgeColor:
      "bg-purple-500/15 text-purple-600 border-purple-200 dark:border-purple-800 dark:text-purple-400",
    defaultPrivileges: ALL_PRIVILEGES.map((p) => p.key),
  },
  admin: {
    key: "admin",
    label: "Administrator",
    description:
      "Comprehensive management over hotel operations, staff users, rooms, CMS, and reports.",
    badgeColor:
      "bg-blue-500/15 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400",
    defaultPrivileges: ALL_PRIVILEGES.map((p) => p.key),
  },
  manager: {
    key: "manager",
    label: "Hotel Manager",
    description:
      "Day-to-day management of reservations, room availability, reports, staff dispatches, and CMS.",
    badgeColor:
      "bg-indigo-500/15 text-indigo-600 border-indigo-200 dark:border-indigo-800 dark:text-indigo-400",
    defaultPrivileges: [
      "can_manage_reservations",
      "can_manage_rooms",
      "can_manage_cms",
      "can_manage_media",
      "can_view_reports",
      "can_dispatch_alerts",
      "can_manage_finances",
    ],
  },
  front_desk: {
    key: "front_desk",
    label: "Front Desk & Concierge",
    description:
      "Guest check-in/out, reservation handling, guest inquiries, and departmental dispatches.",
    badgeColor:
      "bg-emerald-500/15 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400",
    defaultPrivileges: ["can_manage_reservations", "can_dispatch_alerts"],
  },
  housekeeping: {
    key: "housekeeping",
    label: "Housekeeping & Room Care",
    description:
      "Monitor room sanitation, turnover status, and respond to departmental task dispatches.",
    badgeColor:
      "bg-amber-500/15 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400",
    defaultPrivileges: ["can_dispatch_alerts"],
  },
  content_editor: {
    key: "content_editor",
    label: "Content & Marketing Editor",
    description:
      "Author and publish hotel news articles, custom dynamic pages, FAQs, and media assets.",
    badgeColor:
      "bg-rose-500/15 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400",
    defaultPrivileges: ["can_manage_cms", "can_manage_media"],
  },
  accountant: {
    key: "accountant",
    label: "Financial Accountant & Auditor",
    description:
      "Inspect revenue reports, occupancy analytics, payment statuses, and security audit logs.",
    badgeColor:
      "bg-cyan-500/15 text-cyan-600 border-cyan-200 dark:border-cyan-800 dark:text-cyan-400",
    defaultPrivileges: ["can_view_reports", "can_view_audit_logs", "can_manage_finances"],
  },
  staff: {
    key: "staff",
    label: "General Hotel Staff",
    description: "General staff portal access with departmental emergency broadcast view.",
    badgeColor: "bg-muted text-muted-foreground border-border",
    defaultPrivileges: ["can_dispatch_alerts"],
  },
};

export function getDefaultPrivilegesForRole(role: RoleType): PrivilegeKey[] {
  return ROLE_DEFINITIONS[role]?.defaultPrivileges || ["can_dispatch_alerts"];
}

export type AuthContext = {
  userId: string;
  claims?: Record<string, unknown>;
};

export interface UserRoleRecord {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: RoleType;
  privileges: PrivilegeKey[];
  department?: string;
  phone?: string;
  status: "active" | "suspended" | "pending_invite";
  notes?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  created_by?: string;
}

/**
 * Asserts that the authenticated user has staff or admin privileges.
 * Guaranteed for configured master admins, stored user_roles, or initial setup.
 */
export async function assertStaff(context: AuthContext): Promise<void> {
  const userEmail = (context.claims?.["email"] as string) || "";
  if (isMasterAdmin(userEmail)) {
    return;
  }

  const roles = await firestoreRest.list<UserRoleRecord>("user_roles");

  // If no roles exist in the database at all, allow initial setup
  if (!roles || roles.length === 0) {
    return;
  }

  const userRec = roles.find(
    (r) =>
      r.user_id === context.userId ||
      (r.email && r.email.toLowerCase() === userEmail.toLowerCase()),
  );

  if (!userRec) {
    throw new Error("Forbidden: Staff or Administrator access required.");
  }

  if (userRec.status === "suspended") {
    throw new Error("Forbidden: Your staff account has been suspended by an administrator.");
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

  const roles = await firestoreRest.list<UserRoleRecord>("user_roles");

  if (!roles || roles.length === 0) {
    return;
  }

  const userRec = roles.find(
    (r) =>
      r.user_id === context.userId ||
      (r.email && r.email.toLowerCase() === userEmail.toLowerCase()),
  );

  if (!userRec) {
    throw new Error("Forbidden: Administrator access required.");
  }

  if (userRec.status === "suspended") {
    throw new Error("Forbidden: Your staff account has been suspended.");
  }

  if (userRec.role !== "admin" && userRec.role !== "super_admin") {
    throw new Error("Forbidden: Full Administrator access required.");
  }
}

/**
 * Asserts that the user has a specific privilege or is a super_admin / admin / master admin.
 */
export async function assertPrivilege(
  context: AuthContext,
  privilege: PrivilegeKey,
): Promise<void> {
  const userEmail = (context.claims?.["email"] as string) || "";
  if (isMasterAdmin(userEmail)) {
    return;
  }

  const roles = await firestoreRest.list<UserRoleRecord>("user_roles");

  if (!roles || roles.length === 0) {
    return;
  }

  const userRec = roles.find(
    (r) =>
      r.user_id === context.userId ||
      (r.email && r.email.toLowerCase() === userEmail.toLowerCase()),
  );

  if (!userRec) {
    throw new Error("Forbidden: Access denied.");
  }

  if (userRec.status === "suspended") {
    throw new Error("Forbidden: Your account has been suspended.");
  }

  if (userRec.role === "super_admin" || userRec.role === "admin") {
    return;
  }

  const userPrivileges = Array.isArray(userRec.privileges)
    ? userRec.privileges
    : getDefaultPrivilegesForRole(userRec.role);

  if (!userPrivileges.includes(privilege)) {
    throw new Error(`Forbidden: You do not have permission for '${privilege}'.`);
  }
}

/**
 * Evaluates the staff/admin status and effective privileges of a user.
 */
export async function getUserStaffStatus(userId: string, email?: string) {
  const userEmail = email || "";
  const isMaster = isMasterAdmin(userEmail);

  const roles = await firestoreRest.list<UserRoleRecord>("user_roles");

  const userRec = (roles || []).find(
    (r) =>
      r.user_id === userId ||
      (userEmail && r.email && r.email.toLowerCase() === userEmail.toLowerCase()),
  );

  const adminCount = (roles || []).filter(
    (r) => r.role === "admin" || r.role === "super_admin",
  ).length;

  const isSuspended = userRec?.status === "suspended";

  let effectiveRole: RoleType | "guest" = "guest";
  let effectivePrivileges: PrivilegeKey[] = [];

  if (isMaster) {
    effectiveRole = "super_admin";
    effectivePrivileges = ALL_PRIVILEGES.map((p) => p.key);
  } else if (userRec) {
    effectiveRole = userRec.role || "staff";
    effectivePrivileges =
      Array.isArray(userRec.privileges) && userRec.privileges.length > 0
        ? userRec.privileges
        : getDefaultPrivilegesForRole(effectiveRole);
  } else if ((roles || []).length === 0) {
    // Initial system setup bootstrap
    effectiveRole = "super_admin";
    effectivePrivileges = ALL_PRIVILEGES.map((p) => p.key);
  }

  const isStaffMember =
    !isSuspended &&
    (isMaster ||
      effectiveRole === "super_admin" ||
      effectiveRole === "admin" ||
      effectiveRole === "manager" ||
      effectiveRole === "front_desk" ||
      effectiveRole === "housekeeping" ||
      effectiveRole === "content_editor" ||
      effectiveRole === "accountant" ||
      effectiveRole === "staff" ||
      (roles || []).length === 0);

  const isAdminMember =
    !isSuspended &&
    (isMaster ||
      effectiveRole === "super_admin" ||
      effectiveRole === "admin" ||
      (roles || []).length === 0);

  const isSuperAdminMember =
    !isSuspended && (isMaster || effectiveRole === "super_admin" || (roles || []).length === 0);

  return {
    isStaff: isStaffMember,
    isAdmin: isAdminMember,
    isSuperAdmin: isSuperAdminMember,
    role: effectiveRole,
    privileges: effectivePrivileges,
    status: userRec?.status || (isMaster ? "active" : "active"),
    isSuspended,
    canBootstrap: !isMaster && adminCount === 0,
    email: userEmail,
    fullName: userRec?.full_name || "",
    department: userRec?.department || "",
  };
}
