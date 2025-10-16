import { db } from "@/lib/db";
import type { PostMeta } from "@/types/portfolio";

export async function getUserPosts(username: string): Promise<PostMeta[]> {
  try {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        posts: {
          select: {
            slug: true,
            title: true,
            summary: true,
            contentMdx: true,
            tags: true,
            publishedAt: true,
          },
          orderBy: {
            publishedAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    return user.posts.map(
      (post: {
        slug: string;
        title: string;
        summary: string | null;
        contentMdx: string;
        tags: unknown;
        publishedAt: Date;
      }): PostMeta => ({
        slug: post.slug,
        title: post.title,
        summary: post.summary || undefined,
        contentMdx: post.contentMdx,
        tags: post.tags ? (post.tags as string[]) : undefined,
        publishedAt: post.publishedAt.toISOString(),
      })
    );
  } catch {
    return [];
  }
}

export async function getUserPost(
  username: string,
  slug: string
): Promise<PostMeta | null> {
  try {
    const post = await db.blogPost.findFirst({
      where: {
        user: { username },
        slug,
      },
      select: {
        slug: true,
        title: true,
        summary: true,
        contentMdx: true,
        tags: true,
        publishedAt: true,
      },
    });

    if (!post) {
      return null;
    }

    return {
      slug: post.slug,
      title: post.title,
      summary: post.summary || undefined,
      contentMdx: post.contentMdx,
      tags: post.tags ? (post.tags as string[]) : undefined,
      publishedAt: post.publishedAt.toISOString(),
    };
  } catch {
    return null;
  }
}

export async function setUserPosts(
  username: string,
  posts: PostMeta[]
): Promise<void> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentPosts = await db.blogPost.findMany({
    where: { userId: user.id },
    select: { slug: true },
  });

  const currentSlugs = new Set<string>(
    currentPosts.map((p: { slug: string }) => p.slug)
  );
  const newSlugs = new Set<string>(posts.map((p) => p.slug));

  const toDelete = Array.from(currentSlugs).filter(
    (slug) => !newSlugs.has(slug)
  );

  if (toDelete.length > 0) {
    await db.blogPost.deleteMany({
      where: {
        userId: user.id,
        slug: { in: toDelete },
      },
    });
  }

  await db.$transaction(
    posts.map((post) =>
      db.blogPost.upsert({
        where: {
          userId_slug: {
            userId: user.id,
            slug: post.slug,
          },
        },
        create: {
          userId: user.id,
          slug: post.slug,
          title: post.title,
          summary: post.summary,
          contentMdx: post.contentMdx,
          tags: post.tags || undefined,
          publishedAt: new Date(post.publishedAt),
        },
        update: {
          title: post.title,
          summary: post.summary,
          contentMdx: post.contentMdx,
          tags: post.tags || undefined,
          publishedAt: new Date(post.publishedAt),
        },
      })
    )
  );
}

export async function deleteUserPosts(username: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  await db.blogPost.deleteMany({
    where: { userId: user.id },
  });
}
