# Codebase Concerns

**Analysis Date:** 2026-06-09

## Tech Debt

**Source mirror architecture prevents standalone operation:**
- Issue: The repo is a "source mirror" — it declares `@cinatra-ai/sdk-extensions` as an optional peer dependency that only exists in the private cinatra monorepo. This means the repo cannot be installed, typechecked, or tested in isolation. The CI workflow explicitly skips install, typecheck, and test steps when `first_party=1`.
- Files: `package.json`, `.github/workflows/ci.yml`
- Impact: A contributor cloning this repo standalone cannot verify correctness. TypeScript types from `SemanticArtifactManifest` are unresolvable outside the monorepo. Any type contract breakage from sdk-extensions goes undetected until the monorepo runs tests.
- Fix approach: Either publish a thin `@cinatra-ai/sdk-extensions` stub to a public/internal registry, or document a local-link setup so contributors can typecheck standalone.

**`main` and `types` fields point to TypeScript source, not compiled output:**
- Issue: `package.json` sets `"main": "./src/index.ts"` and `"types": "./src/index.ts"`. These point directly to TypeScript source files. Consumers trying to use this as a published npm package would receive raw `.ts`, not the compiled `.js`/`.d.ts` in `dist/`.
- Files: `package.json`
- Impact: If ever published standalone (outside the monorepo workspace), downstream consumers will fail to resolve the module unless their bundler handles raw TypeScript. This is a packaging regression waiting to happen.
- Fix approach: Update `main` to `./dist/index.js` and `types` to `./dist/index.d.ts`, matching the `outDir` declared in `tsconfig.json`.

**Release workflow depends on org infrastructure that does not yet exist:**
- Issue: `release.yml` calls `cinatra-ai/.github/.github/workflows/reusable-extension-release.yml@main` and inherits `CINATRA_MARKETPLACE_VENDOR_TOKEN`. Both are described as "dormant until the org infra exists."
- Files: `.github/workflows/release.yml`
- Impact: Any attempt to publish a release will silently fail or error until the referenced reusable workflow and org secret are provisioned.
- Fix approach: Add a CI check or README note that warns when the infra prerequisites are unmet. Track provisioning as a separate task.

**No lockfile committed:**
- Issue: There is no `pnpm-lock.yaml` in the repo. The CI workflow acknowledges this and uses `--no-frozen-lockfile`, meaning dependency resolution is non-deterministic across CI runs.
- Files: `package.json`, `.github/workflows/ci.yml`
- Impact: For a standalone repo (no first-party peers), dependency drift can cause intermittent CI failures. For this source-mirror repo, install is skipped entirely so the impact is lower — but it sets a weak precedent.
- Fix approach: Commit a lockfile once the repo is configured for standalone install, or document explicitly that lockfile management is handled by the monorepo.

## Known Bugs

**`matcherConfidenceThreshold` duplication between manifest and package.json:**
- Symptoms: The threshold value `0.7` is defined in both `src/index.ts` (runtime manifest) and in the `cinatra` block of `package.json`. If they diverge, the runtime and the registry metadata will disagree on when the artifact auto-matches.
- Files: `src/index.ts`, `package.json`
- Trigger: Manual edit of one but not the other.
- Workaround: No guard exists. A code review or linting rule is the only safeguard.

## Security Considerations

**`.npmrc` present — scope/auth configuration:**
- Risk: `.npmrc` is committed to the repo. Currently it contains only `auto-install-peers=false`, but `.npmrc` is a common location for registry auth tokens.
- Files: `.npmrc`
- Current mitigation: Current contents are non-sensitive.
- Recommendations: Add `.npmrc` to `.gitignore` or enforce a CI check that the file contains no `//registry` auth tokens, to prevent accidental token commits in the future.

**Release workflow uses `secrets: inherit` broadly:**
- Risk: The release job passes all org secrets to the reusable workflow via `secrets: inherit`. This grants the reusable workflow access to every org-level secret, not just `CINATRA_MARKETPLACE_VENDOR_TOKEN`.
- Files: `.github/workflows/release.yml`
- Current mitigation: The reusable workflow is internal to the org.
- Recommendations: Prefer `secrets: CINATRA_MARKETPLACE_VENDOR_TOKEN: ${{ secrets.CINATRA_MARKETPLACE_VENDOR_TOKEN }}` explicit passing to reduce blast radius if the reusable workflow is ever compromised or misconfigured.

## Performance Bottlenecks

Not applicable — this is a content/manifest artifact package with a single 25-line TypeScript file and two SKILL.md prompt files. No runtime performance concerns exist.

## Fragile Areas

**Skill prompt word-count contract is manually enforced:**
- Files: `skills/blog-idea-author/SKILL.md`, `skills/blog-idea-matcher/SKILL.md`
- Why fragile: The author skill instructs the LLM to keep output under 400–500 words. The matcher skill uses word count as a primary signal (`< 500 words → idea`, `> 500 words → finished post`). There is no automated test or validation that emitted artifacts satisfy the word count boundary. A prompt edit that relaxes the cap could silently break matcher classification.
- Safe modification: Any change to the word-count guidance in either SKILL.md must be mirrored in the other. Add a note or comment linking them.
- Test coverage: No tests exist for skill prompts.

**`matcherConfidenceThreshold: 0.7` is hard-coded with no tunability:**
- Files: `src/index.ts`, `package.json`
- Why fragile: The threshold governs auto-eligibility. If the matcher LLM drifts (model update, prompt change), the threshold may need adjustment, but there is no configuration surface — it requires a code change and a new release.
- Safe modification: Threshold changes require simultaneous update in `src/index.ts` and `package.json` cinatra block.

## Scaling Limits

Not applicable — this repo contains no server-side runtime, no database, and no request-handling code.

## Dependencies at Risk

**`@cinatra-ai/sdk-extensions` — internal, unpublished peer:**
- Risk: This package is not on any public registry and exists only in the cinatra monorepo. Breaking changes to `SemanticArtifactManifest` in sdk-extensions will silently break this repo's TypeScript types until the monorepo runs its integration typecheck.
- Impact: `src/index.ts` would fail to compile; the exported manifest shape could become incorrect at runtime.
- Migration plan: No external migration path. Monorepo version governance is the only control.

## Missing Critical Features

**No automated validation of SKILL.md prompt compliance:**
- Problem: Both skills define strict output contracts (JSON-only for matcher, markdown-only with specific sections for author), but no test or linter validates that the SKILL.md files conform to their own rules or that they are internally consistent with each other.
- Blocks: Catching prompt regressions before deployment.

**No `exports` field in `package.json`:**
- Problem: The package lacks a `"exports"` field, which is required for correct ESM resolution in modern Node.js environments (the package declares `"type": "module"`).
- Blocks: Consumers using Node.js `>=12` ESM import resolution without a bundler will fall back to `main`, which points to raw `.ts` source.
- Files: `package.json`

## Test Coverage Gaps

**No tests exist:**
- What's not tested: The exported manifest shape, the matcher confidence boundary logic (described in SKILL.md prose), and skill prompt correctness.
- Files: `src/index.ts`, `skills/blog-idea-matcher/SKILL.md`, `skills/blog-idea-author/SKILL.md`
- Risk: Regressions to the manifest (e.g., wrong MIME type, missing skill reference, threshold change) would go undetected until runtime in the monorepo.
- Priority: Medium — the codebase is small and stable, but zero test coverage means any structural change is unguarded.

---

*Concerns audit: 2026-06-09*
