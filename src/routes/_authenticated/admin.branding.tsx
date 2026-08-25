import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getSiteSettings, saveSiteSettings, uploadMedia } from "@/lib/settings.functions";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/branding";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MediaImagePicker } from "@/components/admin/MediaImagePicker";

export const Route = createFileRoute("/_authenticated/admin/branding")({
  component: BrandingPage,
});

function BrandingPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getSiteSettings(),
  });
  const [draft, setDraft] = useState<SiteSettings | null>(null);
  const current = draft ?? ({ ...DEFAULT_SETTINGS, ...(data ?? {}) } as SiteSettings);

  const save = useMutation({
    mutationFn: () => saveSiteSettings({ data: current as never }),
    onSuccess: () => {
      toast.success("Branding published — reload to see it site-wide.");
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (error) => toast.error((error as Error).message),
  });

  async function upload(file: File, field: "logo_url" | "favicon_url") {
    const buffer = await file.arrayBuffer();
    let binary = "";
    new Uint8Array(buffer).forEach((b) => (binary += String.fromCharCode(b)));
    try {
      const { url } = await uploadMedia({
        data: { filename: file.name, contentType: file.type, dataBase64: btoa(binary) },
      });
      setDraft({ ...current, [field]: url });
      toast.success("Uploaded — press Publish to apply.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading branding…</p>;

  const field = (key: keyof SiteSettings, label: string, type = "text") => (
    <div>
      <Label>{label}</Label>
      <Input
        type={type}
        value={String(current[key] ?? "")}
        onChange={(e) => setDraft({ ...current, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-xl">Identity</h2>
        {field("hotel_name", "Hotel name")}
        {field("tagline", "Tagline")}
        <div className="space-y-3">
          <MediaImagePicker
            value={current.logo_url}
            onChange={(url) => setDraft({ ...current, logo_url: url })}
            label="Hotel Logo"
            placeholder="/images/... or data:... or https://..."
            compact
          />
          <MediaImagePicker
            value={current.favicon_url}
            onChange={(url) => setDraft({ ...current, favicon_url: url })}
            label="Website Favicon"
            placeholder="/favicon.ico or /favicon.png or https://..."
            compact
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {field("color_primary", "Primary", "color")}
          {field("color_accent", "Accent", "color")}
          {field("color_background", "Background", "color")}
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-serif text-xl">Contact & payments</h2>
        {field("phone", "Phone")}
        {field("whatsapp", "WhatsApp number (digits only)")}
        {field("email", "Email")}
        {field("address", "Address")}
        {field("paystack_url", "Paystack payment link")}
        <Button disabled={save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Publishing…" : "Publish branding"}
        </Button>
      </Card>
    </div>
  );
}
