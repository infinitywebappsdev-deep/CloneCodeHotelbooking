import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";
import {
  onAuthStateChanged,
  updatePassword,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { recordAuditEvent } from "@/lib/audit.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSettings } from "@/components/site/SettingsContext";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Banky Hotel & Suites" },
      {
        name: "description",
        content: "Choose a new password for your Banky Hotel & Suites dashboard or guest account.",
      },
      { property: "og:title", content: "Set a new password — Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Secure password reset for Banky Hotel & Suites accounts.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [ready, setReady] = useState(false);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("oobCode");
      if (code) {
        setOobCode(code);
        verifyPasswordResetCode(auth, code)
          .then(() => setReady(true))
          .catch((err) => {
            console.warn("Invalid reset code:", err);
            toast.error("Password reset link has expired or is invalid.");
          });
      }
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setReady(true);
    });
    return () => unsub();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("The two passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (oobCode) {
        await confirmPasswordReset(auth, oobCode, password);
      } else if (auth.currentUser) {
        await updatePassword(auth.currentUser, password);
      } else {
        throw new Error("No active session or valid reset link found.");
      }

      await recordAuditEvent({
        data: {
          action: "auth.password_changed",
          entity: "auth",
          entityId: "",
          details: { via: "reset link" },
        },
      }).catch(() => {});
      setDone(true);
      toast.success("Password updated.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur">
        <Link to="/" className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {settings.hotel_name}
        </Link>
        <h1 className="mt-4 font-serif text-3xl">Set a new password</h1>

        {done ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Your password has been changed. You can now use it to sign in.
            </p>
            <Button
              className="mt-6 w-full"
              onClick={() => navigate({ to: "/admin", replace: true })}
            >
              Go to the dashboard
            </Button>
          </>
        ) : !ready ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Open this page from the reset link we emailed you. If the link has expired, request a
            new one from the{" "}
            <Link to="/auth" className="underline underline-offset-4">
              sign-in page
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters with a mix of letters and numbers.
            </p>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Saving…" : "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
