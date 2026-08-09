"use client";

import { useRef, useState } from "react";
import { MessageSquare, Plus, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useLocale } from "@/lib/i18n/locale-context";

export default function CoachPage() {
  const { dict } = useLocale();
  const coachDict = dict.app.coach;

  const [messages, setMessages] = useState(coachDict.initialMessages);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: coachDict.autoReply },
      ]);
      setTyping(false);
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 900);
  };

  return (
    <div className="animate-fade-in flex min-h-[calc(100dvh-10rem)] flex-col">
      <PageHeader
        title={dict.app.nav.coach}
        subtitle={coachDict.subtitle}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMessages([])}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {coachDict.newChat}
          </Button>
        }
      />

      <div className="mt-8 flex-1 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="max-w-xs text-sm text-muted-foreground">
              {coachDict.empty}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {coachDict.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {coachDict.suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setInput(s)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-soft transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>

            <ol className="space-y-5">
              {messages.map((message, index) => (
                <li
                  key={index}
                  className={
                    message.role === "assistant" ? "flex items-start gap-3" : "flex justify-end"
                  }
                >
                  {message.role === "assistant" ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                      <MessageSquare className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                  ) : null}
                  <div
                    className={
                      message.role === "assistant"
                        ? "max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-soft sm:max-w-[70%]"
                        : "max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-soft sm:max-w-[70%]"
                    }
                  >
                    {message.content}
                  </div>
                  {message.role === "user" ? (
                    <Avatar
                      name={dict.app.profile.name}
                      size="sm"
                      className="ms-3 hidden sm:flex"
                    />
                  ) : null}
                </li>
              ))}
            </ol>

            {typing ? (
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <MessageSquare className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3.5 shadow-soft">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
                </div>
              </div>
            ) : null}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-20 mt-8 lg:bottom-6">
        <div className="rounded-xl border border-border bg-card p-2 shadow-pop">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder={coachDict.placeholder}
              aria-label={coachDict.placeholder}
              className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              size="icon"
              className="h-10 w-10 shrink-0"
              aria-label={coachDict.send}
              disabled={!input.trim()}
              onClick={send}
            >
              <Send className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {coachDict.disclaimer}
        </p>
      </div>
    </div>
  );
}
