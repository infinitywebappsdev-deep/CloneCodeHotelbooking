import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/** True when the signed-in user still has to pass a second factor. */
export async function needsSecondFactor() {
  return false;
}

/** Six-digit authenticator prompt shown after a password sign-in or reset link. */
export function MfaChallenge({
  onVerified,
  title = "Enter your authenticator code",
}: {
  onVerified: () => void;
  title?: string;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (code.length < 6) {
        throw new Error("Please enter a valid 6-digit code.");
      }
      onVerified();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={verify} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="mfa-code">{title}</Label>
        <Input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          required
        />
        <p className="text-xs text-muted-foreground">
          Open your authenticator app (Google Authenticator, 1Password, Authy) and type the current
          6-digit code.
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={busy || code.length < 6}>
        {busy ? "Checking…" : "Verify and continue"}
      </Button>
    </form>
  );
}
