import type { SemanticArtifactManifest } from "@cinatra-ai/sdk-extensions";

// `@cinatra-ai/blog-idea-artifact` represents short-form ideation notes or
// outlines for future blog posts. It is distinct from `blog-post-artifact`
// (the finished post) and from the in-pipeline blog-idea operational record
// (which stays relational).
//
// This artifact exists so a user can upload an idea note ("I should write
// about X because Y") and have it classified, retrievable in the library, and
// linkable as context for the blog-idea-generator / draft-writer agents.
//
// Matcher scope: bytes-only matcher; text/markdown + text/plain only. No
// application/pdf — full-PDF documents are essentially never one-idea notes.
export const blogIdeaArtifactManifest: SemanticArtifactManifest = {
  accepts: {
    file: {
      mimeTypes: ["text/markdown", "text/plain"],
    },
  },
  skills: {
    authoring: ["@cinatra-ai/blog-idea-authoring-skill:blog-idea-authoring"],
    matchers: ["@cinatra-ai/blog-idea-matcher-skill:blog-idea-matcher"],
  },
  matcherConfidenceThreshold: 0.7,
  objectTypes: [
    {
      type: "@cinatra-ai/blog-idea-artifact:blog-idea",
      claim: "dedicated",
      dispositions: {
        projection: "artifact-safe",
        sensitivity: "normal",
      },
      schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
        },
        additionalProperties: true,
      },
    },
  ],

  // NO DISPLAY OF ITS OWN: this extension registers no renderer for any slot.
  // A blog idea is drawn by the display of its content type -- markdown by the
  // Markdown extension's display, plain text by the Text extension's. The
  // modules under src/renderers stay in the tree, unregistered and unexported.
};

export {
  type ArtifactRendererProps,
  ARTIFACT_RENDERER_PROPS_API_VERSION,
} from "./artifact-renderer-props";

export {
  type ArtifactContentProjection,
  type ArtifactContentAbsence,
  type ArtifactContentClass,
  ARTIFACT_CONTENT_CHANNEL_VERSION,
} from "./artifact-content-channel";

// TYPES ONLY, AND FROM THE SANITIZER-FREE CONTRACT MODULE. The view leaf reaches
// the host-provided sanitizer, and a type re-export from THAT module would make
// a compiler follow it there. This root module must stay resolvable with nothing
// installed. The displays are imported at their own published subpaths.
export type { TextView, TextFloorReason } from "./renderers/text-view-contract";
