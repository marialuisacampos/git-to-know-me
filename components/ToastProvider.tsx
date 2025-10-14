"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "rgb(15 23 42)",
          border: "1px solid rgb(51 65 85)",
          color: "rgb(241 245 249)",
        },
      }}
    />
  );
}
