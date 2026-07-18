import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import type { BlogIdeaView } from "../src/object-renderer-props";
import {
  BlogIdeaCard,
  BlogIdeaDetail,
  BlogIdeaListRow,
} from "../src/object-renderers";

// NOTE: these assertions prove the RELOCATED source renders the same markup as
// the in-core originals. They do NOT prove host MOUNTING — the renderers are
// dormant (no runtime registrar for a declarative artifact extension; the
// cinatra.artifact.ui spine is a different contract). See object-renderers.tsx.

function view(overrides: Partial<BlogIdeaView> = {}): BlogIdeaView {
  return { title: "Why agents change GTM", summaryArtifactId: "art_summary_1", ...overrides };
}

describe("BlogIdeaListRow", () => {
  it("renders the idea title", () => {
    const html = renderToStaticMarkup(createElement(BlogIdeaListRow, { value: view() }));
    expect(html).toContain("Why agents change GTM");
  });
});

describe("BlogIdeaCard", () => {
  it("renders the title and the summary hint when a summary artifact is present", () => {
    const html = renderToStaticMarkup(createElement(BlogIdeaCard, { value: view() }));
    expect(html).toContain('class="soft-panel rounded-card p-4"');
    expect(html).toContain("Why agents change GTM");
    expect(html).toContain("Open the idea panel to view the full summary.");
  });

  it("omits the summary hint when there is no summary artifact", () => {
    const html = renderToStaticMarkup(
      createElement(BlogIdeaCard, { value: view({ summaryArtifactId: undefined }) }),
    );
    expect(html).toContain("Why agents change GTM");
    expect(html).not.toContain("Open the idea panel to view the full summary.");
  });
});

describe("BlogIdeaDetail", () => {
  it("renders the title heading and the idea-panel hint", () => {
    const html = renderToStaticMarkup(createElement(BlogIdeaDetail, { value: view() }));
    expect(html).toContain("Why agents change GTM");
    expect(html).toContain("Open the idea panel to view the full summary.");
  });
});
