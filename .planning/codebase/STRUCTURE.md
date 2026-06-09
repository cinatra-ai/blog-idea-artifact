# Codebase Structure

**Analysis Date:** 2026-06-09

## Directory Layout

```
blog-idea-artifact/
├── src/
│   └── index.ts            # Artifact manifest export (sole TypeScript source)
├── skills/
│   ├── blog-idea-author/
│   │   └── SKILL.md        # LLM authoring prompt for the chat-create-artifact flow
│   └── blog-idea-matcher/
│       └── SKILL.md        # LLM classifier prompt for file upload matching
├── .github/
│   └── workflows/
│       ├── ci.yml          # Build / typecheck / pack gate + first-party dep shape check
│       └── release.yml     # Release workflow
├── .planning/
│   └── codebase/           # GSD codebase map documents (this directory)
├── package.json            # Extension manifest + cinatra metadata block
├── tsconfig.json           # Standalone strict TypeScript config (targets src/)
├── .npmrc                  # npm registry config
├── LICENSE                 # Apache-2.0
└── README.md               # Extension description
```

## Directory Purposes

**`src/`:**
- Purpose: TypeScript source for the artifact manifest
- Contains: One file — `index.ts` — which exports `blogIdeaArtifactManifest` typed as `SemanticArtifactManifest`
- Key files: `src/index.ts`

**`skills/`:**
- Purpose: Markdown SKILL.md documents loaded by the Cinatra host as LLM system prompts
- Contains: One subdirectory per skill, each with a single `SKILL.md`
- Key files: `skills/blog-idea-author/SKILL.md`, `skills/blog-idea-matcher/SKILL.md`

**`.github/workflows/`:**
- Purpose: CI/CD automation
- Contains: `ci.yml` (baseline gate for all extracted Cinatra extension repos), `release.yml`
- Key files: `.github/workflows/ci.yml`

**`.planning/codebase/`:**
- Purpose: GSD architectural map documents written by `/gsd-map-codebase`
- Generated: Yes (by tooling)
- Committed: Yes

## Key File Locations

**Entry Points:**
- `src/index.ts`: Only TypeScript file; exports the `SemanticArtifactManifest` object consumed by the Cinatra registry

**Configuration:**
- `package.json`: Package identity, peer dependency declaration, and `cinatra` metadata block (apiVersion, kind, artifact shape, skill references, matcherConfidenceThreshold)
- `tsconfig.json`: Standalone TypeScript compiler config (ES2023, ESNext modules, `bundler` moduleResolution, emits to `dist/`)
- `.npmrc`: npm/pnpm registry configuration

**Skill Prompts:**
- `skills/blog-idea-author/SKILL.md`: Authoring skill — governs how the chat assistant creates blog idea artifacts
- `skills/blog-idea-matcher/SKILL.md`: Matcher skill — governs how uploaded files are classified

**CI:**
- `.github/workflows/ci.yml`: Baseline CI including first-party dependency shape validation, typecheck, pack dry-run

## Naming Conventions

**Files:**
- TypeScript source: `camelCase.ts` (e.g., `index.ts`)
- Skill documents: `SKILL.md` (uppercase, fixed name per Cinatra convention)
- Workflow files: `kebab-case.yml`

**Directories:**
- Skill subdirectories: `kebab-case` matching the skill name declared in `package.json` `cinatra.artifact.skills` and `SKILL.md` front-matter `name` field (e.g., `blog-idea-author`, `blog-idea-matcher`)

**Package naming:**
- `@cinatra-ai/<artifact-name>-artifact` scoped package convention

## Where to Add New Code

**New skill:**
- Create `skills/<skill-name>/SKILL.md` with YAML front-matter (`name`, `description`) and prompt body
- Register the skill reference in `package.json` under `cinatra.artifact.skills.authoring` or `cinatra.artifact.skills.matchers`
- Add the fully-qualified reference (`@cinatra-ai/blog-idea-artifact:<skill-name>`) to the corresponding array in `src/index.ts`

**Changes to accepted MIME types:**
- Update `accepts.file.mimeTypes` in both `src/index.ts` and the `cinatra.artifact.accepts` block in `package.json` — they must stay in sync

**TypeScript utilities (if needed):**
- Add alongside `src/index.ts` as additional `src/*.ts` files; re-export from `src/index.ts` if they are part of the public API

**CI extensions:**
- Append steps to `.github/workflows/ci.yml` `kind-gates` job (the extraction script convention reserves that job for kind-specific gates)

## Special Directories

**`dist/`:**
- Purpose: TypeScript compiler output (`tsc` emits here per `tsconfig.json` `outDir`)
- Generated: Yes
- Committed: No (not present in the repo; generated on build in the monorepo)

**`.planning/`:**
- Purpose: GSD planning and codebase map artifacts
- Generated: Yes (by `/gsd-map-codebase` and `/gsd-plan-phase`)
- Committed: Yes

---

*Structure analysis: 2026-06-09*
