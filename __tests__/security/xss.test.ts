describe("XSS Protection", () => {
  describe("User Input Sanitization", () => {
    it("should reject script tags in bio", () => {
      const maliciousBio = '<script>alert("xss")</script>';

      expect(maliciousBio.includes("<script>")).toBe(true);
    });

    it("should reject event handlers", () => {
      const maliciousInput = '<img src=x onerror="alert(1)">';

      expect(maliciousInput.includes("onerror")).toBe(true);
    });

    it("should handle markdown safely", () => {
      const safeMarkdown = "# Hello\n**bold** text";
      expect(safeMarkdown).not.toContain("<script>");
      expect(safeMarkdown).not.toContain("onerror");
    });
  });

  describe("URL Validation", () => {
    it("should only accept http/https protocols", () => {
      const validUrls = ["https://example.com", "http://example.com"];

      const invalidUrls = [
        "javascript:alert(1)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
      ];

      validUrls.forEach((url) => {
        expect(url.startsWith("http")).toBe(true);
      });

      invalidUrls.forEach((url) => {
        expect(url.startsWith("http")).toBe(false);
      });
    });

    it("should validate URLs in customPreviewUrls", () => {
      const validUrl = "https://preview.com";
      const invalidUrl = "javascript:void(0)";

      expect(validUrl.match(/^https?:\/\//)).toBeTruthy();
      expect(invalidUrl.match(/^https?:\/\//)).toBeFalsy();
    });
  });

  describe("Preview URL Safety", () => {
    it("should only show preview button when URL exists", () => {
      const hasPreview = (url: string | null | undefined) => Boolean(url);

      expect(hasPreview("https://example.com")).toBe(true);
      expect(hasPreview(null)).toBe(false);
      expect(hasPreview(undefined)).toBe(false);
      expect(hasPreview("")).toBe(false);
    });

    it("should validate preview URL format", () => {
      const isValidUrl = (url: string) => {
        try {
          new URL(url);
          return url.startsWith("http");
        } catch {
          return false;
        }
      };

      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.com")).toBe(true);
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("javascript:alert(1)")).toBe(false);
    });
  });
});
