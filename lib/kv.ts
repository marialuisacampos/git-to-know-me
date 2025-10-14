import Redis from "ioredis";
import fs from "fs";
import path from "path";
import type { UserConfig, ProjectMeta, PostMeta } from "@/types/portfolio";
import { namespaceKey, assertNotLocalToProdWrite } from "./kv-ns";
import { UserConfigSchema } from "@/types/schemas";

// Cliente Redis Upstash
let redis: Redis | null = null;

// Fallback: arquivo JSON para persistir em dev
const DEV_CACHE_FILE = path.join(process.cwd(), ".kv-cache.json");

// Helper para carregar cache de arquivo
function loadDevCache(): Record<string, string> {
  try {
    if (fs.existsSync(DEV_CACHE_FILE)) {
      const data = fs.readFileSync(DEV_CACHE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Erro ao carregar cache dev:", error);
  }
  return {};
}

// Helper para salvar cache em arquivo
function saveDevCache(cache: Record<string, string>): void {
  try {
    fs.writeFileSync(DEV_CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao salvar cache dev:", error);
  }
}

function getRedisClient(): Redis | null {
  // Verificar se REDIS_URL está configurado (Vercel Redis)
  if (!process.env.REDIS_URL) {
    console.warn(
      "REDIS_URL não configurado. Usando fallback em arquivo (.kv-cache.json)."
    );
    return null;
  }

  if (!redis) {
    // Conectar usando URL completa (formato Vercel)
    // redis://default:password@host:port
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) {
          return null; // Desiste após 3 tentativas
        }
        return Math.min(times * 1000, 3000);
      },
      reconnectOnError(err) {
        const targetErrors = ["READONLY", "ETIMEDOUT"];
        if (
          targetErrors.some((targetError) => err.message.includes(targetError))
        ) {
          return true;
        }
        return false;
      },
    });

    // Log de conexão
    redis.on("connect", () => {
      console.log("[Redis] Conectado com sucesso");
    });

    redis.on("error", (err) => {
      console.error("[Redis] Erro de conexão:", err.message);
    });
  }

  return redis;
}

// Chaves Redis com namespace por ambiente
const keys = {
  userConfig: (username: string) => namespaceKey(`user:${username}:config`),
  userProjects: (username: string) => namespaceKey(`user:${username}:projects`),
  userPosts: (username: string) => namespaceKey(`user:${username}:posts`),
  userRegistered: (username: string) =>
    namespaceKey(`user:registered:${username}`),
  userMeta: (username: string) => namespaceKey(`user:meta:${username}`),
};

/**
 * Obtém a configuração do usuário
 */
export async function getUserConfig(username: string): Promise<UserConfig> {
  const client = getRedisClient();

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    const data = cache[keys.userConfig(username)];
    return data ? (JSON.parse(data) as UserConfig) : {};
  }

  try {
    const data = await client.get(keys.userConfig(username));
    if (!data) {
      return {};
    }
    return JSON.parse(data) as UserConfig;
  } catch (error) {
    console.error("Erro ao buscar UserConfig:", error);
    return {};
  }
}

/**
 * Atualiza a configuração do usuário (merge parcial)
 * Valida com Zod antes de salvar
 */
export async function setUserConfig(
  username: string,
  patch: Partial<UserConfig>
): Promise<void> {
  // Proteção: não escrever em prod do local
  try {
    assertNotLocalToProdWrite();
  } catch (error) {
    console.error("Blocked write:", error);
    throw error;
  }

  // Busca config atual e faz merge
  const currentConfig = await getUserConfig(username);
  const updatedConfig = { ...currentConfig, ...patch };

  // Validação com Zod
  const validated = UserConfigSchema.parse(updatedConfig);
  const jsonData = JSON.stringify(validated);

  const client = getRedisClient();

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    cache[keys.userConfig(username)] = jsonData;
    saveDevCache(cache);
    return;
  }

  try {
    // Salvar sem TTL (config é persistente)
    await client.set(keys.userConfig(username), jsonData);
  } catch (error) {
    console.error("Erro ao salvar UserConfig:", error);
    throw error;
  }
}

/**
 * Obtém os projetos do usuário
 */
export async function getUserProjects(
  username: string
): Promise<ProjectMeta[]> {
  const client = getRedisClient();

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    const data = cache[keys.userProjects(username)];
    return data ? (JSON.parse(data) as ProjectMeta[]) : [];
  }

  try {
    const data = await client.get(keys.userProjects(username));
    if (!data) {
      return [];
    }
    return JSON.parse(data) as ProjectMeta[];
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return [];
  }
}

/**
 * Salva os projetos do usuário
 * Com TTL de 12 horas (cache do sync)
 */
export async function setUserProjects(
  username: string,
  data: ProjectMeta[]
): Promise<void> {
  // Proteção: não escrever em prod do local
  try {
    assertNotLocalToProdWrite();
  } catch (error) {
    console.error("Blocked write:", error);
    throw error;
  }

  const client = getRedisClient();
  const jsonData = JSON.stringify(data);

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    cache[keys.userProjects(username)] = jsonData;
    saveDevCache(cache);
    return;
  }

  try {
    // TTL de 12 horas (projetos mudam relativamente devagar)
    const ttl = 12 * 60 * 60;
    await client.set(keys.userProjects(username), jsonData, "EX", ttl);

    console.log(`[KV] Projetos salvos com TTL de ${ttl}s`);
  } catch (error) {
    console.error("Erro ao salvar projetos:", error);
    throw error;
  }
}

/**
 * Obtém os posts do usuário
 */
export async function getUserPosts(username: string): Promise<PostMeta[]> {
  const client = getRedisClient();

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    const data = cache[keys.userPosts(username)];
    return data ? (JSON.parse(data) as PostMeta[]) : [];
  }

  try {
    const data = await client.get(keys.userPosts(username));
    if (!data) {
      return [];
    }
    return JSON.parse(data) as PostMeta[];
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return [];
  }
}

/**
 * Salva os posts do usuário
 * Com TTL de 24 horas (cache do sync)
 */
export async function setUserPosts(
  username: string,
  data: PostMeta[]
): Promise<void> {
  // Proteção: não escrever em prod do local
  try {
    assertNotLocalToProdWrite();
  } catch (error) {
    console.error("Blocked write:", error);
    throw error;
  }

  const client = getRedisClient();
  const jsonData = JSON.stringify(data);

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    cache[keys.userPosts(username)] = jsonData;
    saveDevCache(cache);
    return;
  }

  try {
    // TTL de 24 horas (posts podem mudar mais frequentemente)
    const ttl = 24 * 60 * 60;
    await client.set(keys.userPosts(username), jsonData, "EX", ttl);

    console.log(`[KV] Posts salvos com TTL de ${ttl}s`);
  } catch (error) {
    console.error("Erro ao salvar posts:", error);
    throw error;
  }
}

/**
 * Limpa todos os dados de um usuário (útil para testes)
 */
export async function clearUserData(username: string): Promise<void> {
  const client = getRedisClient();
  if (!client) {
    return;
  }

  try {
    await client.del(
      keys.userConfig(username),
      keys.userProjects(username),
      keys.userPosts(username)
    );
  } catch (error) {
    console.error("Erro ao limpar dados do usuário:", error);
    throw error;
  }
}

/**
 * Verifica se um usuário está registrado no sistema
 * Apenas usuários registrados podem ter perfis públicos
 */
export async function isUserRegistered(username: string): Promise<boolean> {
  const client = getRedisClient();

  if (!client) {
    // Fallback: verificar no arquivo JSON
    const cache = loadDevCache();
    return keys.userRegistered(username) in cache;
  }

  try {
    const exists = await client.exists(keys.userRegistered(username));
    return exists === 1;
  } catch (error) {
    console.error("Erro ao verificar registro:", error);
    return false;
  }
}

/**
 * Marca um usuário como registrado no sistema
 * Chamado automaticamente no primeiro login
 */
export async function setUserRegistered(username: string): Promise<void> {
  // Proteção: não escrever em prod do local
  try {
    assertNotLocalToProdWrite();
  } catch (error) {
    console.error("Blocked write:", error);
    throw error;
  }

  const metaData = JSON.stringify({
    registeredAt: new Date().toISOString(),
  });

  const client = getRedisClient();

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    cache[keys.userRegistered(username)] = "1";
    cache[keys.userMeta(username)] = metaData;
    saveDevCache(cache);
    console.log(`[DevCache] Usuário ${username} registrado com sucesso`);
    return;
  }

  try {
    // Registro é permanente (sem TTL)
    await client.set(keys.userRegistered(username), "1");
    await client.set(keys.userMeta(username), metaData);
    console.log(`[KV] Usuário ${username} registrado com sucesso`);
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    throw error;
  }
}

/**
 * Obtém metadados de registro do usuário
 */
export async function getUserMeta(
  username: string
): Promise<{ registeredAt: string } | null> {
  const client = getRedisClient();

  if (!client) {
    // Fallback: usar arquivo JSON
    const cache = loadDevCache();
    const data = cache[keys.userMeta(username)];
    return data ? (JSON.parse(data) as { registeredAt: string }) : null;
  }

  try {
    const data = await client.get(keys.userMeta(username));
    if (!data) {
      return null;
    }
    return JSON.parse(data) as { registeredAt: string };
  } catch (error) {
    console.error("Erro ao buscar metadados:", error);
    return null;
  }
}
