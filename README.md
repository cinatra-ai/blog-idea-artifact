# Blog Idea

A short, outline-shaped note that captures a future blog post before anyone writes it. Blog Ideas hold a working title, an angle, a few outline bullets, and optional source links so editorial teams can capture, classify, and hand off a topic to a drafting workflow later.

Install from the Cinatra marketplace: open `/configuration/marketplace`, search for "Blog Idea", and click Install. No additional credentials or environment variables are required — this artifact type is purely content-based. To author a new Blog Idea, open a workspace chat and say "draft a blog idea about…"; the assistant calls the authoring skill which guides you through working title, target audience, a why-now motivation, and optional reference links. The resulting artifact (50–400 words, text/markdown) is stored in your artifact library and immediately linkable as context for downstream agents. To classify an existing note as a Blog Idea, upload a `.md` or `.txt` file in chat — the matcher scores it and confirms if confidence ≥ 0.7. For local development, clone the repo and run `node extension-kind-gate.mjs --package-root .` to validate the manifest before publishing. The gate checks the README contract, manifest shape, and skill catalog references. If the matcher returns `matches:false` on content you expect to match, check that the file is under 500 words, is outline-shaped rather than narrative-complete, and is not a finished article, meeting note, or task list. If `artifact_authoring_emit` returns `extension-not-found`, verify the extension is installed at `/configuration/marketplace`.

## Works with

- Blog Idea Generator agent
- Blog Pipeline agent
- Blog Draft Writer agent

## Capabilities

- Capture a working title, angle, and outline for a future blog post
- Classify uploaded notes against the blog-idea schema (confidence-scored matcher)
- Hand a topic off to a downstream drafting agent
- Search the library for past ideas to revive or refine
- Attach as reference context when briefing writers or other agents
