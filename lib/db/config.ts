import { db } from "@/lib/db";
import type { UserConfig } from "@/types/portfolio";

export async function getUserConfig(username: string): Promise<UserConfig> {
  try {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        bio: true,
        twitterUrl: true,
        linkedinUrl: true,
        instagramUrl: true,
        config: {
          select: {
            includeRepos: true,
            excludeRepos: true,
            customPreviewUrls: true,
          },
        },
      },
    });

    if (!user) {
      return {};
    }

    const config = user.config;

    return {
      bio: user.bio || undefined,
      twitterUrl: user.twitterUrl || undefined,
      linkedinUrl: user.linkedinUrl || undefined,
      instagramUrl: user.instagramUrl || undefined,
      includeRepos: config?.includeRepos
        ? (config.includeRepos as string[])
        : undefined,
      excludeRepos: config?.excludeRepos
        ? (config.excludeRepos as string[])
        : undefined,
      customPreviewUrls: config?.customPreviewUrls
        ? (config.customPreviewUrls as Record<string, string>)
        : undefined,
    };
  } catch {
    return {};
  }
}

export async function setUserConfig(
  username: string,
  config: Partial<UserConfig>
): Promise<void> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (
    config.bio !== undefined ||
    config.twitterUrl !== undefined ||
    config.linkedinUrl !== undefined ||
    config.instagramUrl !== undefined
  ) {
    await db.user.update({
      where: { id: user.id },
      data: {
        bio: config.bio !== undefined ? config.bio || null : undefined,
        twitterUrl:
          config.twitterUrl !== undefined
            ? config.twitterUrl || null
            : undefined,
        linkedinUrl:
          config.linkedinUrl !== undefined
            ? config.linkedinUrl || null
            : undefined,
        instagramUrl:
          config.instagramUrl !== undefined
            ? config.instagramUrl || null
            : undefined,
      },
    });
  }

  await db.userConfig.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      includeRepos: config.includeRepos || undefined,
      excludeRepos: config.excludeRepos || undefined,
      customPreviewUrls: config.customPreviewUrls || undefined,
    },
    update: {
      includeRepos:
        config.includeRepos !== undefined
          ? config.includeRepos || undefined
          : undefined,
      excludeRepos:
        config.excludeRepos !== undefined
          ? config.excludeRepos || undefined
          : undefined,
      customPreviewUrls:
        config.customPreviewUrls !== undefined
          ? config.customPreviewUrls || undefined
          : undefined,
    },
  });
}

export async function deleteUserConfig(username: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  try {
    await db.userConfig.delete({
      where: { userId: user.id },
    });
  } catch {
    return;
  }
}
