import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { auth } from "@/integrations/firebase/client";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSettings } from "@/components/site/SettingsContext";
import { recordAuditEvent } from "@/lib/audit.functions";
import { isMasterAdmin } from "@/lib/auth-roles";

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
      if (user) {
        if (isMasterAdmin(user.email)) {
          navigate({ to: "/admin", replace: true });
        } else {
          navigate({ to: "/my-stay", replace: true });
        }
      }
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
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await recordAuditEvent({
          data: { action: "auth.login", entity: "auth", entityId: "", details: { email } },
        }).catch(() => {});
        if (isMasterAdmin(userCred.user?.email)) {
          navigate({ to: "/admin", replace: true });
        } else {
          navigate({ to: "/my-stay", replace: true });
        }
      }
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (err.code === "auth/operation-not-allowed") {
        toast.error(
          "Email/Password sign-in requires enabling in Firebase console. Please use Google Sign-In below or sign in with Google.",
        );
      } else if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        toast.error("Invalid credentials. Please verify your email and password.");
      } else {
        toast.error(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      await recordAuditEvent({
        data: {
          action: "auth.login",
          entity: "auth",
          entityId: "",
          details: { email: userCred.user?.email, provider: "google" },
        },
      }).catch(() => {});
      toast.success(`Welcome, ${userCred.user?.displayName || userCred.user?.email}`);
      if (isMasterAdmin(userCred.user?.email)) {
        navigate({ to: "/admin", replace: true });
      } else {
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
          Guests view their booking here. Hotel staff and administrators reach the control dashboard
          with the same sign-in.
        </p>

        {/* Quick Admin fill button for chrisbllack@gmail.com */}
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Admin Portal Access</span>
            <button
              type="button"
              onClick={() => {
                setEmail("chrisbllack@gmail.com");
                setPassword("Love748283@");
                setMode("signin");
              }}
              className="text-primary hover:underline font-medium"
            >
              Fill admin credentials
            </button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            chrisbllack@gmail.com has full administrator permissions over CMS, rooms, reservations,
            branding, and audit reports.
          </p>
        </div>

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
            {busy ? "Please wait…" : mode === "signin" ? "Sign in with Email" : "Create account"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={busy}
          onClick={signInWithGoogle}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
        </Button>

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
