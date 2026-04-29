"use client";

// A 70-line custom toast system — no external dependency.
// Anywhere in client code:
//   import { toast } from "@/components/Toaster";
//   toast.success("已送出！");
//   toast.error("出錯了：" + msg);
//
// <Toaster /> mounted once at the root layout subscribes to events and
// renders the stack. Toasts auto-dismiss after `duration`.

import { useEffect, useState } from "react";

type Kind = "success" | "error" | "info";
type Toast = { id: number; message: string; kind: Kind; duration: number };

let nextId = 1;
const listeners = new Set<(t: Toast) => void>();

function emit(message: string, kind: Kind, duration = 2500) {
  const t: Toast = { id: nextId++, message, kind, duration };
  for (const fn of listeners) fn(t);
}

export const toast = {
  success: (msg: string, duration?: number) => emit(msg, "success", duration),
  error: (msg: string, duration?: number) => emit(msg, "error", duration ?? 4000),
  info: (msg: string, duration?: number) => emit(msg, "info", duration),
};

const KIND_STYLES: Record<Kind, string> = {
  success: "bg-rank-cold border-[#2D4A3A] text-[#2D4A3A]",
  error: "bg-[#F0C4B5] border-[#79261A] text-[#4A1B0C]",
  info: "bg-rank-mid border-[#5A4A1F] text-[#5A4A1F]",
};

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, t.duration);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto animate-toast-in rounded-full border-2 px-4 py-2 text-sm font-medium shadow-md ${KIND_STYLES[t.kind]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
