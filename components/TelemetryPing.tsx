"use client";

import { useEffect } from "react";

/**
 * Componente para ping de telemetria
 * Atualiza lastSeenAt a cada 1 minuto
 */
export default function TelemetryPing() {
  useEffect(() => {
    // Primeiro ping imediato
    fetch("/api/telemetry/ping", { method: "POST" }).catch(() => {
      // Silenciosamente ignorar erros
    });

    // Ping a cada 1 minuto
    const intervalId = setInterval(() => {
      fetch("/api/telemetry/ping", { method: "POST" }).catch(() => {
        // Silenciosamente ignorar erros
      });
    }, 60_000); // 60 segundos

    return () => clearInterval(intervalId);
  }, []);

  return null; // Não renderiza nada
}
