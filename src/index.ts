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
};
