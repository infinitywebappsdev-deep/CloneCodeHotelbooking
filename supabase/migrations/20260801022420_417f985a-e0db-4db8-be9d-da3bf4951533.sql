CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  hotel_name text NOT NULL DEFAULT 'Banky Hotel & Suites',
  tagline text NOT NULL DEFAULT 'Quiet Luxury in the Heart of Ado-Ekiti',
  logo_url text NOT NULL DEFAULT '',
  favicon_url text NOT NULL DEFAULT '',
  color_primary text NOT NULL DEFAULT '#1B3D2F',
  color_accent text NOT NULL DEFAULT '#C9A227',
  color_background text NOT NULL DEFAULT '#FBFAF6',
  phone text NOT NULL DEFAULT '+234 703 690 5671',
  whatsapp text NOT NULL DEFAULT '2347036905671',
  email text NOT NULL DEFAULT 'reservations@bankyhotelsuites.com',
  address text NOT NULL DEFAULT 'Ado-Ekiti, Ekiti State, Nigeria',
  paystack_url text NOT NULL DEFAULT 'https://paystack.shop/pay/lni6oqnifn',
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "staff manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TRIGGER site_settings_touch
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (singleton) VALUES (true);