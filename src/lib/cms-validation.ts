import { z } from "zod";

/** Parses input and raises a human-readable message instead of a raw Zod dump. */
export function parseFriendly<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  const message = result.error.issues
    .map((issue) => {
      const field = issue.path.join(".") || "value";
      const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
      return `${label}: ${issue.message}`;
    })
    .join(" · ");
  throw new Error(message);
}
