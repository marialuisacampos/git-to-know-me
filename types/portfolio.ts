export type UserConfig = {
  bio?: string;
  includeRepos?: string[];
  excludeRepos?: string[];
  customPreviewUrls?: Record<string, string>; // { repoName: customUrl }
  twitterUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
};

export type ProjectMeta = {
  fullName: string;
  name: string;
  descriptionHtml?: string;
  language?: string | null;
  topics?: string[];
  stars: number;
  pushedAt?: string | null;
  homepageUrl?: string | null;
  previewUrl?: string | null;
  summary?: string; // Resumo curto para listagem (max 800 bytes)
};

export type PostMeta = {
  slug: string;
  title: string;
  summary?: string;
  contentMdx: string;
  tags?: string[];
  publishedAt: string;
};
