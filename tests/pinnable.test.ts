// @vitest-environment node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { blogIdeaArtifactManifest } from "../src/index";

type ObjectTypeClaim = { type: string; dispositions?: Record<string, unknown> };

const pkg = JSON.parse(
  readFileSync(fileURLToPath(new URL("../package.json", import.meta.url)), "utf8"),
) as { cinatra: { artifact: { objectTypes: ObjectTypeClaim[] } } };

const OWN_TYPE = "@cinatra-ai/blog-idea-artifact:blog-idea";
const PINNABLE_DISPOSITIONS = {
  projection: "artifact-safe",
  pinnable: true,
  sensitivity: "normal",
};

function claimOf(types: readonly ObjectTypeClaim[] | undefined): ObjectTypeClaim | undefined {
  return types?.find((claim) => claim.type === OWN_TYPE);
}

// The host pins an artifact into a run's context only when its type's claim
// declares it pinnable, so an uploaded Blog Idea can reach a context step only
// through this one disposition.
describe("the Blog Idea type is pinnable", () => {
  it("declares the type pinnable in the manifest of record", () => {
    expect(claimOf(pkg.cinatra.artifact.objectTypes)?.dispositions).toEqual(PINNABLE_DISPOSITIONS);
  });

  it("declares the type pinnable in the typed manifest", () => {
    expect(claimOf(blogIdeaArtifactManifest.objectTypes)?.dispositions).toEqual(PINNABLE_DISPOSITIONS);
  });

  it("keeps the typed manifest's object types equal to the manifest of record", () => {
    expect(claimOf(blogIdeaArtifactManifest.objectTypes)).toBeDefined();
    expect(blogIdeaArtifactManifest.objectTypes).toEqual(pkg.cinatra.artifact.objectTypes);
  });
});
