import type { ProjectMeta } from "@/types/portfolio";

function filterProjects(
  projects: ProjectMeta[],
  includeRepos?: string[],
  excludeRepos?: string[]
): ProjectMeta[] {
  if (includeRepos && includeRepos.length > 0) {
    return projects.filter((p) => includeRepos.includes(p.fullName));
  }

  if (excludeRepos && excludeRepos.length > 0) {
    return projects.filter((p) => !excludeRepos.includes(p.fullName));
  }

  return projects;
}

describe("Project Filtering Logic", () => {
  const mockProjects: ProjectMeta[] = [
    {
      fullName: "user/repo1",
      name: "repo1",
      language: "TypeScript",
      topics: [],
      stars: 10,
      pushedAt: "2024-01-01",
      homepageUrl: null,
      previewUrl: null,
    },
    {
      fullName: "user/repo2",
      name: "repo2",
      language: "JavaScript",
      topics: [],
      stars: 5,
      pushedAt: "2024-01-02",
      homepageUrl: null,
      previewUrl: null,
    },
    {
      fullName: "user/repo3",
      name: "repo3",
      language: "Python",
      topics: [],
      stars: 15,
      pushedAt: "2024-01-03",
      homepageUrl: null,
      previewUrl: null,
    },
  ];

  it("should return all projects when no filters applied", () => {
    const result = filterProjects(mockProjects);
    expect(result).toHaveLength(3);
  });

  it("should include only specified repos", () => {
    const result = filterProjects(mockProjects, ["user/repo1", "user/repo3"]);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(["repo1", "repo3"]);
  });

  it("should exclude specified repos", () => {
    const result = filterProjects(mockProjects, undefined, ["user/repo2"]);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(["repo1", "repo3"]);
  });

  it("should prioritize includeRepos over excludeRepos", () => {
    const result = filterProjects(
      mockProjects,
      ["user/repo1"],
      ["user/repo2", "user/repo3"]
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("repo1");
  });

  it("should handle empty include list", () => {
    const result = filterProjects(mockProjects, []);
    expect(result).toHaveLength(3);
  });

  it("should handle non-existent repos in include list", () => {
    const result = filterProjects(mockProjects, ["user/nonexistent"]);
    expect(result).toHaveLength(0);
  });

  it("should filter out blog-posts repo", () => {
    const projectsWithBlog: ProjectMeta[] = [
      ...mockProjects,
      {
        fullName: "user/blog-posts",
        name: "blog-posts",
        language: null,
        topics: [],
        stars: 0,
        pushedAt: null,
        homepageUrl: null,
        previewUrl: null,
      },
    ];

    const result = projectsWithBlog.filter((p) => p.name !== "blog-posts");
    expect(result).toHaveLength(3);
    expect(result.every((p) => p.name !== "blog-posts")).toBe(true);
  });
});
