"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, User } from "lucide-react";
import { cn } from "@/lib/cn";

interface KbEntry {
  id: string;
  topic: string;
  keywords: string[];
  question: string;
  answer: string;
  related?: string[];
}

/** Knowledge base for the support agent. Add to it freely. */
const KB: KbEntry[] = [
  {
    id: "place-order",
    topic: "Ordering",
    keywords: ["order", "place", "buy", "checkout", "how to order"],
    question: "How do I place an order?",
    answer:
      "1. Sign in (or create an account)\n2. Open /restaurants and pick a place\n3. Tap 'Add' on the dishes you want\n4. Click the cart icon in the header\n5. Hit 'Proceed to checkout', pick an address & payment method\n6. Place your order — you'll see live status updates on the order page.",
    related: ["payment", "track"],
  },
  {
    id: "payment",
    topic: "Payments",
    keywords: ["payment", "pay", "card", "cod", "cash", "stripe", "method"],
    question: "Which payment methods do you support?",
    answer:
      "We accept credit/debit cards via Stripe and Cash on Delivery (COD). On the checkout page you'll see both options — pick one before placing the order.",
    related: ["refund", "place-order"],
  },
  {
    id: "track",
    topic: "Tracking",
    keywords: ["track", "status", "where", "live", "real-time", "update"],
    question: "How do I track my order?",
    answer:
      "Once you place an order, you're redirected to the order page. The status updates live as the restaurant accepts, prepares, and dispatches — no refresh needed. Status flow: Placed → Accepted → Preparing → Out for delivery → Delivered.",
    related: ["place-order", "cancel"],
  },
  {
    id: "cancel",
    topic: "Cancellation",
    keywords: ["cancel", "stop", "wrong", "refund"],
    question: "Can I cancel an order?",
    answer:
      "Only the restaurant can cancel an order from their dashboard, and only before it's out for delivery. For COD orders no payment was taken. For card orders, the refund is initiated automatically by Stripe within 5-7 business days.",
    related: ["refund", "track"],
  },
  {
    id: "refund",
    topic: "Refunds",
    keywords: ["refund", "money back", "return"],
    question: "When will I get my refund?",
    answer:
      "For card payments, refunds are issued via Stripe within 5–7 business days of cancellation. COD orders don't need a refund since no payment was taken. Check your order page for the current payment status.",
    related: ["cancel"],
  },
  {
    id: "signup",
    topic: "Account",
    keywords: ["sign up", "signup", "register", "create account", "join"],
    question: "How do I create an account?",
    answer:
      "Click 'Get Started' in the top-right, fill in your name, email and password. On the signup form you can pick 'I'm a Customer' or 'I'm a Restaurant Owner'. Customers can browse and order immediately; owners get a dashboard to add their restaurant.",
    related: ["login", "owner"],
  },
  {
    id: "login",
    topic: "Account",
    keywords: ["login", "sign in", "log in", "password"],
    question: "I forgot my password — what do I do?",
    answer:
      "Password reset is on our Phase 2 roadmap. For now, email deepakkr220399@gmail.com with your account email and we'll help you reset manually.",
    related: ["signup"],
  },
  {
    id: "owner",
    topic: "Restaurant Partners",
    keywords: ["restaurant", "list", "register", "partner", "owner", "add my restaurant"],
    question: "How do I list my restaurant?",
    answer:
      "Sign up with the 'I'm a Restaurant Owner' tab. After signing in you'll see /owner/dashboard with three sections: Overview, Restaurant (settings), Menu (add dishes). Approval is automatic in v1.",
    related: ["signup"],
  },
  {
    id: "delivery",
    topic: "Delivery",
    keywords: ["delivery", "shipping", "deliver", "time", "fee"],
    question: "How long does delivery take? Are there fees?",
    answer:
      "Each restaurant lists its own prep time (usually 20–35 min) and delivery fee on the restaurant card. The min order is also shown — orders under that aren't accepted at checkout.",
    related: ["track"],
  },
  {
    id: "geo",
    topic: "Discovery",
    keywords: ["near", "nearby", "location", "geo", "find"],
    question: "How do I find restaurants near me?",
    answer:
      "On /restaurants, click the 'Near me' button. We'll ask for browser location permission and show only restaurants within 10km. You can also filter by city, cuisine, price tier or minimum rating.",
    related: ["place-order"],
  },
  {
    id: "review",
    topic: "Reviews",
    keywords: ["review", "rate", "rating", "star", "comment"],
    question: "How do I review a restaurant?",
    answer:
      "Once your order shows 'Delivered', the order page reveals a 'How was your order?' card. Tap 'Rate', pick a star rating (1–5) and optionally add a comment. The restaurant's average rating updates instantly.",
    related: ["place-order"],
  },
  {
    id: "profile",
    topic: "Account",
    keywords: ["profile", "name", "avatar", "address", "phone"],
    question: "How do I update my profile?",
    answer:
      "Click 'Profile' in the header (or the avatar circle). You can edit your name, phone, and avatar URL, plus manage your saved delivery addresses (add, edit, set as default).",
    related: ["signup"],
  },
  {
    id: "contact",
    topic: "Contact",
    keywords: ["contact", "support", "email", "help", "human"],
    question: "How do I reach a real human?",
    answer:
      "Email deepakkr220399@gmail.com — we typically respond within 24 hours. For order-specific issues, please mention the order ID (visible on your order page as '#xxxxxxxx').",
    related: [],
  },
  {
    id: "veg",
    topic: "Menu",
    keywords: ["veg", "vegetarian", "non veg", "non-veg", "diet"],
    question: "Can I filter for vegetarian dishes?",
    answer:
      "Every dish on a restaurant menu is tagged with a green leaf (veg) or red dot (non-veg). The filter currently works at the restaurant level (cuisine/price); per-dish veg-only filtering is on the roadmap.",
    related: [],
  },
];

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  related?: string[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "do", "i", "to", "for", "in", "on", "at", "of",
  "and", "or", "my", "me", "you", "your", "how", "what", "can", "does",
  "did", "are", "was",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !STOP_WORDS.has(t));
}

function findAnswer(query: string): KbEntry | null {
  const tokens = tokenize(query);
  if (tokens.length === 0) return null;
  let best: { entry: KbEntry; score: number } | null = null;
  for (const entry of KB) {
    let score = 0;
    for (const t of tokens) {
      for (const kw of entry.keywords) {
        if (kw.toLowerCase().includes(t)) score += 2;
      }
      if (entry.question.toLowerCase().includes(t)) score += 1;
      if (entry.answer.toLowerCase().includes(t)) score += 0.5;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }
  return best?.entry ?? null;
}

const SUGGESTED_TOPICS = ["place-order", "payment", "track", "owner", "review", "contact"];

export function HelpChatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "bot",
      text:
        "Hi! I'm the Food Villa assistant. I can help with ordering, payments, delivery tracking, account questions and more.\n\nPick a topic below or type your question — I'll find the answer.",
      related: SUGGESTED_TOPICS,
    },
  ]);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function sendUserMessage(text: string) {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };
    setMessages((m) => [...m, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const match = findAnswer(text);
      const botMsg: Message = match
        ? {
            id: `b-${Date.now()}`,
            role: "bot",
            text: match.answer,
            related: match.related,
          }
        : {
            id: `b-${Date.now()}`,
            role: "bot",
            text:
              "I'm not sure about that one. Try one of these common topics, or email deepakkr220399@gmail.com for direct support.",
            related: SUGGESTED_TOPICS,
          };
      setMessages((m) => [...m, botMsg]);
      setTyping(false);
    }, 450);
  }

  function askById(id: string) {
    const entry = KB.find((e) => e.id === id);
    if (!entry) return;
    sendUserMessage(entry.question);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    sendUserMessage(text);
  }

  return (
    <div className="card flex h-[min(70vh,640px)] flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-cream-dark/60 bg-white p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Bot size={20} />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold">Food Villa Assistant</h2>
          <p className="text-xs text-ink-muted">Usually answers instantly · powered by an FAQ index</p>
        </div>
      </header>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto bg-cream/40 p-4">
        {messages.map((m) => (
          <div key={m.id} className={cn("flex gap-2", m.role === "user" ? "flex-row-reverse" : "")}>
            <span
              className={cn(
                "mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-white",
                m.role === "user" ? "bg-brand-500" : "bg-ink",
              )}
            >
              {m.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </span>
            <div className={cn("max-w-[80%]", m.role === "user" ? "text-right" : "")}>
              <div
                className={cn(
                  "inline-block whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  m.role === "user"
                    ? "bg-brand-500 text-white"
                    : "bg-white text-ink",
                )}
              >
                {m.text}
              </div>
              {m.role === "bot" && m.related && m.related.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.related.map((id) => {
                    const e = KB.find((k) => k.id === id);
                    if (!e) return null;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => askById(id)}
                        className="rounded-full border border-cream-dark bg-white px-2.5 py-1 text-xs text-ink-soft hover:border-brand-300 hover:text-brand-600"
                      >
                        {e.question}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <span className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white">
              <Bot size={14} />
            </span>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm text-ink-muted shadow-sm">
              <Loader2 size={14} className="animate-spin" /> Typing...
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-cream-dark/60 bg-white p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything... e.g. 'how do I cancel an order?'"
          className="input flex-1"
          aria-label="Type your question"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          aria-label="Send"
          className="btn-primary"
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  );
}
