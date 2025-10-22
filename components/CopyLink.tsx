"use client";

import { useState } from "react";
import { HiCheck, HiClipboardCopy } from "react-icons/hi";
import { Button } from "@/components/base-ui/Button";

interface CopyLinkProps {
  url: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function CopyLink({
  url,
  variant = "ghost",
  size = "sm",
}: CopyLinkProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className="gap-2 w-full"
      aria-label={copied ? "Link copiado" : "Copiar link"}
    >
      {copied ? (
        <>
          <HiCheck className="w-4 h-4" />
          Copiado
        </>
      ) : (
        <>
          <HiClipboardCopy className="w-4 h-4" />
          Copiar
        </>
      )}
    </Button>
  );
}
