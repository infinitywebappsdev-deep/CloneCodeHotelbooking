import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { signInWithEmailAndPassword, updatePassword, sendPasswordResetEmail } from "firebase/auth";
import { recordAuditEvent } from "@/lib/audit.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/account")({
  component: AccountPage,
});

function AccountPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [changed, setChanged] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("The two new passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const user = auth.currentUser;
      const email = user?.email ?? "";
      if (!user || !email) throw new Error("No user signed in.");

      // Re-authenticate first so a walk-up on an unlocked screen cannot change the password.
      try {
        await signInWithEmailAndPassword(auth, email, current);
      } catch {
        throw new Error("Your current password is not correct.");
      }

      await updatePassword(user, next);
      await recordAuditEvent({
        data: {
          action: "auth.password_changed",
          entity: "auth",
          entityId: "",
          details: { via: "dashboard" },
        },
      }).catch(() => {});
      setChanged(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.success("Password updated.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function emailResetLink() {
    setResetBusy(true);
    try {
      const email = auth.currentUser?.email ?? "";
      if (!email) throw new Error("No email found.");
      await sendPasswordResetEmail(auth, email);
      await recordAuditEvent({
        data: {
          action: "auth.password_reset_requested",
          entity: "auth",
          entityId: "",
          details: { email },
        },
      }).catch(() => {});
      toast.success(`Reset instructions sent to ${email}.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-serif text-xl">Change your password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            You will be asked for your current password first. Every change is written to the
            activity log.
          </p>
        </div>
        {changed && (
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm">
            Your password was changed successfully. Use it the next time you sign in.
          </div>
        )}
        <form onSubmit={changePassword} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current">Current password</Label>
            <Input
              id="current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next">New password</Label>
            <Input
              id="next"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">
            At least 8 characters. Avoid re-using a password from another site.
          </p>
          <Button type="submit" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-serif text-xl">Forgot it? Email me a reset link</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We email a single-use link to your address. Open it and you will land on a page to set a
            new password. The link expires after one hour and can only be used once.
          </p>
        </div>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Press the button below.</li>
          <li>Open the email titled “Reset your password”.</li>
          <li>Choose a new password and confirm it.</li>
        </ol>
        <Button variant="outline" onClick={emailResetLink} disabled={resetBusy}>
          {resetBusy ? "Sending…" : "Send reset instructions"}
        </Button>
      </Card>
    </div>
  );
}
