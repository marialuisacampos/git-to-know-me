"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/base-ui/Button";
import Image from "next/image";
import { useState } from "react";
import { useUserData } from "@/contexts/UserDataContext";

export function AuthButton() {
  const { data: session, status } = useSession();
  const { isLoading: isLoadingData } = useUserData();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (status === "loading" || isLoadingData) {
    return (
      <Button disabled variant="outline" size="sm" className="h-8">
        <svg
          className="w-3.5 h-3.5 mr-1.5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-xs">Carregando...</span>
      </Button>
    );
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "Avatar"}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="text-sm">
            <p className="font-medium">{session.user.name}</p>
            {session.user.username && (
              <p className="text-slate-400">@{session.user.username}</p>
            )}
          </div>
        </div>
        <Button
          onClick={() => signOut()}
          variant="outline"
          size="sm"
          className="h-8 text-xs"
        >
          Sair
        </Button>
      </div>
    );
  }

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signIn("github");
    } catch {
      setIsSigningIn(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isSigningIn}
      variant="default"
      size="sm"
      className="h-8 text-xs"
    >
      {isSigningIn ? (
        <>
          <svg
            className="w-3.5 h-3.5 mr-1.5 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Entrando...
        </>
      ) : (
        <>
          <svg
            className="w-3.5 h-3.5 mr-1.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Entrar com GitHub
        </>
      )}
    </Button>
  );
}
