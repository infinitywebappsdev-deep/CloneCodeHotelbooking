import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getRoomMonthlyAvailability } from "@/lib/site.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { naira } from "@/lib/hotel";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  Ban,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

interface RoomAvailabilityCalendarProps {
  roomSlug: string;
  roomName: string;
  rate?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  onSelectDates?: (checkIn: string, checkOut: string) => void;
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function RoomAvailabilityCalendar({
  roomSlug,
  roomName,
  rate = 45000,
  initialCheckIn,
  initialCheckOut,
  onSelectDates,
  className = "",
}: RoomAvailabilityCalendarProps) {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed (1-12)

  const [selectedCheckIn, setSelectedCheckIn] = useState<string | null>(initialCheckIn || null);
  const [selectedCheckOut, setSelectedCheckOut] = useState<string | null>(initialCheckOut || null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Fetch live availability from Firestore for this month
  const { data: availabilityData, isLoading } = useQuery({
    queryKey: ["room-availability-month", roomSlug, currentYear, currentMonth],
    queryFn: () =>
      getRoomMonthlyAvailability({
        data: {
          slug: roomSlug,
          year: currentYear,
          month: currentMonth,
        },
      }),
  });

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
  };

  // Calendar grid calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Helper date formatting
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const handleDateClick = (dateStr: string, isBooked: boolean, isPast: boolean) => {
    if (isBooked || isPast) return;

    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      // Start fresh range with check-in
      setSelectedCheckIn(dateStr);
      setSelectedCheckOut(null);
    } else if (selectedCheckIn && !selectedCheckOut) {
      if (dateStr < selectedCheckIn) {
        // Clicked before check-in, treat as new check-in
        setSelectedCheckIn(dateStr);
      } else if (dateStr === selectedCheckIn) {
        // Clicked same day: check-out next day if available
        const nextDay = new Date(new Date(dateStr).getTime() + 86400000)
          .toISOString()
          .split("T")[0];
        setSelectedCheckOut(nextDay);
        if (onSelectDates) onSelectDates(dateStr, nextDay);
      } else {
        // Check if any date in between is booked
        const inTime = new Date(selectedCheckIn).getTime();
        const outTime = new Date(dateStr).getTime();
        let hasBookedInRange = false;

        if (availabilityData?.days) {
          for (let t = inTime; t < outTime; t += 86400000) {
            const d = new Date(t).toISOString().split("T")[0];
            if (availabilityData.days[d]?.status === "booked") {
              hasBookedInRange = true;
              break;
            }
          }
        }

        if (hasBookedInRange) {
          // Restart selection with clicked date
          setSelectedCheckIn(dateStr);
          setSelectedCheckOut(null);
        } else {
          setSelectedCheckOut(dateStr);
          if (onSelectDates) onSelectDates(selectedCheckIn, dateStr);
        }
      }
    }
  };

  // Calculate nights & total
  const nights =
    selectedCheckIn && selectedCheckOut
      ? Math.max(
          1,
          Math.round(
            (new Date(selectedCheckOut).getTime() - new Date(selectedCheckIn).getTime()) / 86400000,
          ),
        )
      : 0;

  const currentRate = availabilityData?.rate || rate;
  const subtotal = nights * currentRate;

  const handleProceedBooking = () => {
    if (selectedCheckIn && selectedCheckOut) {
      navigate({
        to: "/reserve",
        search: {
          room: roomSlug,
          checkIn: selectedCheckIn,
          checkOut: selectedCheckOut,
        },
      });
    }
  };

  return (
    <Card
      className={`overflow-hidden border border-border/80 bg-card p-6 shadow-sm ${className}`}
      id={`availability-calendar-${roomSlug}`}
    >
      {/* Header with Title and Month Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="eyebrow text-amber-500 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Firestore Calendar
            </span>
          </div>
          <h3 className="mt-1 font-serif text-xl font-bold text-foreground">
            {MONTH_NAMES[currentMonth - 1]} {currentYear}
          </h3>
          <p className="text-xs text-muted-foreground">
            Select arrival and departure dates to view live availability for {roomName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleJumpToToday}
            className="h-8 text-xs font-medium"
          >
            Today
          </Button>
          <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevMonth}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextMonth}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Monthly Days Grid */}
      <div className="mt-1 grid grid-cols-7 gap-1.5">
        {/* Leading empty spaces */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 rounded-lg bg-muted/10 opacity-30" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const dayNumber = index + 1;
          const monthStr = String(currentMonth).padStart(2, "0");
          const dayStr = String(dayNumber).padStart(2, "0");
          const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

          const isPast = dateStr < todayStr;
          const isToday = dateStr === todayStr;

          const dayData = availabilityData?.days?.[dateStr];
          const isBooked = dayData?.status === "booked";
          const isLimited = dayData?.status === "limited";

          // Selection states
          const isCheckIn = selectedCheckIn === dateStr;
          const isCheckOut = selectedCheckOut === dateStr;
          const isInRange =
            selectedCheckIn &&
            selectedCheckOut &&
            dateStr > selectedCheckIn &&
            dateStr < selectedCheckOut;
          const isHoveredRange =
            selectedCheckIn &&
            !selectedCheckOut &&
            hoverDate &&
            dateStr > selectedCheckIn &&
            dateStr <= hoverDate;

          let tileClass =
            "border border-border/50 bg-background text-foreground hover:border-primary/60 hover:bg-muted/40";

          if (isPast) {
            tileClass =
              "border-transparent bg-muted/20 text-muted-foreground/40 cursor-not-allowed opacity-60";
          } else if (isBooked) {
            tileClass =
              "border-rose-300/40 bg-rose-50/60 dark:bg-rose-950/20 text-rose-600/70 dark:text-rose-400 cursor-not-allowed line-through";
          } else if (isCheckIn || isCheckOut) {
            tileClass =
              "border-primary bg-primary text-primary-foreground font-bold shadow-md ring-2 ring-primary/40";
          } else if (isInRange || isHoveredRange) {
            tileClass = "border-primary/40 bg-primary/10 text-primary font-medium";
          } else if (isLimited) {
            tileClass =
              "border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 hover:border-amber-400";
          }

          return (
            <button
              key={dateStr}
              type="button"
              disabled={isPast || isBooked}
              onClick={() => handleDateClick(dateStr, isBooked, isPast)}
              onMouseEnter={() => !isPast && !isBooked && setHoverDate(dateStr)}
              onMouseLeave={() => setHoverDate(null)}
              className={`relative flex h-14 flex-col items-center justify-between rounded-lg p-1.5 transition-all text-left ${tileClass}`}
            >
              {/* Day number & today marker */}
              <div className="flex w-full items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    isCheckIn || isCheckOut ? "text-primary-foreground" : ""
                  }`}
                >
                  {dayNumber}
                </span>
                {isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Today" />
                )}
              </div>

              {/* Status Indicator inside Day Tile */}
              <div className="w-full text-center">
                {isPast ? (
                  <span className="text-[9px] text-muted-foreground/50">Past</span>
                ) : isBooked ? (
                  <span className="flex items-center justify-center gap-0.5 text-[9px] font-semibold text-destructive">
                    <Ban className="h-2.5 w-2.5" /> Booked
                  </span>
                ) : isCheckIn ? (
                  <span className="text-[9px] font-medium tracking-tight">Check-In</span>
                ) : isCheckOut ? (
                  <span className="text-[9px] font-medium tracking-tight">Check-Out</span>
                ) : isLimited ? (
                  <span className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">
                    {dayData?.unitsLeft} left
                  </span>
                ) : (
                  <span className="text-[9px] text-muted-foreground/80 font-mono">
                    {naira(currentRate).slice(0, -3)}k
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full border border-border bg-background" />
            Available
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            Limited (Few Units)
          </span>
          <span className="flex items-center gap-1.5 text-rose-500 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            Reserved / Sold Out
          </span>
          <span className="flex items-center gap-1.5 text-primary font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Selected Dates
          </span>
        </div>
      </div>

      {/* Selected Range Action Banner */}
      {selectedCheckIn && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-primary" />
              {selectedCheckOut ? (
                <span>
                  Stay: <strong>{selectedCheckIn}</strong> → <strong>{selectedCheckOut}</strong> (
                  {nights} {nights === 1 ? "night" : "nights"})
                </span>
              ) : (
                <span>
                  Check-in: <strong>{selectedCheckIn}</strong> (Please select your departure date)
                </span>
              )}
            </p>
            {selectedCheckOut && (
              <p className="text-xs text-muted-foreground font-medium">
                Estimated Subtotal:{" "}
                <span className="font-serif font-bold text-primary text-sm">{naira(subtotal)}</span>{" "}
                (plus applicable taxes)
              </p>
            )}
          </div>

          {selectedCheckOut && (
            <Button
              onClick={handleProceedBooking}
              className="gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 shrink-0 shadow-sm"
            >
              <span>Book Selected Dates</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
