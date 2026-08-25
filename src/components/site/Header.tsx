import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { bookingMessage } from "@/lib/hotel";
import { useBooking } from "@/components/site/SettingsContext";
import logoImg from "@/assets/banky-logo.jpeg";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/rooms", label: "Rooms & Suites" },
  { to: "/dining", label: "Dining & Lounge" },
  { to: "/events", label: "Meetings & Events" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { settings, whatsappLink } = useBooking();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="overflow-hidden border-b border-white/20 bg-primary text-primary-foreground">
        <div className="ticker-track flex w-max gap-16 py-2 text-[0.65rem] tracking-[0.28em] uppercase">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex gap-16">
              <span>Direct booking benefit — complimentary breakfast for two</span>
              <span>Banky Hall now taking 2026 wedding dates</span>
              <span>Reserve on WhatsApp: {settings.phone}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "glass shadow-sm text-foreground"
            : "bg-gradient-to-b from-black/45 to-transparent text-white"
        }`}
      >
        <div className="container-x flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3 leading-none">
            <span
              className={`grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full transition-colors ${
                scrolled ? "bg-transparent" : "bg-white/90"
              }`}
            >
              <img
                src={logoImg}
                alt={`${settings.hotel_name} logo`}
                className="h-11 w-11 object-contain"
                width={44}
                height={44}
              />
            </span>
            <span>
              <span className="font-display block text-xl tracking-tight">Banky</span>
              <span className="eyebrow block text-[0.55rem] opacity-70">Hotel &amp; Suites</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[0.78rem] tracking-[0.12em] uppercase opacity-75 transition-opacity hover:opacity-100"
                activeProps={{ className: "opacity-100" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink(bookingMessage({}))}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-current/40 px-4 py-2 text-[0.7rem] tracking-[0.18em] uppercase opacity-80 transition-opacity hover:opacity-100 sm:inline-block"
            >
              WhatsApp
            </a>

            <Link
              to="/reserve"
              className="rounded-full bg-primary px-5 py-2.5 text-[0.7rem] tracking-[0.18em] uppercase text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reserve
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setOpen((v) => !v)}
              className="ml-1 rounded-full border border-border p-2 lg:hidden"
            >
              <span className="block h-px w-4 bg-current" />
              <span className="mt-1 block h-px w-4 bg-current" />
            </button>
          </div>
        </div>

        {open && (
          <div className="glass border-t border-white/30 lg:hidden">
            <div className="container-x grid gap-1 py-4 text-foreground">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="py-2 text-sm tracking-[0.12em] uppercase"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
