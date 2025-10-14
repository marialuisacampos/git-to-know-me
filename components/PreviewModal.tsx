"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

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
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
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
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  Nova aba
                </a>
              </Button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg p-2 transition-all duration-150"
                aria-label="Fechar preview"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 relative bg-slate-950">
            {!blocked ? (
              <>
                {/* Loading overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
                    <p className="text-sm text-slate-500">
                      Carregando preview...
                    </p>
                  </div>
                </div>

                {/* Iframe */}
                <iframe
                  src={url}
                  className="w-full h-full"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-pointer-lock allow-popups"
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    // Esconder loading quando carregar
                    const parent = e.currentTarget.parentElement;
                    const loading = parent?.querySelector(".absolute");
                    if (loading) loading.remove();
                  }}
                  onError={() => setBlocked(true)}
                  title={title || "Preview"}
                />
              </>
            ) : (
              // Fallback quando iframe é bloqueado
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
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
                <Button
                  asChild
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
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
