import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export function BookingBar({ floating = false }: { floating?: boolean }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/reserve", search: { checkIn, checkOut, guests } as never });
      }}
      className={`grid gap-4 rounded-sm p-6 sm:grid-cols-2 lg:grid-cols-4 lg:items-end ${
        floating ? "glass" : "border border-border bg-card"
      }`}
    >
      <Field label="Arrival">
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </Field>
      <Field label="Departure">
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        />
      </Field>
      <Field label="Guests">
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full bg-transparent text-sm outline-none"
        >
          {["1", "2", "3", "4", "5+"].map((g) => (
            <option key={g} value={g}>
              {g} {g === "1" ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </Field>
      <button
        type="submit"
        className="rounded-full bg-primary px-6 py-3 text-[0.7rem] tracking-[0.2em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
      >
        Check availability
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block border-b border-border/70 pb-2">
      <span className="eyebrow block text-muted-foreground">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
