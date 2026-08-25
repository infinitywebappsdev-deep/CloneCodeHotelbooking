import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSettings } from "@/components/site/SettingsContext";
import { recordAuditEvent } from "@/lib/audit.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "Sign in to manage your Banky Hotel & Suites reservation or access the hotel dashboard.",
      },
      { property: "og:title", content: "Sign in — Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Guest portal and staff dashboard access for Banky Hotel & Suites, Ado-Ekiti.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate({ to: "/my-stay", replace: true });
    });
    return () => unsub();
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName && userCred.user) {
          await updateProfile(userCred.user, { displayName: fullName });
        }
        toast.success("Account created — you can sign in now.");
        setMode("signin");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        await recordAuditEvent({
          data: { action: "auth.login", entity: "auth", entityId: "", details: { email } },
        }).catch(() => {});
        navigate({ to: "/my-stay", replace: true });
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function sendReset() {
    if (!email) {
      toast.error("Enter your email address first, then press “Forgot password”.");
      return;
    }
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      toast.success("Reset instructions sent — check your inbox.");
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
        <h1 className="mt-4 font-serif text-3xl">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Guests view their booking here. Hotel staff reach the dashboard with the same sign-in.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {resetSent && (
          <div className="mt-5 rounded-lg border border-border/60 bg-muted/40 p-3 text-sm">
            We emailed <strong>{email}</strong> a reset link. Open it to set a new password.
          </div>
        )}

        {mode === "signin" && (
          <button
            type="button"
            onClick={sendReset}
            disabled={busy}
            className="mt-4 block text-sm text-muted-foreground underline underline-offset-4"
          >
            Forgot password? Email me a reset link
          </button>
        )}

        <button
          type="button"
          className="mt-3 text-sm text-muted-foreground underline underline-offset-4"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "New guest? Create an account" : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}
