import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { auth } from "@/integrations/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";
import { myReservations, myThread, guestMessage, requestChange } from "@/lib/guest.functions";
import { formatDate, STATUS_LABEL, type ReservationRecord } from "@/lib/booking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useBooking } from "@/components/site/SettingsContext";

export const Route = createFileRoute("/_authenticated/my-stay")({
  head: () => ({
    meta: [
      { title: "My stay — Banky Hotel & Suites" },
      {
        name: "description",
        content:
          "View your Banky Hotel & Suites booking details and message the front desk during your stay.",
      },
      { property: "og:title", content: "My stay — Banky Hotel & Suites" },
      {
        property: "og:description",
        content: "Your reservation details and direct line to the front desk.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyStay,
});

const naira = (v: number) => `₦${Number(v).toLocaleString("en-NG")}`;

function MyStay() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings, whatsappLink } = useBooking();
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["my-reservations"],
    queryFn: () => myReservations() as Promise<ReservationRecord[]>,
  });
  const [openId, setOpenId] = useState<string | null>(null);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await firebaseSignOut(auth);
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-4">
          <Link to="/" className="font-serif text-lg">
            {settings.hotel_name}
          </Link>
          <Button size="sm" variant="outline" className="ml-auto" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-5 px-4 py-8">
        <div>
          <h1 className="font-serif text-3xl">My stay</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your reservations, and a direct line to our front desk.
          </p>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading your bookings…</p>}

        {!isLoading && rows.length === 0 && (
          <Card className="p-6 text-sm">
            <p>No bookings are linked to this email yet.</p>
            <p className="mt-2 text-muted-foreground">
              If you booked with a different email, message us and we will link it for you.
            </p>
            <div className="mt-4 flex gap-2">
              <Button asChild size="sm">
                <Link to="/reserve">Make a reservation</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a
                  href={whatsappLink("Hello, I need help finding my booking.")}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp us
                </a>
              </Button>
            </div>
          </Card>
        )}

        {rows.map((r) => (
          <Card key={r.id} className="space-y-4 p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {r.reference}
                </p>
                <h2 className="font-serif text-2xl">{r.room_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(r.check_in)} → {formatDate(r.check_out)} · {r.nights} night(s) ·{" "}
                  {r.guests} guest(s)
                </p>
              </div>
              <div className="text-right">
                <Badge variant="secondary">{STATUS_LABEL[r.status] ?? r.status}</Badge>
                <p className="mt-2 font-serif text-xl">{naira(r.total)}</p>
                <p className="text-xs capitalize text-muted-foreground">
                  {r.payment_status.replace("_", " ")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={settings.paystack_url} target="_blank" rel="noreferrer">
                  Pay securely
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a
                  href={whatsappLink(
                    `Hello, this is ${r.guest_name} about booking ${r.reference}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp front desk
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setOpenId(openId === r.id ? null : r.id)}
              >
                {openId === r.id ? "Hide messages" : "Message staff"}
              </Button>
              <RequestButtons reservationId={r.id} />
            </div>

            {openId === r.id && <Thread reservationId={r.id} />}
          </Card>
        ))}
      </main>
    </div>
  );
}

function RequestButtons({ reservationId }: { reservationId: string }) {
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<"change" | "cancel" | null>(null);

  const send = useMutation({
    mutationFn: () => requestChange({ data: { reservationId, kind: kind!, note } }),
    onSuccess: () => {
      toast.success("Request sent to the front desk.");
      setKind(null);
      setNote("");
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setKind("change")}>
        Request change
      </Button>
      <Button size="sm" variant="ghost" onClick={() => setKind("cancel")}>
        Request cancellation
      </Button>
      {kind && (
        <div className="w-full space-y-2">
          <Textarea
            rows={2}
            placeholder={
              kind === "cancel"
                ? "Reason for cancelling (optional)"
                : "What would you like to change?"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button size="sm" disabled={send.isPending} onClick={() => send.mutate()}>
              Send request
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setKind(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function Thread({ reservationId }: { reservationId: string }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const { data: messages = [] } = useQuery({
    queryKey: ["my-thread", reservationId],
    queryFn: () => myThread({ data: { reservationId } }),
    refetchInterval: 20_000,
  });

  const send = useMutation({
    mutationFn: () => guestMessage({ data: { reservationId, body } }),
    onSuccess: () => {
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["my-thread", reservationId] });
    },
    onError: (error) => toast.error((error as Error).message),
  });

  return (
    <div className="rounded-lg border border-border/60 p-3">
      <div className="max-h-60 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No messages yet — say hello and our team will reply.
          </p>
        )}
        {(messages as { id: string; sender: string; body: string }[]).map((m) => (
          <div
            key={m.id}
            className={`rounded-md p-2 text-xs ${m.sender === "staff" ? "bg-primary/10" : "bg-muted"}`}
          >
            <p className="font-medium capitalize">{m.sender === "staff" ? "Front desk" : "You"}</p>
            <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
        />
        <Button size="sm" disabled={!body.trim() || send.isPending} onClick={() => send.mutate()}>
          Send
        </Button>
      </div>
    </div>
  );
}
