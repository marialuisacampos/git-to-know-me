import { NextResponse } from "next/server";
import { getUserProjects, getUserPosts, getUserConfig } from "@/lib/kv";
import {
  ProjectListSchema,
  PostListSchema,
  UserConfigSchema,
} from "@/types/schemas";
import { byteLength } from "@/lib/kv-guard";
import { getEnvInfo } from "@/lib/kv-ns";

/**
 * GET /api/kv-audit?u=<username>
 * Auditoria de dados do KV - verifica tamanho, validade e budget
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("u");

  if (!username) {
    return NextResponse.json(
      { error: "Query parameter 'u' (username) é obrigatório" },
      { status: 400 }
    );
  }

  // Budgets definidos
  const BUDGETS = {
    config: 4 * 1024, // 4KB
    projects: 32 * 1024, // 32KB
    posts: 64 * 1024, // 64KB
  };

  const report: {
    username: string;
    environment: ReturnType<typeof getEnvInfo>;
    budgets: typeof BUDGETS;
    items: Array<{
      key: string;
      size?: number;
      sizeKb?: string;
      budget?: number;
      budgetKb?: string;
      valid?: boolean;
      errors?: string[];
      over?: boolean;
      missing?: boolean;
      percentage?: string;
    }>;
    summary: {
      totalSize: number;
      totalSizeKb: string;
      allValid: boolean;
      anyOverBudget: boolean;
    };
  } = {
    username,
    environment: getEnvInfo(),
    budgets: BUDGETS,
    items: [],
    summary: {
      totalSize: 0,
      totalSizeKb: "0",
      allValid: true,
      anyOverBudget: false,
    },
  };

  // Auditar UserConfig
  try {
    const config = await getUserConfig(username);
    const jsonData = JSON.stringify(config);
    const size = byteLength(jsonData);
    let valid = false;
    const errors: string[] = [];

    try {
      UserConfigSchema.parse(config);
      valid = true;
    } catch (e: unknown) {
      errors.push(String(e));
    }

    const over = size > BUDGETS.config;
    report.items.push({
      key: "user:config",
      size,
      sizeKb: (size / 1024).toFixed(2),
      budget: BUDGETS.config,
      budgetKb: (BUDGETS.config / 1024).toFixed(0),
      valid,
      errors,
      over,
      percentage: ((size / BUDGETS.config) * 100).toFixed(1) + "%",
    });

    report.summary.totalSize += size;
    if (!valid) report.summary.allValid = false;
    if (over) report.summary.anyOverBudget = true;
  } catch {
    report.items.push({ key: "user:config", missing: true });
  }

  // Auditar Projects
  try {
    const projects = await getUserProjects(username);
    const jsonData = JSON.stringify(projects);
    const size = byteLength(jsonData);
    let valid = false;
    const errors: string[] = [];

    try {
      ProjectListSchema.parse({ projects });
      valid = true;
    } catch (e: unknown) {
      errors.push(String(e));
    }

    const over = size > BUDGETS.projects;
    report.items.push({
      key: "user:projects",
      size,
      sizeKb: (size / 1024).toFixed(2),
      budget: BUDGETS.projects,
      budgetKb: (BUDGETS.projects / 1024).toFixed(0),
      valid,
      errors,
      over,
      percentage: ((size / BUDGETS.projects) * 100).toFixed(1) + "%",
    });

    report.summary.totalSize += size;
    if (!valid) report.summary.allValid = false;
    if (over) report.summary.anyOverBudget = true;
  } catch {
    report.items.push({ key: "user:projects", missing: true });
  }

  // Auditar Posts
  try {
    const posts = await getUserPosts(username);
    const jsonData = JSON.stringify(posts);
    const size = byteLength(jsonData);
    let valid = false;
    const errors: string[] = [];

    try {
      PostListSchema.parse({ posts });
      valid = true;
    } catch (e: unknown) {
      errors.push(String(e));
    }

    const over = size > BUDGETS.posts;
    report.items.push({
      key: "user:posts",
      size,
      sizeKb: (size / 1024).toFixed(2),
      budget: BUDGETS.posts,
      budgetKb: (BUDGETS.posts / 1024).toFixed(0),
      valid,
      errors,
      over,
      percentage: ((size / BUDGETS.posts) * 100).toFixed(1) + "%",
    });

    report.summary.totalSize += size;
    if (!valid) report.summary.allValid = false;
    if (over) report.summary.anyOverBudget = true;
  } catch {
    report.items.push({ key: "user:posts", missing: true });
  }

  // Calcular summary
  report.summary.totalSizeKb = (report.summary.totalSize / 1024).toFixed(2);

  return NextResponse.json(report, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
