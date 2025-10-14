import { z } from "zod";

/**
 * Schema de configuração do usuário
 * Caps: bio ≤ 240 chars
 */
export const UserConfigSchema = z.object({
  bio: z.string().max(240).optional(),
  includeRepos: z.array(z.string()).optional(),
  excludeRepos: z.array(z.string()).optional(),
  customPreviewUrls: z.record(z.string(), z.string().url()).optional(),
});

export type UserConfig = z.infer<typeof UserConfigSchema>;

/**
 * Schema de metadados de projeto
 * Caps: summary ≤ 800 bytes, descriptionHtml removido (usar summary)
 */
export const ProjectMetaSchema = z.object({
  fullName: z.string(),
  name: z.string(),
  descriptionHtml: z.string().optional(), // Deprecated, usar summary
  language: z.string().nullish(),
  topics: z.array(z.string()).default([]),
  stars: z.number().int().nonnegative().default(0),
  pushedAt: z.string().nullish(),
  homepageUrl: z.string().url().nullish(),
  previewUrl: z.string().url().nullish(),
  summary: z.string().max(800).optional(), // Resumo curto para listagem
});

export type ProjectMeta = z.infer<typeof ProjectMetaSchema>;

/**
 * Schema de lista de projetos
 * Cap total: 32KB
 */
export const ProjectListSchema = z.object({
  projects: z.array(ProjectMetaSchema),
});

export type ProjectList = z.infer<typeof ProjectListSchema>;

/**
 * Schema de metadados de post
 * Caps: summary ≤ 800 bytes, contentMdx ≤ 20KB
 */
export const PostMetaSchema = z.object({
  slug: z.string(),
  title: z.string().min(1),
  summary: z.string().max(800).optional(),
  contentMdx: z.string().max(20_000), // 20KB cap
  tags: z.array(z.string()).default([]),
  publishedAt: z.string(), // ISO string
});

export type PostMeta = z.infer<typeof PostMetaSchema>;

/**
 * Schema de lista de posts
 * Cap total: 64KB
 */
export const PostListSchema = z.object({
  posts: z.array(PostMetaSchema),
});

export type PostList = z.infer<typeof PostListSchema>;

/**
 * Schema de metadados de registro
 */
export const UserMetaSchema = z.object({
  registeredAt: z.string(), // ISO string
});

export type UserMeta = z.infer<typeof UserMetaSchema>;
