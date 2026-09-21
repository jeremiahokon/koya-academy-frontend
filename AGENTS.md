<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Build rules

These apply to every build in this template. Read the brief, then follow these in order.

The four rules below are the short version. **`playbook/website-build-playbook.md` is the long
one** — the purge list, the data layer, the SEO and performance decisions and the phase gates,
carried over from previous builds so none of it is worked out twice. Read it after the brief and
before any code.

## 1. Purge before you write

**The first action on any new template, after reading the brief, is deletion.** This repo ships as a
generic starter. Most of it is wrong for any given brief.

Go through the tree and remove everything the brief does not call for. Do not ask which parts are
safe to keep — the brief is the whitelist. Anything it does not need, delete: route handlers and
`app/api`, auth, data-fetching clients, state stores, form/validation libraries, the parts of the UI
kit nothing renders, demo routes, icon generators, unused fonts.

Delete the dependencies too, not just the files. A `package.json` listing `next-auth` on a site with
no accounts is the same bug as an unused import.

Assume deletion. A brief that never mentions accounts has no auth. One that never mentions a backend
makes no API requests. Do not keep code "in case" — it is recoverable from git.

## 2. Server-first

Server Components are the default and stay the default. `'use client'` is a module-graph boundary:
everything the file imports and every component it renders directly joins the client bundle, so it
goes on the smallest interactive leaf, never on a section, page, layout, or barrel file.

When a client wrapper needs to contain server-rendered content, pass it through `children` — props
passed that way render on the server and never enter the client bundle.

Interactivity is an enhancement, not a dependency. A reveal animation renders visible by default and
only animates on the client. If JavaScript never runs, the page is still complete and every call to
action still works.

## 3. Naming

Every component is a kebab-case folder with an `index.tsx` entry. Supporting files sit beside it,
also kebab-case. No PascalCase filenames anywhere.

```
src/components/
  service-card/
    index.tsx
    types.ts
  sticky-cta-bar/
    index.tsx
  hero/
    index.tsx
    headline.tsx
```

Import from the folder: `import { ServiceCard } from '@/components/service-card'`.

Component _identifiers_ stay PascalCase (`ServiceCard`). Only paths are kebab-case.

## 4. Design

The brief's references set the bar; they are not a mood board to average out. A layout that could
belong to any business in the category has failed, regardless of how cleanly it is built.

Lead with a concept drawn from what makes this business specific, and let typography and scale carry
it. Reach for the `fable-*` skills — `fable-design-dna` first, then the one matching the surface —
and run `fable-design-critique` before calling any design done.

Never ship a section that renders empty. Missing content is a design problem to solve, not a gap to
leave on the page.
