import { ImageResponse } from "next/og";
import { getUserPost } from "@/lib/db/posts";

export const runtime = "nodejs";
export const alt = "Post Cover";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface ImageProps {
  params: {
    username: string;
    slug: string;
  };
}

export default async function Image({ params }: ImageProps) {
  const { username, slug } = await params;
  const post = await getUserPost(username, slug);

  if (!post) {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0f172a",
          }}
        >
          <div style={{ display: "flex", fontSize: 48, color: "#64748b" }}>
            Post não encontrado
          </div>
        </div>
      ),
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0f172a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: "bold",
              color: "#f1f5f9",
              lineHeight: 1.2,
              maxWidth: 1000,
            }}
          >
            {post.title}
          </div>

          {post.summary && (
            <div
              style={{
                display: "flex",
                fontSize: 28,
                color: "#94a3b8",
                lineHeight: 1.4,
                maxWidth: 900,
              }}
            >
              {post.summary.slice(0, 120)}
              {post.summary.length > 120 ? "..." : ""}
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              {post.tags.slice(0, 3).map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    fontSize: 20,
                    color: "#a78bfa",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    padding: "8px 16px",
                    borderRadius: 6,
                  }}
                >
                  #{tag}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "2px solid #1e293b",
            paddingTop: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            @{username}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#475569",
              alignItems: "center",
              gap: 12,
            }}
          >
            📝 www.gittoknowme.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
