import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  setUserStatus,
  resetUserPassword,
  getStaffStatus,
} from "@/lib/admin.functions";
import {
  ROLE_DEFINITIONS,
  ALL_PRIVILEGES,
  getDefaultPrivilegesForRole,
  RoleType,
  PrivilegeKey,
  UserRoleRecord,
} from "@/lib/auth-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Shield,
  UserPlus,
  Users,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Lock,
  Mail,
  Phone,
  Building,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Info,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "User & Role Management — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "Manage staff accounts, assign hotel operational roles, and configure granular permissions.",
      },
    ],
  }),
  component: AdminUsersPage,
});

const DEPARTMENTS = [
  "Executive Management",
  "Front Office & Reception",
  "Housekeeping & Facilities",
  "Food & Beverage",
  "Sales & Marketing",
  "Accounts & Finance",
  "Security & IT",
  "General Staff",
];

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRoleRecord | null>(null);

  // Form states for Create/Edit
  const [formFullName, setFormFullName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<RoleType>("staff");
  const [formPrivileges, setFormPrivileges] = useState<PrivilegeKey[]>([]);
  const [formDepartment, setFormDepartment] = useState("Front Office & Reception");
  const [formPhone, setFormPhone] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "suspended" | "pending_invite">("active");
  const [formNotes, setFormNotes] = useState("");

  // Password reset modal state
  const [newPassword, setNewPassword] = useState("");
  const [sendResetEmailOnly, setSendResetEmailOnly] = useState(false);

  // Staff status of currently logged in user
  const { data: currentStaff } = useQuery({
    queryKey: ["staff-status"],
    queryFn: () => getStaffStatus(),
  });

  // Fetch all staff users
  const {
    data: users = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: () => listUsers(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: {
      email: string;
      password?: string;
      full_name?: string;
      role: RoleType;
      privileges?: PrivilegeKey[];
      department?: string;
      phone?: string;
      status?: "active" | "suspended" | "pending_invite";
      notes?: string;
    }) => createUser({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success("User account created successfully!");
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create user account.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      id: string;
      full_name?: string;
      role: RoleType;
      privileges: PrivilegeKey[];
      department?: string;
      phone?: string;
      status: "active" | "suspended" | "pending_invite";
      notes?: string;
    }) => updateUser({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success("User privileges and profile updated!");
      setEditDialogOpen(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update user account.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (data: { id: string; status: "active" | "suspended" | "pending_invite" }) =>
      setUserStatus({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success("Account status updated.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update status.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (data: { id: string }) => deleteUser({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      toast.success("User removed from hotel staff directory.");
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete user.");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { email: string; newPassword?: string; sendEmail?: boolean }) =>
      resetUserPassword({ data }),
    onSuccess: (res) => {
      toast.success(res.message || "Password updated successfully.");
      setPasswordDialogOpen(false);
      setNewPassword("");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to reset password.");
    },
  });

  function resetForm() {
    setFormFullName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("front_desk");
    setFormPrivileges(getDefaultPrivilegesForRole("front_desk"));
    setFormDepartment("Front Office & Reception");
    setFormPhone("");
    setFormStatus("active");
    setFormNotes("");
  }

  function handleOpenCreate() {
    resetForm();
    setCreateDialogOpen(true);
  }

  function handleOpenEdit(user: UserRoleRecord) {
    setSelectedUser(user);
    setFormFullName(user.full_name || "");
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPrivileges(
      Array.isArray(user.privileges) && user.privileges.length > 0
        ? user.privileges
        : getDefaultPrivilegesForRole(user.role),
    );
    setFormDepartment(user.department || "Front Office & Reception");
    setFormPhone(user.phone || "");
    setFormStatus(user.status || "active");
    setFormNotes(user.notes || "");
    setEditDialogOpen(true);
  }

  function handleRoleChange(newRole: RoleType) {
    setFormRole(newRole);
    setFormPrivileges(getDefaultPrivilegesForRole(newRole));
  }

  function togglePrivilege(privKey: PrivilegeKey) {
    setFormPrivileges((prev) =>
      prev.includes(privKey) ? prev.filter((k) => k !== privKey) : [...prev, privKey],
    );
  }

  function selectAllPrivileges() {
    setFormPrivileges(ALL_PRIVILEGES.map((p) => p.key));
  }

  function resetPrivilegesToRoleDefault() {
    setFormPrivileges(getDefaultPrivilegesForRole(formRole));
  }

  function generateRandomPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pass);
    setNewPassword(pass);
  }

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.full_name && u.full_name.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q));

    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchDept = deptFilter === "all" || u.department === deptFilter;
    const matchStatus = statusFilter === "all" || (u.status || "active") === statusFilter;

    return matchQuery && matchRole && matchDept && matchStatus;
  });

  // Counts
  const totalCount = users.length;
  const activeCount = users.filter((u) => (u.status || "active") === "active").length;
  const adminCount = users.filter((u) => u.role === "admin" || u.role === "super_admin").length;
  const opsCount = users.filter((u) =>
    ["manager", "front_desk", "housekeeping", "content_editor", "accountant"].includes(u.role),
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl tracking-tight">Users & Access Control</h1>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              Role-Based Access
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage staff credentials, assign operational departments, and configure fine-grained
            system privileges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button onClick={handleOpenCreate} className="gap-2 shadow-sm">
            <UserPlus className="h-4 w-4" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4 border-border/60 bg-card/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Users</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 font-serif text-2xl">{isLoading ? "…" : totalCount}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">Registered team accounts</p>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Staff</span>
            <UserCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 font-serif text-2xl text-emerald-600 dark:text-emerald-400">
            {isLoading ? "…" : activeCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Operational status</p>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Administrators</span>
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 font-serif text-2xl text-purple-600 dark:text-purple-400">
            {isLoading ? "…" : adminCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Full system authorities</p>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Operations & Desk</span>
            <Building className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 font-serif text-2xl text-indigo-600 dark:text-indigo-400">
            {isLoading ? "…" : opsCount}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Department specialists</p>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4 border-border/60 bg-card/80">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by staff name, email, department or phone…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5" />
              <span>Role:</span>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Roles</option>
              {Object.entries(ROLE_DEFINITIONS).map(([key, def]) => (
                <option key={key} value={key}>
                  {def.label}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <span>Dept:</span>
            </div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary max-w-[160px]"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-2">
              <span>Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_invite">Pending Setup</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Staff Directory Table */}
      <Card className="overflow-hidden border-border/60 bg-card/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">User & Identity</th>
                <th className="px-4 py-3.5">Role & Badge</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Privileges Matrix</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <RefreshCw className="mx-auto h-6 w-6 animate-spin text-primary" />
                    <p className="mt-2 text-sm">Loading staff directory and permissions…</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Users className="mx-auto h-8 w-8 opacity-40" />
                    <p className="mt-2 font-medium">No users match your criteria</p>
                    <p className="text-xs text-muted-foreground">
                      Try clearing filters or search queries, or add a new staff member.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleDef = ROLE_DEFINITIONS[user.role] || ROLE_DEFINITIONS.staff;
                  const privCount = Array.isArray(user.privileges) ? user.privileges.length : 0;
                  const isMaster = user.id.startsWith("master-");
                  const isCurrent = currentStaff?.email?.toLowerCase() === user.email.toLowerCase();

                  return (
                    <tr key={user.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-medium text-primary uppercase text-xs">
                            {user.full_name
                              ? user.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                              : user.email[0]}
                            <span
                              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${
                                user.status === "suspended"
                                  ? "bg-rose-500"
                                  : user.status === "pending_invite"
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                              {user.full_name || "Unnamed Staff"}
                              {isCurrent && (
                                <span className="rounded bg-primary/15 px-1.5 py-0.2 text-[10px] font-semibold text-primary">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{user.email}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(user.email);
                                  toast.success("Email copied to clipboard");
                                }}
                                className="text-muted-foreground hover:text-foreground"
                                title="Copy Email"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Phone className="h-2.5 w-2.5" />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${roleDef.badgeColor}`}
                        >
                          <Shield className="h-3 w-3" />
                          {roleDef.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building className="h-3.5 w-3.5 text-muted-foreground" />
                          {user.department || "General"}
                        </div>
                        {user.notes && (
                          <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                            {user.notes}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium">
                            {privCount} {privCount === 1 ? "Privilege" : "Privileges"}
                          </span>
                          {privCount === ALL_PRIVILEGES.length && (
                            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                              (Unrestricted)
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {user.privileges?.slice(0, 2).map((pk) => {
                            const pDef = ALL_PRIVILEGES.find((p) => p.key === pk);
                            return (
                              <span
                                key={pk}
                                className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-secondary-foreground"
                              >
                                {pDef?.label || pk}
                              </span>
                            );
                          })}
                          {privCount > 2 && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              +{privCount - 2} more
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {user.status === "suspended" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-600 border border-rose-200 dark:border-rose-800">
                            <XCircle className="h-3 w-3" />
                            Suspended
                          </span>
                        ) : user.status === "pending_invite" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600 border border-amber-200 dark:border-amber-800">
                            <RefreshCw className="h-3 w-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}
                            className="h-8 w-8 p-0"
                            title="Edit Role & Privileges"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setNewPassword("");
                              setSendResetEmailOnly(false);
                              setPasswordDialogOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                            title="Password Reset / Credentials"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </Button>

                          {!isMaster && !isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                statusMutation.mutate({
                                  id: user.id,
                                  status: user.status === "suspended" ? "active" : "suspended",
                                });
                              }}
                              className={`h-8 w-8 p-0 ${
                                user.status === "suspended"
                                  ? "text-emerald-600 hover:text-emerald-700"
                                  : "text-amber-600 hover:text-amber-700"
                              }`}
                              title={
                                user.status === "suspended" ? "Activate Account" : "Suspend Account"
                              }
                            >
                              {user.status === "suspended" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <AlertTriangle className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}

                          {!isMaster && !isCurrent && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                              title="Delete Account"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Create New Staff User</DialogTitle>
            <DialogDescription>
              Assign login credentials, department role, and custom granular operational privileges.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formEmail) {
                toast.error("Email is required.");
                return;
              }
              createMutation.mutate({
                email: formEmail,
                password: formPassword || undefined,
                full_name: formFullName,
                role: formRole,
                privileges: formPrivileges,
                department: formDepartment,
                phone: formPhone,
                status: formStatus,
                notes: formNotes,
              });
            }}
            className="space-y-5 py-2"
          >
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-name">Full Name</Label>
                <Input
                  id="create-name"
                  placeholder="e.g. Mary Adebayo"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-email">Email Address</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="staff@bankyhotel.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Department & Contact */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="create-dept">Department</Label>
                <select
                  id="create-dept"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-phone">Phone / WhatsApp</Label>
                <Input
                  id="create-phone"
                  placeholder="+234 800 000 0000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Initial Password Setup */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="create-pass"
                  className="text-xs font-semibold flex items-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  Initial Password
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomPassword}
                  className="h-7 text-xs text-primary gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate Strong Password
                </Button>
              </div>
              <Input
                id="create-pass"
                type="text"
                placeholder="At least 6 characters (e.g. Love748283@)"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Staff can use this password immediately on the sign-in page to access their
                authorized areas.
              </p>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Assign Operational Role</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(ROLE_DEFINITIONS).map(([key, def]) => {
                  const isSelected = formRole === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRoleChange(key as RoleType)}
                      className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{def.label}</span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                        {def.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Granular Privilege Checkboxes */}
            <div className="space-y-3 rounded-xl border border-border/80 p-4 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Granular Privileges Matrix ({formPrivileges.length}/{ALL_PRIVILEGES.length}{" "}
                    Granted)
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Tailor specific capabilities beyond default role templates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllPrivileges}
                    className="h-6 text-[11px] px-2"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetPrivilegesToRoleDefault}
                    className="h-6 text-[11px] px-2 text-muted-foreground"
                  >
                    Role Default
                  </Button>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                {ALL_PRIVILEGES.map((priv) => {
                  const isChecked = formPrivileges.includes(priv.key);
                  return (
                    <label
                      key={priv.key}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/40 hover:bg-muted/20 opacity-80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePrivilege(priv.key)}
                        className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-semibold text-foreground">{priv.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                          {priv.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="create-notes">Internal Administrative Notes</Label>
              <Input
                id="create-notes"
                placeholder="e.g. Shift supervisor, Room keys issued, Employee #BK-104"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="gap-1.5">
                {createMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Create Staff Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              Edit Staff Profile & Privileges
            </DialogTitle>
            <DialogDescription>
              Modify role level, departmental assignments, and custom privileges for{" "}
              {selectedUser?.email}.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedUser) return;
              updateMutation.mutate({
                id: selectedUser.id,
                full_name: formFullName,
                role: formRole,
                privileges: formPrivileges,
                department: formDepartment,
                phone: formPhone,
                status: formStatus,
                notes: formNotes,
              });
            }}
            className="space-y-5 py-2"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-email">Email (Immutable)</Label>
                <Input id="edit-email" value={formEmail} disabled className="opacity-70 bg-muted" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-dept">Department</Label>
                <select
                  id="edit-dept"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status">Account Status</Label>
                <select
                  id="edit-status"
                  value={formStatus}
                  onChange={(e) =>
                    setFormStatus(e.target.value as "active" | "suspended" | "pending_invite")
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending_invite">Pending Setup</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone / WhatsApp</Label>
              <Input
                id="edit-phone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Change Operational Role</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(ROLE_DEFINITIONS).map(([key, def]) => {
                  const isSelected = formRole === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleRoleChange(key as RoleType)}
                      className={`flex flex-col text-left rounded-xl border p-3 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground">{def.label}</span>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                        {def.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Privileges Matrix */}
            <div className="space-y-3 rounded-xl border border-border/80 p-4 bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Assigned Privileges ({formPrivileges.length}/{ALL_PRIVILEGES.length})
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    Customize exact permissions for this staff member.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAllPrivileges}
                    className="h-6 text-[11px] px-2"
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetPrivilegesToRoleDefault}
                    className="h-6 text-[11px] px-2 text-muted-foreground"
                  >
                    Role Default
                  </Button>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
                {ALL_PRIVILEGES.map((priv) => {
                  const isChecked = formPrivileges.includes(priv.key);
                  return (
                    <label
                      key={priv.key}
                      className={`flex items-start gap-2.5 rounded-lg border p-2.5 cursor-pointer text-xs transition-colors ${
                        isChecked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/40 hover:bg-muted/20 opacity-80"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePrivilege(priv.key)}
                        className="mt-0.5 h-4 w-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <div>
                        <div className="font-semibold text-foreground">{priv.label}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                          {priv.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-notes">Administrative Notes</Label>
              <Input
                id="edit-notes"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="gap-1.5">
                {updateMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Reset Modal */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Reset Staff Password</DialogTitle>
            <DialogDescription>
              Update credentials for <strong>{selectedUser?.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reset-pass">New Direct Password</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generateRandomPassword}
                  className="h-6 text-[11px] text-primary gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate
                </Button>
              </div>
              <Input
                id="reset-pass"
                type="text"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or send email link</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!selectedUser) return;
                passwordMutation.mutate({
                  email: selectedUser.email,
                  sendEmail: true,
                });
              }}
              disabled={passwordMutation.isPending}
              className="w-full gap-2 text-xs"
            >
              <Mail className="h-3.5 w-3.5" />
              Send Password Reset Email Link
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              disabled={passwordMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!newPassword || passwordMutation.isPending}
              onClick={() => {
                if (!selectedUser || !newPassword) return;
                passwordMutation.mutate({
                  email: selectedUser.email,
                  newPassword,
                });
              }}
            >
              {passwordMutation.isPending ? "Updating…" : "Apply New Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-rose-600">
              Remove Staff Member
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedUser?.email}</strong> from the hotel
              staff directory? Their administrative access will be revoked immediately.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-rose-200 bg-rose-500/5 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:text-rose-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Action recorded in audit log
            </div>
            <p className="mt-1">
              This action will delete the staff role record. You can re-create their account at any
              time if needed.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!selectedUser) return;
                deleteMutation.mutate({ id: selectedUser.id });
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing…" : "Confirm Removal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
