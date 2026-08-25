import { createFileRoute } from "@tanstack/react-router";
import { MyBookingsPage } from "./my-bookings";

export const Route = createFileRoute("/_authenticated/my-stay")({
  head: () => ({
    meta: [
      { title: "My Stay & Bookings — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "View your Banky Hotel & Suites reservation history, payment status, and direct front desk concierge line.",
      },
      { property: "og:title", content: "My Stay — Banky Hotel & Suites" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyBookingsPage,
});
