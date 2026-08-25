import { createMiddleware } from "@tanstack/react-start";
import { auth, getCurrentUser } from "./client";

// Must be registered as a global `functionMiddleware` in `src/start.ts`; otherwise
// the browser never attaches the bearer token to serverFn RPCs.
export const attachFirebaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | null = null;
    try {
      let user = auth.currentUser;
      if (!user) {
        // Wait up to 1500ms for Firebase Auth to restore session from IndexedDB/localStorage
        user = await Promise.race([
          getCurrentUser(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
        ]);
      }
      if (user) {
        token = await user.getIdToken();
      }
    } catch (e) {
      console.warn("Failed to get Firebase ID token:", e);
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
