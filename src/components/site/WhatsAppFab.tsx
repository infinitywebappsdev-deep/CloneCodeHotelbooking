import { bookingMessage } from "@/lib/hotel";
import { useBooking } from "@/components/site/SettingsContext";

export function WhatsAppFab() {
  const { settings, whatsappLink } = useBooking();
  return (
    <a
      href={whatsappLink(bookingMessage({}))}
      target="_blank"
      rel="noreferrer"
      aria-label={`Book on WhatsApp ${settings.phone}`}
      className="glass fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-[0.7rem] tracking-[0.18em] uppercase transition-transform hover:-translate-y-0.5"
    >
      <span className="h-2 w-2 rounded-full bg-primary" />
      WhatsApp Concierge
    </a>
  );
}
