"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "var(--color-slate-900)",
          border: "1px solid var(--color-slate-700)",
          color: "var(--color-slate-100)",
        },
      }}
    />
  );
}
