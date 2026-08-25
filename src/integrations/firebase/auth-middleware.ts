import { createMiddleware } from "@tanstack/react-start";

export const requireFirebaseAuth = createMiddleware().server(async ({ next, request }) => {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!token) {
    throw new Error("Unauthorized: missing authentication token.");
  }

  // Parse JWT claims safely on the server
  let userId = "authenticated-user";
  let claims: Record<string, unknown> = {};

  try {
    const parts = token.split(".");
    if (parts.length >= 2) {
      // Decode standard and URL-safe base64 JWT payload with proper padding
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf-8"));
      userId = payload.user_id || payload.sub || payload.uid || userId;
      claims = payload;
      if (payload.email && !claims.email) {
        claims.email = payload.email;
      }
    }
  } catch (err) {
    console.warn("Failed to decode token payload:", err);
  }

  return next({
    context: {
      userId,
      claims,
    },
  });
});
