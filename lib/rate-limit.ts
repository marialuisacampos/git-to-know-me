/**
 * Rate limiter simples em memória
 * Para produção com múltiplas instâncias, use Redis
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup automático a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Número máximo de requests permitidos
   */
  max: number;

  /**
   * Janela de tempo em segundos
   */
  windowSeconds: number;
}

export interface RateLimitResult {
  /**
   * Se o request é permitido
   */
  allowed: boolean;

  /**
   * Número de requests restantes
   */
  remaining: number;

  /**
   * Quando o rate limit reseta (timestamp)
   */
  resetAt: number;
}

/**
 * Verifica rate limit para um identificador
 *
 * @param identifier - ID único (ex: username, IP)
 * @param config - Configuração do rate limit
 * @returns Resultado do rate limit
 *
 * @example
 * ```typescript
 * const result = checkRateLimit("user123", { max: 1, windowSeconds: 60 });
 *
 * if (!result.allowed) {
 *   return Response.json(
 *     { error: "Rate limit exceeded", resetAt: result.resetAt },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  // Buscar entry existente
  let entry = rateLimitStore.get(identifier);

  // Se não existe ou expirou, criar novo
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }

  // Incrementar contador
  entry.count++;

  // Verificar se excedeu o limite
  const allowed = entry.count <= config.max;
  const remaining = Math.max(0, config.max - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Limpa rate limits de um identificador
 * Útil para testes ou reset manual
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Retorna informações de rate limit sem incrementar
 */
export function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const entry = rateLimitStore.get(identifier);
  const now = Date.now();

  if (!entry || now > entry.resetAt) {
    return {
      allowed: true,
      remaining: config.max,
      resetAt: now + config.windowSeconds * 1000,
    };
  }

  return {
    allowed: entry.count < config.max,
    remaining: Math.max(0, config.max - entry.count),
    resetAt: entry.resetAt,
  };
}
