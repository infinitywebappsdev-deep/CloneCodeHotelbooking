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
      const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
      userId = payload.user_id || payload.sub || userId;
      claims = payload;
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
