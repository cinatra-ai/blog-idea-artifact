# External Integrations

**Analysis Date:** 2026-06-09

## APIs & External Services

**Cinatra Platform (internal):**
- Cinatra Artifact Runtime — the extension registers itself as a `SemanticArtifactManifest` and is invoked by the Cinatra chat/artifact system
  - SDK/Client: `@cinatra-ai/sdk-extensions` (optional peer)
  - Auth: managed by the Cinatra monorepo host; no env var required at extension level

**Downstream agent integrations (runtime, not SDK-level):**
- Blog Idea Generator agent — listed in `README.md` as a compatible agent
- Blog Pipeline agent — listed in `README.md` as a compatible agent
- Blog Draft Writer agent (`@cinatra-ai/blog-draft-writer-agent`) — the `blog-idea-author` skill instructs the LLM to offer dispatching this agent after artifact emit; integration is conversational (no direct SDK call from this extension)

## Data Storage

**Databases:**
- Not applicable — this extension contains no database client or schema; artifact persistence is handled by the Cinatra platform host

**File Storage:**
- Not applicable — accepted files (`text/markdown`, `text/plain`) are processed in-memory by the platform matcher/authoring flow; no file storage client in this repo

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- Not applicable at extension level — authentication is delegated entirely to the Cinatra platform host; no auth library or credentials are present in this repo

## Monitoring & Observability

**Error Tracking:**
- None — error handling is surface-level: the `blog-idea-author` skill documents platform error codes (`extension-not-found`, `mime-not-accepted`, `content-too-large`, `cycle`) returned by the `artifact_authoring_emit` tool call at runtime

**Logs:**
- None configured in this repo; logging is the platform host's responsibility

## CI/CD & Deployment

**Hosting:**
- `registry.cinatra.ai` — Cinatra Marketplace private registry; packages are never published to npm

**CI Pipeline:**
- GitHub Actions — `.github/workflows/ci.yml` (push/PR gate) and `.github/workflows/release.yml` (release trigger)
- CI uses `actions/checkout@v4`, `actions/setup-node@v4` (Node 24), corepack/pnpm
- Release workflow delegates to `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main` and requires the `CINATRA_MARKETPLACE_VENDOR_TOKEN` org secret plus `id-token: write` for provenance attestation

## Environment Configuration

**Required env vars:**
- None at the extension level; all secrets are managed by the Cinatra monorepo and the GitHub org (`CINATRA_MARKETPLACE_VENDOR_TOKEN` for releases)

**Secrets location:**
- GitHub org-level secret (`CINATRA_MARKETPLACE_VENDOR_TOKEN`) consumed by the release reusable workflow; not present in this repo

## Webhooks & Callbacks

**Incoming:**
- Not applicable — this is a passive artifact-type extension; it exposes no HTTP endpoints

**Outgoing:**
- Not applicable — no outgoing webhook calls; the `artifact_authoring_emit` tool is a platform-internal RPC, not an outbound HTTP call from this repo

---

*Integration audit: 2026-06-09*
