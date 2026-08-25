import { Link } from "@tanstack/react-router";
import { HOTEL } from "@/lib/hotel";
import { useSettings } from "@/components/site/SettingsContext";
import logoImg from "@/assets/banky-logo.jpeg";

export function Footer() {
  const settings = useSettings();

  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt={`${settings.hotel_name} logo`}
              className="h-12 w-12 object-contain"
              width={48}
              height={48}
              loading="lazy"
            />
            <span className="font-display block text-2xl">{settings.hotel_name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A four-star boutique retreat of 28 rooms and suites in Ado-Ekiti, where contemporary
            elegance meets warm Nigerian hospitality.
          </p>
        </div>

        <div>
          <h3 className="eyebrow text-muted-foreground">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { to: "/rooms", label: "Rooms & Suites" },
              { to: "/dining", label: "Dining & Lounge" },
              { to: "/events", label: "Meetings & Events" },
              { to: "/gallery", label: "Gallery" },
              { to: "/faqs", label: "FAQs" },
            ].map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow text-muted-foreground">Reservations</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>{settings.address}</li>
            <li>
              <a href={`tel:+${settings.whatsapp}`} className="hover:text-foreground">
                {settings.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-foreground">
                {settings.email}
              </a>
            </li>
            <li>
              Check-in {HOTEL.checkIn} · Check-out {HOTEL.checkOut}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-x flex flex-col justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} {settings.hotel_name}, Ado-Ekiti.
          </span>
          <span>Payments secured by Paystack.</span>
        </div>
      </div>
    </footer>
  );
}
