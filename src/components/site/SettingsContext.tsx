import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/branding";

const SettingsContext = createContext<SiteSettings>(DEFAULT_SETTINGS);

export function SettingsProvider({
  value,
  children,
}: {
  value: SiteSettings | null | undefined;
  children: ReactNode;
}) {
  return (
    <SettingsContext.Provider value={{ ...DEFAULT_SETTINGS, ...(value ?? {}) }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

/** Booking helpers bound to the numbers currently saved in the CMS. */
export function useBooking() {
  const settings = useSettings();
  return {
    settings,
    whatsappLink: (message: string) =>
      `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`,
  };
}
