import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { DateRangePicker } from "@/components/site/DateRangePicker";
import { Users, Search } from "lucide-react";

export function BookingBar({ floating = false }: { floating?: boolean }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/reserve",
      search: {
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        guests,
      } as never,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md transition-all ${
        floating
          ? "border border-white/20 bg-black/60 text-white"
          : "border border-border bg-card/95 text-card-foreground"
      }`}
    >
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7 lg:col-span-8">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            showShortcuts={false}
            onChange={({ checkIn: cin, checkOut: cout }) => {
              setCheckIn(cin);
              setCheckOut(cout);
            }}
          />
        </div>

        <div className="md:col-span-3 lg:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/80">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Guests</span>
          </label>
          <div className="relative rounded-lg border border-border/80 bg-background/80 px-3 py-2.5 transition-colors focus-within:border-primary">
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer"
            >
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5+">5+ Guests</option>
            </select>
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-2">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 text-xs font-semibold tracking-wider uppercase text-primary-foreground shadow-md hover:bg-primary/90 active:scale-98 transition-all h-[42px]"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
