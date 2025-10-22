"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { AiOutlineLoading } from "react-icons/ai";
import { FaGithub } from "react-icons/fa";
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
        <AiOutlineLoading className="w-3.5 h-3.5 mr-1.5 animate-spin" />
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
          <AiOutlineLoading className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          Entrando...
        </>
      ) : (
        <>
          <FaGithub className="w-3.5 h-3.5 mr-1.5" />
          Entrar com GitHub
        </>
      )}
    </Button>
  );
}
