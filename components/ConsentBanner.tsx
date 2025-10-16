"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/base-ui/Button";

export default function ConsentBanner() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emailOptIn, setEmailOptIn] = useState(true);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated" || !session?.user) {
      setLoading(false);
      return;
    }

    fetch("/api/consent")
      .then(async (r) => {
        if (r.ok) {
          const { consents } = await r.json();
          if (!consents?.privacyConsentAt || !consents?.tosAcceptedAt) {
            setOpen(true);
          }
          if (consents?.emailOptIn) {
            setEmailOptIn(true);
          }
        } else if (r.status === 404) {
          setOpen(true);
        } else {
          setOpen(true);
        }

        setLoading(false);
      })
      .catch(() => {
        setOpen(true);
        setLoading(false);
      });
  }, [session, status]);

  if (status === "loading" || loading) return null;

  if (!session?.user) return null;

  if (!open) return null;

  const onAccept = async () => {
    try {
      const response = await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOptIn,
          acceptPrivacy: true,
          acceptTos: true,
        }),
      });

      if (response.ok) {
        setOpen(false);
      } else {
        if (response.status === 404 || response.status === 500) {
          toast.error("Erro de configuração", {
            description:
              "Banco de dados não configurado. Configure DATABASE_URL e rode: npx prisma migrate dev",
          });
        } else {
          toast.error("Erro ao salvar consentimentos", {
            description: "Tente novamente.",
          });
        }
      }
    } catch {
      toast.error("Erro ao salvar consentimentos", {
        description: "Tente novamente mais tarde.",
      });
    }
  };

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-lg w-[92vw] z-50
                 bg-slate-900/95 backdrop-blur-xl border border-slate-800/50
                 rounded-xl p-4 shadow-2xl
                 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-100 mb-0.5">
              Privacidade e Consentimentos
            </h3>
            <p className="text-xs text-slate-500">
              Usamos seus dados conforme nossa Política de Privacidade e Termos
              de Uso
            </p>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={emailOptIn}
            onChange={(e) => setEmailOptIn(e.target.checked)}
            className="mt-0.5 w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-blue-600
                     focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          />
          <div className="flex-1">
            <span className="text-xs text-slate-300 font-medium group-hover:text-slate-100 transition-colors">
              Quero receber insights exclusivos para acelerar minha carreira em
              tech{" "}
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              Dicas de projetos, tendências do mercado e oportunidades ✨
            </p>
          </div>
        </label>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button onClick={() => setOpen(false)} variant="ghost" size="sm">
            Agora não
          </Button>
          <Button onClick={onAccept} size="sm" variant="primary">
            Aceitar
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-800/50">
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Privacidade
          </a>
          <span className="text-slate-800">•</span>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Termos
          </a>
        </div>
      </div>
    </div>
  );
}
