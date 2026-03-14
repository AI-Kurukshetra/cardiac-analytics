"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bot,
  ChevronDown,
  ChevronUp,
  Heart,
  MessageSquareText,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import {
  generateAssistantResponse,
  getSuggestionPrompts,
  getWelcomeMessage,
} from "@/lib/assistant/engine";
import { AssistantSnapshot } from "@/lib/assistant/types";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: string;
};

type PulseAIAssistantProps = {
  snapshot: AssistantSnapshot;
};

const WELCOME_MESSAGE_ID = "assistant-welcome";

function createMessage(
  role: AssistantMessage["role"],
  content: string,
): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function formatMessageTime(date: string) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getHeaderLabel(role: AssistantSnapshot["role"]) {
  return role === "provider" ? "Provider Copilot" : "Patient Copilot";
}

function getComposerPlaceholder(role: AssistantSnapshot["role"]) {
  return role === "provider"
    ? "Ask about risk, alerts, trends, or follow-ups..."
    : "Ask about vitals, risk, medications, or next steps...";
}

export function PulseAIAssistant({ snapshot }: PulseAIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestionTray, setShowSuggestionTray] = useState(true);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: WELCOME_MESSAGE_ID,
      role: "assistant",
      content: getWelcomeMessage(snapshot),
      createdAt: "",
    },
  ]);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestions = getSuggestionPrompts(snapshot.role);
  const showWelcomeState = messages.length === 1 && !isTyping;

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea) {
      return;
    }

    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, isTyping, messages]);

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function submitPrompt(prompt: string) {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isTyping) {
      return;
    }

    const userMessage = createMessage("user", trimmedPrompt);

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setIsOpen(true);
    setShowSuggestionTray(false);

    typingTimerRef.current = setTimeout(() => {
      const reply = generateAssistantResponse(snapshot, trimmedPrompt);

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage("assistant", reply),
      ]);
      setIsTyping(false);
      typingTimerRef.current = null;
    }, 700);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitPrompt(inputValue);
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[radial-gradient(circle_at_bottom_right,rgba(15,118,110,0.16),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.18),rgba(15,23,42,0.26))] backdrop-blur-[2px] transition duration-300 ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-x-4 bottom-4 z-50 flex justify-end sm:inset-x-6 sm:bottom-6">
        <button
          type="button"
          onClick={() => setIsOpen((currentValue) => !currentValue)}
          className="group flex h-[4.25rem] items-center gap-3 rounded-full border border-white/80 bg-[linear-gradient(135deg,rgba(15,118,110,0.96)_0%,rgba(8,47,73,0.98)_58%,rgba(15,23,42,0.98)_100%)] px-4 text-left text-white shadow-[0_28px_65px_-30px_rgba(15,23,42,0.75)] ring-1 ring-slate-900/6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_34px_72px_-30px_rgba(15,23,42,0.82)]"
          aria-expanded={isOpen}
          aria-controls="pulse-ai-panel"
        >
          <span className="assistant-launcher-glow flex h-11 w-11 items-center justify-center rounded-full bg-white/14 ring-1 ring-white/20">
            <Heart className="h-5 w-5" />
          </span>
          <span className="hidden min-w-0 sm:block">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              {snapshot.assistantName}
              <span className="flex items-center gap-1 rounded-full bg-emerald-400/14 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
                Active
              </span>
            </span>
            <span className="mt-1 flex items-center gap-2 text-xs text-slate-200/90">
              <Sparkles className="h-3.5 w-3.5 text-cyan-100" />
              {snapshot.assistantSubtitle}
            </span>
          </span>
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:flex">
            <WandSparkles className="h-3.5 w-3.5" />
            AI
          </div>
        </button>
      </div>

      <div className="pointer-events-none fixed inset-x-3 bottom-20 z-50 flex justify-end sm:inset-x-6 sm:bottom-28">
        <section
          id="pulse-ai-panel"
          className={`pointer-events-auto flex h-[min(43rem,calc(100dvh-6rem))] w-full max-w-[28.5rem] origin-bottom-right flex-col overflow-hidden rounded-[2rem] border border-white/75 bg-[linear-gradient(180deg,rgba(243,251,248,0.98)_0%,rgba(255,255,255,0.96)_42%,rgba(248,250,252,0.98)_100%)] shadow-[0_42px_110px_-48px_rgba(15,23,42,0.82)] backdrop-blur-xl transition duration-300 sm:w-[28.5rem] ${
            isOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-4 scale-95 opacity-0"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <header className="relative overflow-hidden border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.24),transparent_32%),radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_28%),linear-gradient(135deg,rgba(15,118,110,0.16)_0%,rgba(8,145,178,0.12)_44%,rgba(255,255,255,0.82)_100%)] px-4 py-4 sm:px-5">
            <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)]" />
            <div className="absolute -right-8 top-0 h-24 w-24 rounded-full bg-cyan-200/35 blur-2xl" />
            <div className="absolute -left-10 top-4 h-20 w-20 rounded-full bg-emerald-200/35 blur-2xl" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="assistant-avatar-shell flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] text-white shadow-[0_18px_38px_-22px_rgba(15,23,42,0.75)]">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-200/80 bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {getHeaderLabel(snapshot.role)}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold tracking-tight text-slate-950">
                      {snapshot.assistantName}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {snapshot.assistantSubtitle}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/80 bg-white/75 text-slate-600 backdrop-blur transition hover:border-slate-300 hover:text-slate-950"
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mt-4 grid grid-cols-3 gap-2 text-[11px]">
              <div className="rounded-2xl border border-white/80 bg-white/78 px-3 py-2 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Mode
                </p>
                <p className="mt-1 font-medium text-slate-900">
                  {snapshot.role === "provider" ? "Clinical view" : "Supportive view"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/78 px-3 py-2 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Replies
                </p>
                <p className="mt-1 font-medium text-slate-900">Live data</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/78 px-3 py-2 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
                <p className="font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Safety
                </p>
                <p className="mt-1 font-medium text-slate-900">Non-diagnostic</p>
              </div>
            </div>
          </header>

          <div
            ref={scrollAreaRef}
            className="flex-1 space-y-4 overflow-y-auto px-3 py-4 sm:px-4"
          >
            {showWelcomeState ? (
              <div className="assistant-empty-state rounded-[1.6rem] px-4 py-4 sm:px-5">
                <div className="flex items-start gap-3">
                  <div className="assistant-empty-icon flex h-11 w-11 items-center justify-center rounded-2xl text-slate-950">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">
                      Ask for a fast health summary
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      I can review vitals, risk, alerts, medications, care plans,
                      and what may need attention next without leaving this page.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`empty-${suggestion}`}
                      type="button"
                      onClick={() => submitPrompt(suggestion)}
                      className="assistant-chip-primary"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((message, index) => {
              const isLastAssistantReply =
                message.role === "assistant" && index === messages.length - 1;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className={`flex max-w-[92%] items-end gap-2 sm:max-w-[86%] ${
                    message.role === "assistant" ? "" : "flex-row-reverse"
                  }`}>
                    <div
                      className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${
                        message.role === "assistant"
                          ? "bg-[linear-gradient(135deg,rgba(15,118,110,0.14)_0%,rgba(8,145,178,0.14)_100%)] text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-slate-950 text-white"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Bot className="h-4 w-4" />
                      ) : (
                        <MessageSquareText className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-[1.55rem] px-4 py-3 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.38)] ${
                      message.role === "assistant"
                        ? `assistant-bubble-assistant border border-emerald-100/80 text-slate-800 ${
                            isLastAssistantReply ? "assistant-reply-bubble" : ""
                          }`
                        : "assistant-bubble-user text-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em]">
                        {message.role === "assistant" ? (
                          <>
                            <Activity className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-700">PulseAI</span>
                          </>
                        ) : (
                          <span className="text-white/72">You</span>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                      <p
                        className={`mt-3 text-[11px] ${
                          message.role === "assistant"
                            ? "text-slate-400"
                            : "text-white/70"
                        }`}
                      >
                        {message.createdAt
                          ? formatMessageTime(message.createdAt)
                          : "\u00A0"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping ? (
              <div className="flex justify-start">
                <div className="flex items-end gap-2">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,118,110,0.14)_0%,rgba(8,145,178,0.14)_100%)] text-emerald-700 ring-1 ring-emerald-100">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="assistant-bubble-assistant rounded-[1.55rem] border border-emerald-100/80 px-4 py-3 shadow-[0_18px_38px_-28px_rgba(15,23,42,0.38)]">
                  <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                    <Activity className="h-3.5 w-3.5 text-emerald-600" />
                    <span>PulseAI</span>
                  </div>
                  <div className="assistant-typing">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.96)_100%)] px-3 py-4 sm:px-4">
            <div className="mb-3 rounded-[1.35rem] border border-white/85 bg-white/72 p-2 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.24)]">
              <button
                type="button"
                onClick={() => setShowSuggestionTray((currentValue) => !currentValue)}
                className="flex w-full items-center justify-between rounded-[1.05rem] px-3 py-2 text-left transition hover:bg-emerald-50/60"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Suggested prompts
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {showSuggestionTray
                      ? "Tap a question to ask PulseAI quickly."
                      : "Suggestions hidden after your selection. Tap to reopen."}
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                  {showSuggestionTray ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </span>
              </button>

              {showSuggestionTray ? (
                <div className="mt-2 flex flex-wrap gap-2 px-1 pb-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => submitPrompt(suggestion)}
                      className="assistant-chip-secondary"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="rounded-[1.65rem] border border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(244,250,248,0.92)_100%)] p-2 shadow-[0_22px_45px_-34px_rgba(15,23,42,0.34)] ring-1 ring-slate-900/5">
                <div className="flex items-end gap-2 sm:gap-3">
                <label htmlFor="pulse-ai-input" className="sr-only">
                  Ask PulseAI
                </label>
                <textarea
                  id="pulse-ai-input"
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submitPrompt(inputValue);
                    }
                  }}
                  rows={2}
                  placeholder={getComposerPlaceholder(snapshot.role)}
                  className="min-h-[3.25rem] flex-1 resize-none rounded-[1.25rem] border border-transparent bg-transparent px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-200 focus:bg-emerald-50/40"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#0f766e_0%,#12395d_100%)] text-white shadow-[0_18px_36px_-24px_rgba(15,118,110,0.72)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-24px_rgba(15,118,110,0.78)] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-xs leading-5 text-amber-900/80">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                <p>
                  PulseAI uses your in-app data for supportive summaries and does
                  not provide a medical diagnosis.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
