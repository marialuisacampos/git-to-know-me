"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

// ─── Context ────────────────────────────────────────────────────────────────

interface LikeContextValue {
  liked: boolean;
  count: number;
  isLoading: boolean;
  mounted: boolean;
  handleClick: () => void;
}

const LikeContext = createContext<LikeContextValue | null>(null);

function useLikeContext() {
  const ctx = useContext(LikeContext);
  if (!ctx) throw new Error("LikeButton must be used inside LikeProvider");
  return ctx;
}

// ─── Storage helpers ─────────────────────────────────────────────────────────

const STORAGE_KEY = "gtkm:liked-posts";

function getLikedPosts(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function setLikedPosts(posts: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...posts]));
  } catch {
    // localStorage indisponível ou cheio
  }
}

function postKey(username: string, slug: string) {
  return `${username}/${slug}`;
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface LikeProviderProps {
  username: string;
  slug: string;
  initialLikesCount?: number;
  children: React.ReactNode;
}

export function LikeProvider({
  username,
  slug,
  initialLikesCount = 0,
  children,
}: LikeProviderProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialLikesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const key = postKey(username, slug);
    const likedPosts = getLikedPosts();
    setLiked(likedPosts.has(key));

    fetch(`/api/posts/like?username=${username}&slug=${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.likesCount === "number") setCount(data.likesCount);
        if (typeof data.liked === "boolean") {
          setLiked(data.liked);
          const posts = getLikedPosts();
          if (data.liked) posts.add(key);
          else posts.delete(key);
          setLikedPosts(posts);
        }
      })
      .catch(() => {});
  }, [username, slug]);

  const handleClick = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    const key = postKey(username, slug);
    const wasLiked = liked;

    setLiked(!wasLiked);
    setCount((prev) => (wasLiked ? Math.max(0, prev - 1) : prev + 1));

    try {
      const res = await fetch(
        `/api/posts/like?username=${username}&slug=${encodeURIComponent(slug)}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (typeof data.likesCount === "number") setCount(data.likesCount);
      if (typeof data.liked === "boolean") {
        setLiked(data.liked);
        const posts = getLikedPosts();
        if (data.liked) posts.add(key);
        else posts.delete(key);
        setLikedPosts(posts);
      }
    } catch {
      setLiked(wasLiked);
      setCount((prev) => (wasLiked ? prev + 1 : Math.max(0, prev - 1)));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, liked, username, slug]);

  return (
    <LikeContext.Provider value={{ liked, count, isLoading, mounted, handleClick }}>
      {children}
    </LikeContext.Provider>
  );
}

// ─── Button variants ──────────────────────────────────────────────────────────

interface LikeButtonProps {
  /** @default "default" */
  variant?: "default" | "compact";
  /** Fallback para SSR antes do provider montar */
  initialLikesCount?: number;
}

export function LikeButton({ variant = "default", initialLikesCount = 0 }: LikeButtonProps) {
  const { liked, count, isLoading, mounted, handleClick } = useLikeContext();

  if (variant === "compact") {
    return (
      <button
        onClick={mounted ? handleClick : undefined}
        disabled={!mounted || isLoading}
        aria-label={liked ? "Remover curtida" : "Curtir post"}
        className={`
          group/like inline-flex items-center gap-1.5 text-xs transition-all duration-300
          ${
            liked
              ? "text-pink-400"
              : "text-slate-500 hover:text-pink-400/80"
          }
          ${!mounted || isLoading ? "opacity-60 cursor-default" : "cursor-pointer"}
        `}
      >
        <HeartIcon filled={liked} size={14} />
        <span className="tabular-nums">{mounted ? count : initialLikesCount}</span>
      </button>
    );
  }

  // variant === "default"
  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          disabled
          className="group/like flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800/50 bg-slate-900/30 text-slate-500 cursor-default transition-all"
        >
          <HeartIcon filled={false} size={16} />
          <span className="text-sm tabular-nums">{initialLikesCount}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleClick}
        disabled={isLoading}
        aria-label={liked ? "Remover curtida" : "Curtir post"}
        className={`
          group/like flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-300
          ${
            liked
              ? "border-pink-500/30 bg-pink-500/10 text-pink-400 hover:bg-pink-500/15"
              : "border-slate-800/50 bg-slate-900/30 text-slate-500 hover:border-pink-500/20 hover:text-pink-400/80 hover:bg-pink-500/5"
          }
          ${isLoading ? "opacity-70 cursor-wait" : "cursor-pointer"}
        `}
      >
        <HeartIcon filled={liked} size={16} />
        <span className="text-sm tabular-nums">{count}</span>
      </button>
    </div>
  );
}

// ─── Icon ─────────────────────────────────────────────────────────────────────

function HeartIcon({ filled, size }: { filled: boolean; size: number }) {
  if (filled) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="transition-transform duration-300 scale-110"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="transition-transform duration-300 group-hover/like:scale-110"
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}
