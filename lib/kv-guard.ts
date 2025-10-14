/**
 * Guards de tamanho, caps e helpers de serialização para KV
 */

/**
 * Calcula tamanho em bytes de uma string (UTF-8)
 */
export function byteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Limita string por bytes (UTF-8 safe)
 * Adiciona "…" se truncar
 */
export function capStringByBytes(input: string, maxBytes: number): string {
  const size = byteLength(input);
  if (size <= maxBytes) return input;

  // Binary search para encontrar maior substring que cabe
  let lo = 0;
  let hi = input.length;
  let result = "";

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const slice = input.slice(0, mid);
    const sliceSize = byteLength(slice);

    if (sliceSize <= maxBytes - 3) {
      // -3 para "…"
      result = slice;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  return result + "…";
}

/**
 * Limita campos de um objeto por bytes
 */
export function capObjectFields<T extends Record<string, unknown>>(
  obj: T,
  caps: Record<string, number>
): T {
  const clone: Record<string, unknown> = { ...obj };

  for (const [field, maxBytes] of Object.entries(caps)) {
    if (typeof clone[field] === "string") {
      clone[field] = capStringByBytes(clone[field] as string, maxBytes);
    }
  }

  return clone as T;
}

/**
 * Serializa objeto com caps por campo e cap total
 */
export function serializeWithCap<T>(
  obj: T,
  perFieldCaps: Record<string, number>,
  totalCapBytes: number
): string {
  // Aplicar caps por campo primeiro
  const capped: unknown = capObjectFields(
    obj as Record<string, unknown>,
    perFieldCaps
  );
  let json = JSON.stringify(capped);

  // Se ainda está dentro do limite, retornar
  if (byteLength(json) <= totalCapBytes) {
    return json;
  }

  // Reduzir campos agressivamente (50% dos caps)
  for (const field of Object.keys(perFieldCaps)) {
    const cappedObj = capped as Record<string, unknown>;
    if (typeof cappedObj[field] === "string") {
      const reducedCap = Math.max(256, Math.floor(perFieldCaps[field] * 0.5));
      cappedObj[field] = capStringByBytes(
        cappedObj[field] as string,
        reducedCap
      );
    }
  }

  json = JSON.stringify(capped);

  // Se ainda não cabe, truncar o JSON inteiro
  if (byteLength(json) > totalCapBytes) {
    return capStringByBytes(json, totalCapBytes);
  }

  return json;
}

/**
 * Limita array de itens até caber no budget de bytes
 */
export function capArrayByBytes<T>(
  arr: T[],
  toJson: (item: T) => unknown,
  maxBytes: number
): T[] {
  const result: T[] = [];
  let totalBytes = 2; // "{}"

  for (const item of arr) {
    const itemJson = JSON.stringify(toJson(item));
    const itemSize = byteLength(itemJson);
    const separator = result.length > 0 ? 1 : 0; // ","

    if (totalBytes + itemSize + separator > maxBytes) {
      // Não cabe mais
      break;
    }

    result.push(item);
    totalBytes += itemSize + separator;
  }

  return result;
}

/**
 * Estatísticas de payload
 */
export function getPayloadStats(payload: string) {
  const bytes = byteLength(payload);
  return {
    bytes,
    kb: (bytes / 1024).toFixed(2),
    chars: payload.length,
  };
}
