export type SiteSettings = {
  id: string;
  hotel_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  color_primary: string;
  color_accent: string;
  color_background: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  paystack_url: string;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "",
  hotel_name: "Banky Hotel & Suites",
  tagline: "Quiet Luxury in the Heart of Ado-Ekiti",
  logo_url: "",
  favicon_url: "",
  color_primary: "#1262aa",
  color_accent: "#C9A227",
  color_background: "#FBFAF6",
  phone: "+234 704 700 4816",
  whatsapp: "2347047004816",
  email: "reservations@bankyhotelandsuites.com",
  address: "Ado-Ekiti, Ekiti State, Nigeria",
  paystack_url: "https://paystack.shop/pay/lni6oqnifn",
};

const HEX = /^#([0-9a-f]{6})$/i;

/** Inline CSS that re-points the design tokens at the colours saved in the CMS. */
export function themeCss(settings: SiteSettings) {
  const rules: string[] = [];
  if (HEX.test(settings.color_primary)) {
    rules.push(`--primary:${settings.color_primary}`, `--ring:${settings.color_accent}`);
  }
  if (HEX.test(settings.color_accent)) {
    rules.push(`--accent:${settings.color_accent}`, `--gold:${settings.color_accent}`);
  }
  if (HEX.test(settings.color_background)) {
    rules.push(`--background:${settings.color_background}`, `--ivory:${settings.color_background}`);
  }
  return rules.length ? `:root{${rules.join(";")};}` : "";
}
