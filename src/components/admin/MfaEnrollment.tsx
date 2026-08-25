import { useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { recordAuditEvent } from "@/lib/audit.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { sendEmailVerification } from "firebase/auth";

/** Security settings and verification for this staff account. */
export function MfaEnrollment() {
  const [busy, setBusy] = useState(false);
  const user = auth.currentUser;
  const isVerified = user?.emailVerified;

  async function sendVerification() {
    if (!user) return;
    setBusy(true);
    try {
      await sendEmailVerification(user);
      await recordAuditEvent({
        data: {
          action: "auth.login",
          entity: "auth",
          entityId: user.uid,
          details: { action: "email_verification_sent" },
        },
      }).catch(() => {});
      toast.success(`Verification email sent to ${user.email}.`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="font-serif text-xl">Account Verification & Security</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Protected by Google Firebase Authentication with secure role-based access control.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-sm">
          Account Status:{" "}
          <strong>{isVerified ? "Verified" : "Active (Email verification available)"}</strong>
          <div className="mt-1 text-xs text-muted-foreground">
            Signed in as: <span className="font-mono">{user?.email || "Staff Member"}</span>
          </div>
        </div>

        {!isVerified && (
          <Button variant="outline" disabled={busy} onClick={sendVerification}>
            {busy ? "Sending…" : "Send verification email"}
          </Button>
        )}
      </div>
    </Card>
  );
}
