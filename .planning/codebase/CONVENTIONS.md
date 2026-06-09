# Coding Conventions

**Analysis Date:** 2026-06-09

## Naming Patterns

**Files:**
- Source files use kebab-case: `src/index.ts`
- Skill documents use kebab-case directories: `skills/blog-idea-author/SKILL.md`, `skills/blog-idea-matcher/SKILL.md`
- Workflow config files are UPPERCASE: `SKILL.md`

**Functions / Variables:**
- Exported constants use camelCase with descriptive suffix: `blogIdeaArtifactManifest` (`src/index.ts`)
- Type imports use PascalCase: `SemanticArtifactManifest`

**Types:**
- Interfaces/types imported from peer SDK: `SemanticArtifactManifest` from `@cinatra-ai/sdk-extensions`
- All exports typed explicitly via `import type` (verbatimModuleSyntax enforced)

## Code Style

**Formatting:**
- Not detected — no `.prettierrc`, `.eslintrc`, or `biome.json` present
- TypeScript strict mode is enabled in `tsconfig.json`
- `noImplicitAny: false` is a deliberate carve-out from strict (documented in tsconfig comment)

**TypeScript Config (`tsconfig.json`):**
- Target: `ES2023`
- Module: `ESNext`, moduleResolution: `bundler`
- `verbatimModuleSyntax: true` — enforces `import type` for type-only imports
- `isolatedModules: true` — each file must be independently compilable
- `strict: true` with `noImplicitAny: false`

## Import Organization

**Pattern observed in `src/index.ts`:**
1. Type imports first (`import type { ... } from "..."`)
2. No runtime imports in the current source

**Path Aliases:**
- Not configured — module resolution is `bundler` with no path aliases in `tsconfig.json`

## Error Handling

**Patterns:**
- The authoring skill (`skills/blog-idea-author/SKILL.md`) documents explicit error handling for the `artifact_authoring_emit` tool call via `error.reason` codes: `extension-not-found`, `extension-has-no-authoring-skill`, `mime-not-accepted`, `content-too-large`, `cycle`
- Each error reason has a defined response action (stop and surface to user, or recheck)
- No runtime error handling code in `src/` (only a manifest export)

## Logging

**Framework:** Not applicable — this is a manifest/skill-definition package, not a runtime service. No logging infrastructure present.

## Comments

**When to Comment:**
- Module-level block comments explain design decisions and scope boundaries (see `src/index.ts` lines 3–12)
- `tsconfig.json` uses a `"//"` key for inline documentation of config rationale
- CI workflow (`ci.yml`) contains extensive inline comments explaining skip logic and rationale

**Style:**
- `//` line comments for contextual explanation
- No JSDoc/TSDoc annotations observed (single export, no params to document)

## Function Design

**Size:** Single exported constant in `src/index.ts` — manifest object literal, no functions
**Parameters:** Not applicable
**Return Values:** Not applicable

## Module Design

**Exports:**
- Single named export per module: `export const blogIdeaArtifactManifest` from `src/index.ts`
- `package.json` sets `"main": "./src/index.ts"` and `"types": "./src/index.ts"` — source is the published artifact (source-mirror pattern)

**Barrel Files:**
- `src/index.ts` acts as the single barrel/entry point

## Skill Document Conventions (SKILL.md)

Skill files follow a consistent YAML frontmatter + prose pattern:
- Frontmatter keys: `name`, `description`
- Sections use `##` headings
- Code blocks use triple-backtick fences with language tag
- JSON output contracts are specified inline as fenced `json` blocks
- Bullet lists use `-` prefix
- Forbidden behaviors are enumerated in a "What NOT to do" section

## Dependency Shape Rules

**First-party packages (`@cinatra-ai/*`)** must NEVER appear in `dependencies`, `devDependencies`, or `optionalDependencies`. They must be declared as `peerDependencies` with `peerDependenciesMeta.<pkg>.optional: true`. This is enforced by the CI `build` job in `.github/workflows/ci.yml`.

---

*Convention analysis: 2026-06-09*
