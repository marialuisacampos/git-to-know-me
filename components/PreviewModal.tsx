"use client";

import { useEffect, useState } from "react";
import { HiEye, HiExternalLink, HiX, HiExclamation } from "react-icons/hi";
import { Button } from "@/components/base-ui/Button";

interface PreviewModalProps {
  url: string;
  title?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewModal({
  url,
  title,
  open,
  onOpenChange,
}: PreviewModalProps) {
  const [blocked, setBlocked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Controlar animação de saída
  useEffect(() => {
    if (open) {
      setIsAnimating(true);
      setBlocked(false); // Reset blocked state ao abrir
    } else if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open, isAnimating]);

  // Fechar com ESC
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!isAnimating) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      <div
        className={`fixed inset-0 z-[201] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
        onClick={() => onOpenChange(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-6xl h-[90vh] bg-slate-950 border border-slate-800/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <HiEye className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-bold text-slate-100 truncate">
                  {title || "Live Preview"}
                </h2>
                <p className="text-xs text-slate-500 truncate">{url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 text-slate-300"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <HiExternalLink className="w-4 h-4" />
                  Nova aba
                </a>
              </Button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg p-2 transition-all duration-150"
                aria-label="Fechar preview"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 relative bg-slate-950">
            {!blocked ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">
                      Carregando preview...
                    </p>
                  </div>
                </div>

                <iframe
                  src={url}
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups"
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    const parent = e.currentTarget.parentElement;
                    const loading = parent?.querySelector(".absolute");
                    if (loading) loading.remove();
                  }}
                  onError={() => setBlocked(true)}
                  title={title || "Preview"}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <HiExclamation className="w-8 h-8 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    Preview não disponível
                  </h3>
                  <p className="text-slate-400 max-w-md">
                    Este site não permite incorporação em iframe por motivos de
                    segurança (X-Frame-Options).
                  </p>
                </div>
                <Button asChild size="lg" className="primary">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <HiExternalLink className="w-5 h-5" />
                    Abrir em nova aba
                  </a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
