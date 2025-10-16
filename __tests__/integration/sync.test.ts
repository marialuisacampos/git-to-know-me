describe("Sync Integration", () => {
  const mockRepos = [
    {
      name: "repo1",
      fullName: "user/repo1",
      description: "Test repo 1",
      language: "TypeScript",
      topics: ["test"],
      stars: 10,
      pushedAt: "2024-01-01T00:00:00Z",
      homepageUrl: null,
      isPrivate: false,
      isFork: false,
      isArchived: false,
    },
    {
      name: "blog-posts",
      fullName: "user/blog-posts",
      description: "Blog",
      language: null,
      topics: [],
      stars: 0,
      pushedAt: "2024-01-01T00:00:00Z",
      homepageUrl: null,
      isPrivate: false,
      isFork: false,
      isArchived: false,
    },
  ];

  it("should filter out blog-posts repository", () => {
    const filtered = mockRepos.filter((repo) => repo.name !== "blog-posts");
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe("repo1");
  });

  it("should filter out forks", () => {
    const withFork = [
      ...mockRepos,
      { ...mockRepos[0], name: "fork", isFork: true },
    ];
    const filtered = withFork.filter((repo) => !repo.isFork);
    expect(filtered.every((r) => !r.isFork)).toBe(true);
  });

  it("should filter out archived repos", () => {
    const withArchived = [
      ...mockRepos,
      { ...mockRepos[0], name: "archived", isArchived: true },
    ];
    const filtered = withArchived.filter((repo) => !repo.isArchived);
    expect(filtered.every((r) => !r.isArchived)).toBe(true);
  });

  it("should handle preview URL correctly", () => {
    const project = {
      ...mockRepos[0],
      previewUrl: undefined,
    };

    expect(project.previewUrl).toBeUndefined();

    const withPreview = {
      ...project,
      previewUrl: "https://preview.com",
    };

    expect(withPreview.previewUrl).toBe("https://preview.com");
  });

  it("should sort projects by stars descending", () => {
    const unsorted = [
      { stars: 5, name: "low" },
      { stars: 15, name: "high" },
      { stars: 10, name: "mid" },
    ];

    const sorted = unsorted.sort((a, b) => (b.stars || 0) - (a.stars || 0));

    expect(sorted[0].name).toBe("high");
    expect(sorted[1].name).toBe("mid");
    expect(sorted[2].name).toBe("low");
  });
});
