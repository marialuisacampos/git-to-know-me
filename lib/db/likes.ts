import { db } from "@/lib/db";

export async function getPostLikesCount(
  blogPostId: string
): Promise<number> {
  const post = await db.blogPost.findUnique({
    where: { id: blogPostId },
    select: { likesCount: true },
  });
  return post?.likesCount ?? 0;
}

export async function hasAlreadyLiked(
  blogPostId: string,
  fingerprint: string
): Promise<boolean> {
  const like = await db.blogPostLike.findUnique({
    where: {
      blogPostId_fingerprint: { blogPostId, fingerprint },
    },
  });
  return !!like;
}

export async function toggleLike(
  blogPostId: string,
  fingerprint: string
): Promise<{ liked: boolean; likesCount: number }> {
  const existing = await db.blogPostLike.findUnique({
    where: {
      blogPostId_fingerprint: { blogPostId, fingerprint },
    },
  });

  if (existing) {
    await db.$transaction([
      db.blogPostLike.delete({
        where: { id: existing.id },
      }),
      db.blogPost.update({
        where: { id: blogPostId },
        data: { likesCount: { decrement: 1 } },
      }),
    ]);

    const post = await db.blogPost.findUnique({
      where: { id: blogPostId },
      select: { likesCount: true },
    });

    return { liked: false, likesCount: post?.likesCount ?? 0 };
  }

  await db.$transaction([
    db.blogPostLike.create({
      data: { blogPostId, fingerprint },
    }),
    db.blogPost.update({
      where: { id: blogPostId },
      data: { likesCount: { increment: 1 } },
    }),
  ]);

  const post = await db.blogPost.findUnique({
    where: { id: blogPostId },
    select: { likesCount: true },
  });

  return { liked: true, likesCount: post?.likesCount ?? 0 };
}

export async function getPostIdBySlug(
  username: string,
  slug: string
): Promise<string | null> {
  const post = await db.blogPost.findFirst({
    where: {
      user: { username },
      slug,
    },
    select: { id: true },
  });
  return post?.id ?? null;
}
