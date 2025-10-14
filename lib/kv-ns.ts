/**
 * Namespace de ambiente para KV
 * Evita cruzar dados entre dev/preview/production
 */

export type EnvName = "development" | "preview" | "production";

/**
 * Detecta o ambiente atual
 */
export function getEnvName(): EnvName {
  // Vercel injeta VERCEL_ENV nos deploys
  if (process.env.VERCEL_ENV === "production") return "production";
  if (process.env.VERCEL_ENV === "preview") return "preview";

  // Fallback para NODE_ENV
  if (process.env.NODE_ENV === "production") return "production";

  return "development";
}

/**
 * Adiciona namespace ao key
 */
export function namespaceKey(key: string): string {
  const env = getEnvName();
  return `${env}:${key}`;
}

/**
 * Assert: não permitir escrita em prod a partir do local
 */
export function assertNotLocalToProdWrite(): void {
  const isLocal = !process.env.VERCEL;
  const env = getEnvName();

  if (isLocal && env === "production") {
    throw new Error(
      "Blocked: tentativa de escrita em KV de produção a partir do ambiente local."
    );
  }
}

/**
 * Get environment info for logging
 */
export function getEnvInfo() {
  return {
    env: getEnvName(),
    isVercel: Boolean(process.env.VERCEL),
    isLocal: !process.env.VERCEL,
  };
}
