"use client";

import { FaLinkedin, FaTwitter } from "react-icons/fa";
import { HiLink } from "react-icons/hi";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  title: string;
  summary?: string;
}

export function ShareButton({ url, title, summary }: ShareButtonProps) {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`;

  const twitterText = `${title}${
    summary ? `\n\n${summary}` : ""
  }\n\n📝 git-to-know-me`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    twitterText
  )}&url=${encodeURIComponent(url)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-3 bg-blue-600/90 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
      >
        <FaLinkedin className="w-3.5 h-3.5" />
        LinkedIn
      </a>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs rounded-md transition-colors"
      >
        <FaTwitter className="w-3.5 h-3.5" />
        Twitter
      </a>

      <button
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 h-8 px-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 text-xs rounded-md transition-colors"
      >
        <HiLink className="w-3.5 h-3.5" />
        Copiar
      </button>
    </div>
  );
}
