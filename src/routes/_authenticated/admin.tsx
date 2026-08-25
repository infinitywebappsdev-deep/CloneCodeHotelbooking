import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/integrations/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { getStaffStatus, bootstrapAdmin } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSettings } from "@/components/site/SettingsContext";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Hotel dashboard — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "Staff dashboard for reservations, rooms, reports and website content at Banky Hotel & Suites.",
      },
      { property: "og:title", content: "Hotel dashboard — Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Manage reservations, rooms, reports and site content.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/reservations", label: "Reservations" },
  { to: "/admin/rooms", label: "Rooms" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/cms", label: "Content" },
  { to: "/admin/branding", label: "Branding" },
  { to: "/admin/audit", label: "Activity log" },
  { to: "/admin/account", label: "My account" },
];

function AdminLayout() {
  const settings = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["staff-status"],
    queryFn: () => getStaffStatus(),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await firebaseSignOut(auth);
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="p-10 text-sm text-muted-foreground">Loading dashboard…</div>;
  }

  if (!data?.isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border/60 bg-card p-8 text-center">
          <h1 className="font-serif text-2xl">Staff access only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {data?.email} is signed in but has no staff role at {settings.hotel_name}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {data?.canBootstrap && (
              <Button
                onClick={async () => {
                  try {
                    await bootstrapAdmin();
                    toast.success("You are now the hotel administrator.");
                    refetch();
                  } catch (error) {
                    toast.error((error as Error).message);
                  }
                }}
              >
                Claim administrator access
              </Button>
            )}
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <Link to="/" className="font-serif text-lg">
            {settings.hotel_name}
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={`rounded-full px-3 py-1.5 transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">{data.email}</span>
            <Button size="sm" variant="outline" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
