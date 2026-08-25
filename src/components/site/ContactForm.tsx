import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  contactInputSchema,
  type ContactInput,
  submitContactMessage,
} from "@/lib/contact.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  HelpCircle,
  MessageSquareText,
  Phone,
  RotateCcw,
} from "lucide-react";
import { whatsappLink } from "@/lib/hotel";

const SUBJECT_PRESETS = [
  "Room Reservation & Rates",
  "Banky Hall & Event Hosting",
  "Restaurant & Lounge Dining",
  "Airport Pickup / Chauffeur",
  "Corporate & Group Booking",
  "General Concierge Inquiry",
];

export function ContactForm() {
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    data: ContactInput;
    created_at: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactInputSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
    },
    mode: "onBlur",
  });

  const selectedSubject = watch("subject");
  const currentMessage = watch("message") || "";

  const submitMutation = useMutation({
    mutationFn: async (values: ContactInput) => {
      return await submitContactMessage({ data: values });
    },
    onSuccess: (res, variables) => {
      setSubmittedData({
        id: res.id,
        data: variables,
        created_at: res.created_at || new Date().toISOString(),
      });
      toast.success("Message sent successfully! Our concierge will respond shortly.");
      reset();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    },
  });

  const onSubmit = (values: ContactInput) => {
    submitMutation.mutate(values);
  };

  const handlePresetClick = (preset: string) => {
    setValue("subject", preset, { shouldValidate: true, shouldDirty: true });
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    reset();
  };

  if (submittedData) {
    return (
      <div
        id="contact-form-success-card"
        className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 dark:bg-emerald-950/20 p-8 sm:p-10 text-center shadow-sm backdrop-blur-sm"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-6">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <span className="eyebrow text-emerald-600 dark:text-emerald-400 font-semibold">
          Inquiry Received
        </span>
        <h3 className="mt-2 font-display text-2xl sm:text-3xl text-foreground font-serif">
          Thank You, {submittedData.data.name}
        </h3>
        <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Your message has been securely submitted to our Firebase desk records. A dedicated Banky
          Hotel & Suites concierge will review your inquiry and reply to{" "}
          <strong className="text-foreground">{submittedData.data.email}</strong> within 1–2 hours.
        </p>

        <div className="mt-6 inline-flex flex-col sm:flex-row items-center justify-center gap-2 rounded-xl bg-card border border-border/80 px-5 py-3 text-xs text-muted-foreground">
          <span>
            Tracking ID:{" "}
            <code className="font-mono text-foreground font-semibold">
              {submittedData.id.slice(0, 13)}
            </code>
          </span>
          <span className="hidden sm:inline">•</span>
          <span>
            Subject: <strong className="text-foreground">{submittedData.data.subject}</strong>
          </span>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={whatsappLink(
              `Hello Banky Hotel & Suites, I submitted a website inquiry with tracking ID #${submittedData.id.slice(0, 8)} (${submittedData.data.subject}).`,
            )}
            target="_blank"
            rel="noreferrer"
            id="contact-success-whatsapp-btn"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <MessageSquareText className="h-4 w-4" />
            <span>Express WhatsApp Follow-up</span>
          </a>

          <Button
            type="button"
            variant="outline"
            id="contact-send-another-btn"
            onClick={handleResetForm}
            className="rounded-full gap-2 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Send Another Inquiry</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      id="contact-us-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="eyebrow text-primary">Send an Inquiry</span>
          <span className="text-[11px] text-muted-foreground">* Required fields</span>
        </div>
        <h3 className="mt-1 font-display text-2xl font-serif text-foreground">
          Send Us a Direct Message
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Fill out the form below and our 24/7 guest relations team will respond promptly.
        </p>
      </div>

      {submitMutation.isError && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>
            {submitMutation.error instanceof Error
              ? submitMutation.error.message
              : "An error occurred while submitting your message. Please try again."}
          </span>
        </div>
      )}

      {/* Row 1: Name & Email */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="contact-user-name"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Your Full Name *</span>
          </Label>
          <Input
            id="contact-user-name"
            placeholder="e.g. Chief Adebayo Adeleke"
            autoComplete="name"
            {...register("name")}
            className={`transition-colors ${
              errors.name ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {errors.name && (
            <p
              id="contact-name-error"
              className="text-[11px] text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.name.message}</span>
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="contact-user-email"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Email Address *</span>
          </Label>
          <Input
            id="contact-user-email"
            type="email"
            placeholder="e.g. adebayo@example.com"
            autoComplete="email"
            {...register("email")}
            className={`transition-colors ${
              errors.email ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {errors.email && (
            <p
              id="contact-email-error"
              className="text-[11px] text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.email.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Subject & Optional Phone */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label
            htmlFor="contact-subject"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Subject / Inquiry Nature *</span>
          </Label>
          <Input
            id="contact-subject"
            placeholder="e.g. Presidential Suite reservation for next weekend"
            {...register("subject")}
            className={`transition-colors ${
              errors.subject ? "border-destructive focus-visible:ring-destructive" : ""
            }`}
          />
          {errors.subject && (
            <p
              id="contact-subject-error"
              className="text-[11px] text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.subject.message}</span>
            </p>
          )}

          {/* Quick presets */}
          <div className="mt-2 pt-1">
            <span className="text-[11px] text-muted-foreground block mb-1.5">
              Popular topics (click to fill):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUBJECT_PRESETS.map((preset) => {
                const isSelected = selectedSubject === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    id={`contact-preset-${preset.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    onClick={() => handlePresetClick(preset)}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition-all border ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-xs font-medium"
                        : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="contact-phone" className="text-xs font-medium flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span>
              Phone / WhatsApp Number{" "}
              <span className="text-muted-foreground font-normal">
                (Optional for faster callback)
              </span>
            </span>
          </Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="e.g. +234 803 123 4567"
            autoComplete="tel"
            {...register("phone")}
            className="transition-colors"
          />
          {errors.phone && (
            <p
              id="contact-phone-error"
              className="text-[11px] text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{errors.phone.message}</span>
            </p>
          )}
        </div>
      </div>

      {/* Row 3: Message with Character Count */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="contact-message"
            className="text-xs font-medium flex items-center gap-1.5"
          >
            <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Your Message *</span>
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {currentMessage.length} / 3,000 characters
          </span>
        </div>
        <Textarea
          id="contact-message"
          rows={5}
          placeholder="Kindly let us know your planned stay dates, number of guests, event requirements, catering needs, or any specific concierge requests..."
          {...register("message")}
          className={`resize-y transition-colors ${
            errors.message ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
        />
        {errors.message && (
          <p
            id="contact-message-error"
            className="text-[11px] text-destructive flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            <span>{errors.message.message}</span>
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
        <p className="text-[11px] text-muted-foreground text-center sm:text-left">
          Submissions are stored directly in our hotel database for priority response.
        </p>

        <Button
          type="submit"
          id="contact-submit-btn"
          disabled={submitMutation.isPending}
          className="w-full sm:w-auto min-w-[180px] rounded-full gap-2 px-8 py-2.5 font-medium tracking-wider uppercase text-xs shadow-sm"
        >
          {submitMutation.isPending ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Send Message</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
