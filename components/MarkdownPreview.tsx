"use client";

import dynamic from "next/dynamic";
import { ComponentProps } from "react";
import rehypeSanitize from "rehype-sanitize";

const MarkdownPreviewComponent = dynamic(
  () => import("@uiw/react-markdown-preview"),
  { ssr: false }
);

interface MarkdownPreviewProps {
  source: string;
  isReadme?: boolean;
}

export function MarkdownPreview({
  source,
  isReadme = false,
}: MarkdownPreviewProps) {
  const wrapperElement: ComponentProps<
    typeof MarkdownPreviewComponent
  >["wrapperElement"] = {
    "data-color-mode": "dark",
  };

  return (
    <div className={isReadme ? "markdown-preview-sm" : "markdown-preview"}>
      <MarkdownPreviewComponent
        source={source}
        wrapperElement={wrapperElement}
        rehypePlugins={[rehypeSanitize]}
        style={{
          backgroundColor: "transparent",
          color: "#cbd5e1",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
