import { db } from "@/lib/db";
import type { ProjectMeta } from "@/types/portfolio";

export async function getUserProjects(
  username: string
): Promise<ProjectMeta[]> {
  try {
    const user = await db.user.findUnique({
      where: { username },
      select: {
        projects: {
          select: {
            fullName: true,
            name: true,
            descriptionHtml: true,
            language: true,
            topics: true,
            stars: true,
            pushedAt: true,
            homepageUrl: true,
            previewUrl: true,
            summary: true,
          },
          orderBy: {
            stars: "desc",
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    return user.projects.map(
      (project: {
        fullName: string;
        name: string;
        descriptionHtml: string | null;
        language: string | null;
        topics: unknown;
        stars: number;
        pushedAt: Date | null;
        homepageUrl: string | null;
        previewUrl: string | null;
        summary: string | null;
      }): ProjectMeta => ({
        fullName: project.fullName,
        name: project.name,
        descriptionHtml: project.descriptionHtml || undefined,
        language: project.language,
        topics: project.topics ? (project.topics as string[]) : undefined,
        stars: project.stars,
        pushedAt: project.pushedAt?.toISOString() || null,
        homepageUrl: project.homepageUrl,
        previewUrl: project.previewUrl,
        summary: project.summary || undefined,
      })
    );
  } catch {
    return [];
  }
}

export async function setUserProjects(
  username: string,
  projects: ProjectMeta[]
): Promise<void> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const currentProjects = await db.project.findMany({
    where: { userId: user.id },
    select: { fullName: true },
  });

  const currentFullNames = new Set<string>(
    currentProjects.map((p: { fullName: string }) => p.fullName)
  );
  const newFullNames = new Set<string>(projects.map((p) => p.fullName));

  const toDelete = Array.from(currentFullNames).filter(
    (name) => !newFullNames.has(name)
  );

  if (toDelete.length > 0) {
    await db.project.deleteMany({
      where: {
        userId: user.id,
        fullName: { in: toDelete },
      },
    });
  }

  await db.$transaction(
    projects.map((project) =>
      db.project.upsert({
        where: {
          userId_fullName: {
            userId: user.id,
            fullName: project.fullName,
          },
        },
        create: {
          userId: user.id,
          fullName: project.fullName,
          name: project.name,
          descriptionHtml: project.descriptionHtml,
          language: project.language,
          topics: project.topics || undefined,
          stars: project.stars,
          pushedAt: project.pushedAt ? new Date(project.pushedAt) : null,
          homepageUrl: project.homepageUrl,
          previewUrl: project.previewUrl,
          summary: project.summary,
        },
        update: {
          name: project.name,
          descriptionHtml: project.descriptionHtml,
          language: project.language,
          topics: project.topics || undefined,
          stars: project.stars,
          pushedAt: project.pushedAt ? new Date(project.pushedAt) : null,
          homepageUrl: project.homepageUrl,
          previewUrl: project.previewUrl,
          summary: project.summary,
        },
      })
    )
  );
}

export async function deleteUserProjects(username: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  await db.project.deleteMany({
    where: { userId: user.id },
  });
}
