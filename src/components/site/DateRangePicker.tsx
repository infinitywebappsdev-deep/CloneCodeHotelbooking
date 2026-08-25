import { useId, useMemo } from "react";
import { Calendar as CalendarIcon, AlertCircle, Moon, Clock } from "lucide-react";

export interface DateRangePickerProps {
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  onChange: (dates: { checkIn: string; checkOut: string; nights: number }) => void;
  className?: string;
  minDate?: string; // default today
  disabled?: boolean;
  labelVariant?: "subtle" | "floating" | "bold";
  showShortcuts?: boolean;
  error?: string;
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return formatDateToISO(d);
}

export function calculateNights(start: string, end: string): number {
  if (!start || !end) return 0;
  const t1 = new Date(start + "T00:00:00").getTime();
  const t2 = new Date(end + "T00:00:00").getTime();
  const diffDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
  className = "",
  minDate,
  disabled = false,
  showShortcuts = false,
  error,
}: DateRangePickerProps) {
  const checkInId = useId();
  const checkOutId = useId();

  const todayStr = useMemo(() => formatDateToISO(new Date()), []);
  const effectiveMinCheckIn = minDate || todayStr;

  // The check-out min date is strictly the day after check-in, or tomorrow if check-in not selected
  const effectiveMinCheckOut = useMemo(() => {
    if (checkIn && checkIn >= effectiveMinCheckIn) {
      return addDays(checkIn, 1);
    }
    return addDays(effectiveMinCheckIn, 1);
  }, [checkIn, effectiveMinCheckIn]);

  const nights = useMemo(() => calculateNights(checkIn, checkOut), [checkIn, checkOut]);

  const isInvalidSequence = Boolean(checkIn && checkOut && checkOut <= checkIn);

  const handleCheckInChange = (newCheckIn: string) => {
    if (!newCheckIn) {
      onChange({ checkIn: "", checkOut, nights: 0 });
      return;
    }

    // If new check-in is >= existing checkout, automatically advance checkout by at least 1 day
    let newCheckOut = checkOut;
    if (!checkOut || newCheckIn >= checkOut) {
      newCheckOut = addDays(newCheckIn, 1);
    }

    const calculated = calculateNights(newCheckIn, newCheckOut);
    onChange({
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      nights: calculated,
    });
  };

  const handleCheckOutChange = (newCheckOut: string) => {
    if (!newCheckOut) {
      onChange({ checkIn, checkOut: "", nights: 0 });
      return;
    }

    // Enforce checkOut is strictly after checkIn
    if (checkIn && newCheckOut <= checkIn) {
      // If user chose a checkout before or on checkIn, advance check-in or reject
      const calculated = 1;
      onChange({
        checkIn: addDays(newCheckOut, -1),
        checkOut: newCheckOut,
        nights: calculated,
      });
      return;
    }

    const calculated = calculateNights(checkIn, newCheckOut);
    onChange({
      checkIn,
      checkOut: newCheckOut,
      nights: calculated,
    });
  };

  const setShortcut = (days: number) => {
    const start = todayStr;
    const end = addDays(start, days);
    onChange({
      checkIn: start,
      checkOut: end,
      nights: days,
    });
  };

  const setWeekend = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    let daysUntilFriday = (5 - day + 7) % 7;
    if (daysUntilFriday === 0 && today.getHours() > 18) {
      daysUntilFriday = 7; // next Friday
    }
    const friday = new Date(today);
    friday.setDate(today.getDate() + daysUntilFriday);
    const sunday = new Date(friday);
    sunday.setDate(friday.getDate() + 2);

    const start = formatDateToISO(friday);
    const end = formatDateToISO(sunday);
    onChange({
      checkIn: start,
      checkOut: end,
      nights: 2,
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Check-In Field */}
        <div className="relative">
          <label
            htmlFor={checkInId}
            className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/80"
          >
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>Check-in (Arrival)</span>
          </label>
          <div className="relative rounded-lg border border-border/80 bg-background/80 px-3 py-2.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
            <input
              id={checkInId}
              type="date"
              min={effectiveMinCheckIn}
              value={checkIn}
              disabled={disabled}
              onChange={(e) => handleCheckInChange(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
        </div>

        {/* Check-Out Field */}
        <div className="relative">
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor={checkOutId}
              className="flex items-center gap-1.5 text-xs font-medium text-foreground/80"
            >
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              <span>Check-out (Departure)</span>
            </label>
            {nights > 0 && !isInvalidSequence && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary">
                <Moon className="h-2.5 w-2.5" />
                {nights} {nights === 1 ? "Night" : "Nights"}
              </span>
            )}
          </div>
          <div
            className={`relative rounded-lg border px-3 py-2.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${
              isInvalidSequence
                ? "border-destructive/80 bg-destructive/5"
                : "border-border/80 bg-background/80"
            }`}
          >
            <input
              id={checkOutId}
              type="date"
              min={effectiveMinCheckOut}
              value={checkOut}
              disabled={disabled}
              onChange={(e) => handleCheckOutChange(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {(isInvalidSequence || error) && (
        <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error || "Check-out date must be strictly after the check-in date."}</span>
        </div>
      )}

      {/* Quick shortcuts */}
      {showShortcuts && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-muted-foreground mr-1 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Quick:
          </span>
          <button
            type="button"
            onClick={() => setShortcut(1)}
            className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-medium hover:bg-muted transition-colors"
          >
            Tonight (1 night)
          </button>
          <button
            type="button"
            onClick={() => setShortcut(2)}
            className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-medium hover:bg-muted transition-colors"
          >
            2 Nights
          </button>
          <button
            type="button"
            onClick={setWeekend}
            className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-medium hover:bg-muted transition-colors"
          >
            This Weekend
          </button>
        </div>
      )}
    </div>
  );
}
