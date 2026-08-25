import { createMiddleware } from "@tanstack/react-start";
import { auth } from "./client";

// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | null = null;
    try {
      if (auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch (e) {
      console.warn("Failed to get Firebase ID token:", e);
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
