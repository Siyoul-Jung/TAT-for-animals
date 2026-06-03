<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Standards & references

Before substantive work, consult **`docs/standards.md`** — the project's reference baseline. It pairs **correctness** sources (version-pinned API docs: Stripe, Supabase, etc.) with **quality/design** sources (backend & DB design), plus a meta-discipline (verify against the pinned version; never `as any` past a missing type) and a DB-schema self-review checklist. The same rule that applies to Next.js above applies to every third-party integration: read the installed version's docs, not your training data.
