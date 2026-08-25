import { useState, useRef, useEffect } from "react";
import { askHotelAi } from "@/lib/ai.functions";
import { useBooking } from "@/components/site/SettingsContext";
import { Sparkles, MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "model";
  text: string;
}

export function AiConcierge() {
  const { settings } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: `Hello! Welcome to ${settings.hotel_name || "Banky Hotel & Suites"}. I am your Google AI virtual concierge. How can I help you today with rooms, dining, events, or local recommendations?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await askHotelAi({
        data: {
          message: userText,
          history,
        },
      });

      setMessages([...newMessages, { role: "model", text: res.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "model",
          text: "I apologize, I am temporarily having trouble connecting. Please feel free to reach out directly to our front desk via WhatsApp or phone.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open Google AI Concierge"
        className="glass fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-[0.7rem] tracking-[0.18em] uppercase transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      >
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span className="font-medium">AI Concierge</span>
      </button>

      {/* Concierge Modal / Panel */}
      {isOpen && (
        <div className="fixed bottom-20 left-5 z-50 flex h-[500px] w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-border/80 bg-background/95 shadow-2xl backdrop-blur-md transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider">
                  Banky AI Concierge
                </h3>
                <p className="text-[10px] text-muted-foreground">Powered by Google AI</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs leading-relaxed">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "model" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/60 bg-muted/50 text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
                {m.role === "user" && (
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Bot className="h-3.5 w-3.5 animate-pulse" />
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/50 px-3.5 py-2 text-[11px]">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="border-t border-border/40 bg-muted/10 px-3 py-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
              <button
                type="button"
                onClick={() => setInput("What room types and suites are available?")}
                className="shrink-0 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Room rates
              </button>
              <button
                type="button"
                onClick={() => setInput("Tell me about dining and the open bar garden")}
                className="shrink-0 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Dining & Bar
              </button>
              <button
                type="button"
                onClick={() => setInput("How can I book Banky Hall for an event?")}
                className="shrink-0 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Event Hall
              </button>
            </div>
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-1.5 border-t border-border/60 bg-background p-2.5"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Banky Hotel…"
              className="h-9 rounded-full text-xs"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-full"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
