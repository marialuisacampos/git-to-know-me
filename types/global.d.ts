// Type declarations for MDX files
declare module "*.mdx" {
  import type { MDXProps } from "mdx/types";

  export default function MDXContent(props: MDXProps): JSX.Element;
  export const meta: Record<string, unknown>;
}

// Type declarations for MDX content
declare module "*.md" {
  const content: string;
  export default content;
}

// Extend global types if needed
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_ID: string;
      GITHUB_SECRET: string;
      NEXTAUTH_SECRET: string;
      NEXTAUTH_URL: string;
      REDIS_URL: string;
      DATABASE_URL: string;
    }
  }
}

export {};
