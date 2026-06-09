# Technology Stack

**Analysis Date:** 2026-06-09

## Languages

**Primary:**
- TypeScript — source in `src/index.ts`; compiled with ES2023 target, ESNext modules, JSX react-jsx

**Secondary:**
- Markdown — skill definitions in `skills/blog-idea-author/SKILL.md` and `skills/blog-idea-matcher/SKILL.md`

## Runtime

**Environment:**
- Node.js 24 (declared in CI via `actions/setup-node@v4` with `node-version: "24"`)

**Package Manager:**
- pnpm (via corepack); `.npmrc` sets `auto-install-peers=false`
- Lockfile: not committed (CI installs with `--no-frozen-lockfile`)

## Frameworks

**Core:**
- None — this is a Cinatra platform artifact extension; the only runtime abstraction is the `SemanticArtifactManifest` type from `@cinatra-ai/sdk-extensions`

**Testing:**
- Not applicable — tests run inside the Cinatra monorepo; no standalone test runner configured

**Build/Dev:**
- TypeScript compiler (`tsc`) — config in `tsconfig.json`; outputs to `dist/`, declarations + source maps enabled

## Key Dependencies

**Critical:**
- `@cinatra-ai/sdk-extensions` (optional peer, `*`) — provides the `SemanticArtifactManifest` type used in `src/index.ts`; resolved only inside the Cinatra monorepo

**Infrastructure:**
- None — no direct, devDependency, or optional non-peer dependencies declared in `package.json`

## Configuration

**Environment:**
- No environment variables required at the extension level; `.env` files not present
- Cinatra platform metadata lives under the `"cinatra"` key in `package.json`:
  - `apiVersion: cinatra.ai/v1`
  - `kind: artifact`
  - Accepted MIME types: `text/markdown`, `text/plain`
  - `matcherConfidenceThreshold: 0.7`

**Build:**
- `tsconfig.json` — standalone strict config; targets `src/`; emits to `dist/`; `verbatimModuleSyntax: true`; `noImplicitAny: false`

## Platform Requirements

**Development:**
- Node.js 24+, corepack/pnpm; first-party `@cinatra-ai/*` peers must be provided by the Cinatra monorepo workspace (they are not published to any registry)

**Production:**
- Published to `registry.cinatra.ai` via the Cinatra Marketplace release pipeline (GitHub Release → `reusable-extension-release.yml`); package shape validated with `npm pack --dry-run` on every CI run

---

*Stack analysis: 2026-06-09*
