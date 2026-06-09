<!-- refreshed: 2026-06-09 -->
# Architecture

**Analysis Date:** 2026-06-09

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│              Cinatra Chat Assistant (host)                   │
│  (artifact_extension_search / artifact_authoring_emit)       │
└────────────────────┬────────────────────────────────────────┘
                     │ discovers & invokes extension
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           @cinatra-ai/blog-idea-artifact                     │
│                                                              │
│  Manifest (TypeScript)          Skills (Markdown)            │
│  `src/index.ts`                 `skills/blog-idea-author/`   │
│                                 `skills/blog-idea-matcher/`  │
└─────────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Cinatra monorepo / SDK runtime                  │
│  `@cinatra-ai/sdk-extensions` (optional peer — never shipped)│
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Artifact manifest | Declares accepted MIME types, authoring skill, matcher skill, confidence threshold | `src/index.ts` |
| blog-idea-author skill | LLM prompt that guides the host assistant to gather inputs and emit a blog idea artifact | `skills/blog-idea-author/SKILL.md` |
| blog-idea-matcher skill | Strict semantic classifier; returns JSON `{ matches, confidence, rationale }` for uploaded files | `skills/blog-idea-matcher/SKILL.md` |

## Pattern Overview

**Overall:** Cinatra Artifact Extension — a content-classification and authoring plugin for the Cinatra AI platform.

**Key Characteristics:**
- This repo is a **source mirror**: it ships no compiled output, no lockfile, and declares `@cinatra-ai/sdk-extensions` only as an optional peer dependency resolved by the host monorepo.
- The runtime entry point is a single TypeScript export (`blogIdeaArtifactManifest`) typed against `SemanticArtifactManifest` from the SDK.
- Skills are plain Markdown prompt documents; the Cinatra runtime loads them by reference from the manifest.
- No application server, no database, no external API calls — behavior is entirely defined by the manifest and the LLM instructions in the two SKILL.md files.

## Layers

**Manifest Layer:**
- Purpose: Machine-readable contract consumed by the Cinatra extension registry
- Location: `src/index.ts`
- Contains: `SemanticArtifactManifest` export; accepted MIME types (`text/markdown`, `text/plain`); skill references; `matcherConfidenceThreshold: 0.7`
- Depends on: `@cinatra-ai/sdk-extensions` (type import only, optional peer)
- Used by: Cinatra host runtime via `artifact_extension_get`

**Authoring Skill Layer:**
- Purpose: LLM system-prompt that drives the chat assistant when creating a new blog-idea artifact
- Location: `skills/blog-idea-author/SKILL.md`
- Contains: Input-gathering instructions, required output structure (working title, angle, why-now, outline, optional references), `artifact_authoring_emit` call contract, error handling guidance
- Depends on: Nothing; loaded as raw text by the Cinatra host
- Used by: `chat-create-artifact` flow in the Cinatra host

**Matcher Skill Layer:**
- Purpose: LLM classifier that decides whether an uploaded file qualifies as a blog-idea artifact
- Location: `skills/blog-idea-matcher/SKILL.md`
- Contains: Classification criteria, confidence bands (0.85–0.95 strong match → <0.50 non-match), JSON output contract `{ matches, confidence, rationale }`
- Depends on: Nothing; loaded as raw text by the Cinatra host
- Used by: Cinatra artifact matching pipeline; confidence must exceed `matcherConfidenceThreshold: 0.7` to auto-classify

## Data Flow

### Artifact Authoring Path

1. User asks to draft a blog idea in the Cinatra chat UI
2. Host calls `artifact_extension_search({query: "blog idea"})` — matches this extension
3. Host calls `artifact_extension_get` — confirms `hasAuthoringSkill: true`
4. Host loads `skills/blog-idea-author/SKILL.md` and injects it as system context
5. Assistant gathers: working title, target audience, why-now, optional links (`skills/blog-idea-author/SKILL.md` lines 11–18)
6. Assistant calls `artifact_authoring_emit({ extension, content, declaredMime, title })` with plain markdown
7. Host validates size (≤10MB), MIME, manifest shape, and recursion ledger; stores artifact
8. Assistant returns artifact id + `/artifacts/<id>` link to user

### File Upload / Matching Path

1. User uploads a `.md` or `.txt` file to the Cinatra library
2. Host checks accepted MIME types from manifest (`src/index.ts` line 15–19) — must be `text/markdown` or `text/plain`
3. Host loads `skills/blog-idea-matcher/SKILL.md` and runs it against the file content
4. Matcher returns `{ matches: boolean, confidence: 0..1, rationale: string }` as bare JSON
5. If `confidence >= 0.7` and `matches: true`, host classifies the file as a `blog-idea-artifact`

**State Management:**
- No local state. The artifact's persistent state lives entirely in the Cinatra host platform (artifact store).

## Key Abstractions

**SemanticArtifactManifest:**
- Purpose: SDK type that defines the shape of an artifact extension's contract
- Examples: `src/index.ts` (export `blogIdeaArtifactManifest`)
- Pattern: Single named export; type imported from `@cinatra-ai/sdk-extensions` (never bundled locally)

**SKILL.md:**
- Purpose: Markdown documents that serve as LLM system prompts; the Cinatra runtime injects them at invocation time
- Examples: `skills/blog-idea-author/SKILL.md`, `skills/blog-idea-matcher/SKILL.md`
- Pattern: YAML front-matter (`name`, `description`) followed by prose instructions; no code

## Entry Points

**Manifest export:**
- Location: `src/index.ts`
- Triggers: Cinatra extension registry loads on startup / dev refresh
- Responsibilities: Declare accepted MIME types, link authoring and matcher skills by fully-qualified name, set `matcherConfidenceThreshold`

**blog-idea-author skill:**
- Location: `skills/blog-idea-author/SKILL.md`
- Triggers: `chat-create-artifact` flow when user intent matches "blog idea / outline / angle"
- Responsibilities: Gather required inputs, compose markdown artifact, call `artifact_authoring_emit`

**blog-idea-matcher skill:**
- Location: `skills/blog-idea-matcher/SKILL.md`
- Triggers: Cinatra artifact matching pipeline on file upload
- Responsibilities: Return JSON classification with `matches`, `confidence`, `rationale`

## Architectural Constraints

- **Threading:** Not applicable — no runtime process; executed by the Cinatra host LLM runtime
- **Global state:** None — no module-level singletons
- **Circular imports:** None — single source file with a single type import
- **Source mirror constraint:** `@cinatra-ai/*` packages must never appear in `dependencies`, `devDependencies`, or `optionalDependencies`; only as `peerDependencies` with `peerDependenciesMeta.optional: true`. Enforced by CI (`ci.yml` lines 48–69).
- **Word count constraint for authored artifacts:** blog-idea-author targets 50–400 words; blog-idea-matcher rejects content >500 words of narrative prose as `matches: false`

## Anti-Patterns

### Declaring first-party deps as direct dependencies

**What happens:** Adding `@cinatra-ai/*` to `dependencies` or `devDependencies`
**Why it's wrong:** These packages exist only in the Cinatra monorepo and are unpublished; standalone install would fail; CI explicitly detects and rejects this (exit code 2)
**Do this instead:** Declare as `peerDependencies` with `peerDependenciesMeta[pkg].optional = true` (see `package.json`)

### Authoring a full blog post from this artifact

**What happens:** The author skill emits >500 words of narrative prose
**Why it's wrong:** The matcher would classify the output as `blog-post-artifact`, not `blog-idea-artifact`; the intent boundary is broken
**Do this instead:** Keep authored content to 50–400 words (title + outline bullets + brief motivation); use `blog-post-artifact` for full drafts

## Error Handling

**Strategy:** Delegated to the Cinatra host; the author skill documents expected error codes and user-facing responses.

**Patterns:**
- `artifact_authoring_emit` errors are named reasons (`extension-not-found`, `mime-not-accepted`, `content-too-large`, `cycle`) — the author skill handles each in `skills/blog-idea-author/SKILL.md` lines 56–61
- Matcher output is always JSON; no exception surface — confidence < 0.7 is a normal non-match result

## Cross-Cutting Concerns

**Logging:** Not applicable — no application runtime
**Validation:** MIME validation is performed by the Cinatra host against the manifest's `accepts.file.mimeTypes`; content validation is LLM-driven via the matcher skill
**Authentication:** Not applicable — handled entirely by the Cinatra host platform

---

*Architecture analysis: 2026-06-09*
