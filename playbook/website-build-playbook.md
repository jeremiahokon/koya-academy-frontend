# The client-site build playbook

> One file, portable across projects. It carries every decision from the Vianbella
> Salon & Spa build that was **not** about salons — structure, purge list, data layer,
> SEO, performance, accessibility, and the order to do them in.
>
> **The brief decides what the site says and how it looks. This file decides how it is
> built.** Nothing here should ever need re-deriving on a new project, and re-deriving it
> is the single biggest waste of tokens available.

## How to use it

On a fresh clone of the starter, in this order:

1. Read the brief.
2. Read this file.
3. Run **Phase 1 (Purge)** before writing a single line of code.
4. Work Phases 2 → 9 in order. Each ends in a gate you can check.

Read `node_modules/next/dist/docs/` before writing framework code — the pinned Next
version has breaking changes against training data, and `AGENTS.md` says so for a reason.

Sibling files in `playbook/` are client-facing advice rather than build rules:

- [`google-business-profile.md`](./google-business-profile.md) — the standing local-SEO
  recommendation. Read it at Phase 6; it is usually worth more to a local client than
  anything in the codebase.

---

## Phase 0 — The brief is the contract

Every project starts from a brief with a machine-readable YAML head and prose below it.
The head is the part the build reads. Keep this schema; it is what makes the rest of the
playbook mechanical.

```yaml
lead: { handle, business_name, niche, location }
positioning: # one sentence
brand_attributes: [five adjectives]
audiences: # each: name, job, anxiety, needs_to_see
conversion:
  primary_action: { type, target, label }
  secondary_actions: []
  prefilled_messages: [] # verbatim, per category
  success_metric: # how the client will know it worked
site:
  pages: []
  sections: # each: id, purpose, content, content_sources, cta, status, evidence
features: # each: name, behavior, rung, client_dependency, fallback, phase
visual: { palette_candidates, palette_decision, typography, photography, motion }
performance_budget: { initial_load_kb, max_image_kb, image_formats, max_font_files, cta_works_without_js }
market_fit: { target_devices, trust_block, payment, price_display, directions_text, compliance, owner_maintenance }
copy: { voice, language_mix, avoid[], hero_headline_options[] }
open_questions: []
```

### The three words that govern everything

| Status     | Meaning                                    | What you may do                                            |
| ---------- | ------------------------------------------ | ---------------------------------------------------------- |
| **LOCKED** | Non-negotiable. The brief has decided.     | Implement exactly. Never trade it away for polish.         |
| **GUIDED** | Direction given, judgment yours inside it. | Decide, then record the decision in a code comment.        |
| **OPEN**   | Undecided.                                 | Decide, flag it in the handover, keep it cheap to reverse. |

Tags in brief prose: `[OBS]` observed first-hand, `[ASM]` assumption to confirm,
`Needs client input` a real hole. **A hole is never filled by invention.** No invented
prices, reviews, client counts, statistics, opening hours or addresses — not in the copy,
not in the JSON-LD, not as a placeholder that might survive to launch.

Facts get two independent sources where possible (on Vianbella: the Google Business
Profile plus an unrelated directory listing), and the source goes in a comment above the
data.

### Gate 0

- [ ] Brief read end to end, YAML head and prose.
- [ ] Every LOCKED item listed somewhere you will check again at Phase 9.
- [ ] `open_questions` copied into the handover doc; nothing invented to close one.

---

## Phase 1 — Purge, before anything else

The starter is a generic Next.js template. **Most of it is wrong for any given brief.**
The brief is the whitelist: anything it does not call for is deleted, files _and_
dependencies. An unused package in `package.json` is the same bug as an unused import.

Do not ask which parts are safe to keep. It is all in git.

### What the starter ships, and what usually happens to it

| Thing in the starter                                                                | Default action                  | Keep only if the brief says                                                       |
| ----------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| `next-auth`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`           | **Delete**                      | there are accounts                                                                |
| `src/app/api/**` (all route handlers)                                               | **Delete**                      | something posts to the server                                                     |
| `@tanstack/react-query`, `src/components/providers/`                                | **Delete**                      | data is fetched in the browser                                                    |
| `axios`, `src/lib/apiUtils.ts`                                                      | **Delete**                      | a backend is called                                                               |
| `zustand`                                                                           | **Delete**                      | client state outlives a component                                                 |
| `react-hot-toast`                                                                   | **Delete**                      | something async needs feedback                                                    |
| `nextjs-toploader`                                                                  | **Delete**                      | multi-page with slow transitions                                                  |
| `@radix-ui/*`, `src/components/ui/*`, `components.json`, `class-variance-authority` | **Delete the unrendered parts** | a real dialog/select/form ships                                                   |
| `lucide-react`                                                                      | **Delete the package**          | ~20+ distinct icons are used                                                      |
| `src/app/create-icon/`, `actions/icons/`, `public/custom-icons.css`                 | **Delete**                      | never                                                                             |
| `public/logo.svg`, `logo_white.svg`, `favicon.svg`                                  | **Delete**                      | never — this is the previous client's branding (1.8 MB of it on the last project) |
| `public/fonts/**` (multi-weight TTF families)                                       | **Delete all of it**            | Phase 7 re-adds exactly what renders                                              |
| `README.md` (create-next-app boilerplate)                                           | **Rewrite**                     | never keep as-is                                                                  |
| `eslint-plugin-playwright`                                                          | Delete unless tests exist       | browser tests ship                                                                |
| `.claude/`, `skills-lock.json`, `.mcp.json`, `AGENTS.md`, `playbook/`               | **Keep**                        | always — this is the template's brain                                             |

### Icons without the icon package

`lucide-react` is a dependency for what is usually eight SVG paths. Copy the paths you
need into `src/components/icons/index.tsx` — one shared `base` const for the stroke
attributes, one exported component per icon, `aria-hidden` on all of them — then drop the
package. Brand glyphs (WhatsApp and friends) are filled paths and need their own `fill`
and `viewBox` rather than the shared base.

### Verify the purge

```sh
# Anything imported that is not installed, or installed and never imported:
rg -o "from '[^.@/][^']*'" src | sort -u        # external imports actually used
pnpm why <package>                              # before deleting a transitive-looking dep
rm -rf .next && pnpm build                      # the build is the proof
```

### Gate 1

- [ ] `package.json` dependencies match what `src/` imports, exactly.
- [ ] No `app/api`, no auth, no store, no data client, unless the brief named them.
- [ ] No previous client's assets anywhere in `public/`.
- [ ] `pnpm build` passes on the emptied tree.

---

## Phase 2 — One data file

**Every fact the site states lives in one typed module**, `src/data/<business>.ts`. The
brief's `owner_maintenance` line usually demands it outright ("prices, hours and photos
editable in one data file"), and it is what makes handover possible.

Shape that has worked:

```ts
export const business = { name, shortName, tagline, area, phoneDisplay, phoneIntl,
  telHref, address: {...}, geo: {...}, mapsUrl, instagramUrl /* … */ };
export const openingHours: OpeningHours[] = [ /* one row per day */ ];
export const navLinks = [...];
export const serviceCategories: ServiceCategory[] = [...];   // id, label, blurb, services[], prefilled message
export const placePhotos = {...};  export const featurePhotos: Photo[] = [...];
export const generalWhatsappMessage = '…';
```

Rules that matter more than the shape:

- **The business name is spelled one way everywhere** — title tag, visible header,
  JSON-LD, WhatsApp profile, the client's Google listing. Character for character.
  Identical naming across those is the cheapest trust signal available, and inconsistent
  naming reads to Google as a different business.
- **Provenance in comments.** `// Confirmed against the Google Business Profile and
goafricaonline.com/ng/1046733` beats a clean file. Anything unconfirmed is marked as
  unconfirmed in the file itself.
- **Every `Photo` carries `alt`.** The type enforces it; there is no opt-out.
- **Hours are written out day by day.** A summary string reads as a claim; seven dated
  rows read as a fact, and the odd day (a late Sunday open) is exactly what someone turns
  up an hour early for. Keep a summary string too, for the places that need one line.
- A section whose data is empty (reviews with no transcribed quotes yet) must still render
  complete. Design for the empty case; never ship a section that renders blank.

### Placeholder photography

Real photos usually arrive last. Licensed stand-ins are fine **only if they are
unmissably documented**:

- `public/gallery/README.md` opens with "Every file in this folder is a placeholder and
  must be replaced before the site goes live", records the licence and source ID of every
  file, and gives the export recipe.
- Stand-ins match the real subject, lighting and skin tones, so the layout can be judged
  with photographs in it rather than grey boxes.
- Swapping is: overwrite the file, keep the name, update `alt`. Nothing else changes.

```sh
# Export recipe: 4:5, 1000px wide, under ~90 KB
magick source.jpg -auto-orient -resize 1000x1250^ -gravity center \
  -extent 1000x1250 -strip tmp.png
cwebp -q 76 -m 6 -sharp_yuv tmp.png -o subject-name.webp   # busy texture: drop to -q 58
```

### Gate 2

- [ ] Nothing factual is hard-coded in a component.
- [ ] Name, phone, address identical in data, markup and the client's own listings.
- [ ] Placeholders documented and traceable; a deletion-day checklist exists.

---

## Phase 3 — Architecture

### Naming

Every component is a **kebab-case folder with `index.tsx`**. Supporting files sit beside
it, also kebab-case. No PascalCase filenames anywhere. Identifiers stay PascalCase; only
paths are kebab.

```
src/components/service-card/index.tsx      →  import { ServiceCard } from '@/components/service-card'
src/components/service-card/types.ts
src/components/hero/index.tsx
src/components/hero/backdrop.tsx
```

Import order is enforced by `simple-import-sort`; run `pnpm fix` rather than hand-sorting.

### Server-first, and what that actually costs

Server Components are the default and stay the default. `'use client'` is a module-graph
boundary: everything the file imports and every component it renders directly joins the
client bundle. It goes on the **smallest interactive leaf** — never a section, page,
layout or barrel file.

When a client wrapper must contain server-rendered content, pass it through `children`.
Props passed that way render on the server and never enter the bundle.

A useful discipline: a client leaf takes **the data it renders as props**, and narrows the
type to just those fields (`Pick<ServiceCategory, 'id' | 'label' | …>`), so the data module
never follows it into the browser.

Five client islands was the whole of the last site. Each one earned it:

| Island              | Why it cannot be server-rendered                           |
| ------------------- | ---------------------------------------------------------- |
| `reveal`            | IntersectionObserver stagger                               |
| `sticky-cta-bar`    | observes which section is on screen                        |
| `mobile-nav`        | open/close, focus trap, Escape                             |
| `opening-hours`     | "Open now" computed at build time would confidently lie    |
| `services/composer` | the live message preview, the site's signature interaction |

### Interactivity is an enhancement

**If JavaScript never runs, the page is complete and every call to action still works.**
Not "degrades gracefully" — complete.

- Reveal animations render **visible by default**. The client island sets
  `data-reveal="pending"` on mount, so a blocked script or a failed hydrate can never
  leave a section blank. It also carries a 2s failsafe timer, because screenshot tools and
  some crawlers render the full page without ever scrolling and the observer never fires.
- A scripted-menu fallback is not the menu degrading — it is the same links repeated in
  the footer, which needs no scripting to reach.
- Carousels are native CSS `scroll-snap` rails: no bundle, works before hydration, keeps
  the phone's own momentum, reachable by keyboard and scrollbar. Style the scrollbar
  rather than hiding it; on desktop it is the only affordance that says "this scrolls".
- Anything sticky that hides itself fails **towards visible** when its inputs vanish.

### Primitives worth having on day one

`container` (max width + gutters), `section-head` (eyebrow / title / lead / aside, with a
`tone` prop so the page has hierarchy instead of one repeated rhythm), `photo-slot`
(image + treated fallback field), `reveal`, `icons`, `cn()` from `clsx` + `tailwind-merge`.

### Let sections declare themselves

Do not hard-code lists of sections inside a component. The sticky CTA bar watches every
element marked `data-has-cta` and hides while any is on screen — so adding a booking
button to a section and marking it is enough, and the bar gets out of the way by itself.
Prefer this shape wherever a component needs to know about the page around it.

### Gate 3

- [ ] `rg -l "'use client'" src` returns a short list you can justify line by line.
- [ ] No PascalCase filenames; every component folder has `index.tsx`.
- [ ] Scripts disabled in devtools: page still complete, every CTA still works.

---

## Phase 4 — Design

Route through the Fable skills, in this order, every time:

1. `fable-design-dna` — **before** layout, colour or code. Sets the concept.
2. The skill matching the surface (`fable-web-design` for a conversion page,
   `fable-award-winning-web` for a showpiece, `fable-mobile-ui`, etc.).
3. Supporting skills as needed: `fable-color-craft`, `fable-typography`,
   `fable-image-direction`, `fable-motion-design`, `fable-ux-copywriting`.
4. `fable-design-critique` before calling any design done. Non-optional.

**The brief's references set the bar; they are not a mood board to average out.** A layout
that could belong to any business in the category has failed, however cleanly it is built.
Lead with a concept drawn from what makes _this_ business specific and let typography and
scale carry it.

### Brand-system decisions that generalize

- **One idea, stated at size.** The last site was built around a single gigantic display
  size (`clamp(4.5rem, 15vw, 13rem)`), with everything else deliberately modest so the
  jump reads as a decision rather than general bigness.
- **The brand colour is the ink, not a highlight.** Oversized display type set in
  near-black brand-violet is what gave the page its mass. Highlight-only brand colour is
  what template sites do.
- **One loaded accent, with a job description.** Gold for rules, marks and large numerals
  only — never body text.
- **Tokens are named for their role, and the comment carries the measured contrast ratio**
  (`/* 9.9:1 with white (computed, not estimated) */`). When a token changes later, the
  ratio is right there to re-check.
- **Type scale is `clamp()` tokens in `@theme`**, not per-component arbitrary values.
- **A treated surface under every image slot.** The gradient field is what the tile looks
  like before the image decodes and what it falls back to if a photo is removed. Nothing
  renders as an empty grey box, ever. Vary the gradient centres by seed so a wall of tiles
  does not repeat.
- Texture (grain) is a reusable class with no positioning of its own, so the same wash can
  sit over the page or inside one panel.

### Motion

- CSS-first. A JS animation loop for an ambient background is strictly worse: it runs on
  the main thread and competes with scrolling.
- Animate `transform` and `opacity` only, so work stays on the compositor. **No
  `filter: blur()`** in ambient layers; soft edges come from wide gradient stops.
- Looping fields travel exactly `-50%` of one full set, so the loop is seamless.
- Every animation has a `prefers-reduced-motion: reduce` branch, and `html` gets
  `scroll-behavior: auto` under it. Next no longer suppresses smooth scrolling during
  navigation, so `html[data-scroll-behavior='smooth']` needs setting explicitly.
- Hero motion runs on **load**, not scroll, so the concept lands inside the first second.

### Copy

Voice comes from the brief. The bans are constant: no fake urgency, no countdowns, no
"only X slots left", no invented prices or testimonials or client counts, no "#1" or
"best" claims, no personal details of the owner. **No em dashes in site copy** (they are
fine in code comments and commits). Short sentences, confident without hype.

### Gate 4

- [ ] `fable-design-critique` run, its weakest-element finding fixed or consciously accepted.
- [ ] No section renders empty in any data state.
- [ ] Reduced-motion pass done with the OS setting actually on.

---

## Phase 5 — Conversion

The brief names one primary action. Everything else is secondary, and the page should
never present two competing primaries.

- **The primary action works with JavaScript off.** A `wa.me` link with a URL-encoded
  prefilled message is a plain `<a href>`; build it with a pure function
  (`buildWhatsAppLink(phoneIntl, message)`) that returns a string.
- **Prefilled messages are verbatim from the brief**, per category, blanks included
  (`Style: ____. Preferred day and time: ____.`). They live in the data file next to the
  category they belong to.
- Messages open with "I found you on your website" when the brief's success metric is the
  client counting those by hand. The measurement plan is part of the build.
- Secondary actions: tap-to-call `tel:`, map link, social profile. All plain anchors.
- **One CTA on screen at a time.** Sections that carry their own action mark themselves
  `data-has-cta`; the floating bar shows only over the sections that persuade but offer
  nothing to tap. Two identical buttons on one screen reads as a template.
- Proof sits **after** the work, not before it: reviews mean more once you have seen what
  they are reviewing.

### Gate 5

- [ ] Primary action tested with scripts blocked.
- [ ] Every prefilled message matches the brief character for character.
- [ ] No screen shows the same CTA twice.

---

## Phase 6 — SEO and local discovery

### Recommend the Google Business Profile first

For any business with a physical location, read
[`google-business-profile.md`](./google-business-profile.md) and raise it in the first
conversation, not the last. The profile is what puts the business in the map box; the site
is the destination that box points at. **Check the website field for a dead
`.business.site` URL** — Google killed those in 2024 and long-standing profiles still
advertise them. Thirty seconds, and it is often the highest-value thing on the project.

### On the site

- **Carry the client's own search phrases, verbatim.** Whatever they have been stuffing
  into an Instagram name field or a directory listing for years _is_ their keyword
  research, and it is free. Audit the rendered page for each phrase before and after. On
  the last project, two of the owner's three phrases appeared nowhere on the page and the
  title was a paraphrase matching none of them.
- **Title:** brand first (so it survives SERP truncation at ~60 characters), then the
  exact phrase people type. `Name: a <thing> in <area> for <services>`.
- **Description:** opens with the same entity claim, includes the area and the primary
  action.
- **`meta keywords`:** ~100 bytes. Google has ignored it since 2009 and Bing reads it as a
  weak spam signal, so it earns nothing on its own — worth including only where local
  directories scrape it, and as the checked-in record of which phrases the page is meant
  to win. Say so in the comment; do not let anyone believe it ranks.
- **`src/app/site.ts` holds the canonical origin**, shared by metadata, JSON-LD, sitemap
  and robots, so those four can never name different hosts. Read the platform's production
  URL env var (`VERCEL_PROJECT_PRODUCTION_URL`) so previews stop claiming to be the live
  site.
- **`app/sitemap.ts` and `app/robots.ts`** ship even for a one-page site. Robots exists to
  point at the sitemap.
- **`app/opengraph-image.jpg` + `app/twitter-image.jpg`** with `.alt.txt` beside them.
  When distribution is a bio link and chat shares, a link with no card is the whole
  first impression missing. Render them from an HTML file through headless Chrome
  (`scripts/opengraph-image.html`) so they use the real fonts. Do **not** also declare
  `images` in the `metadata` object — the file convention emits its own tags and you will
  ship two competing `og:image`s.

### JSON-LD

- Pick the **narrowest** `@type` that fits (`HairSalon`, not `LocalBusiness`).
- Same address, geo, phone, hours and services as the client's profile.
- `areaServed` as **named `Place` entries, not one string** — "near me" searches fire from
  the surrounding neighbourhoods as much as from the street.
- schema.org `keywords` **is** read (unlike the meta tag): it feeds the entity.
- `audience` where the category has a wrong default (a salon that also does barbing should
  not read as women-only).
- Opening hours mapped from the same data array the page renders.
- **Never `aggregateRating` about yourself.** Google treats a business marking up its own
  ratings as self-serving and ignores it; for reviews left on Google, Google already has
  them. Put the number on the page next to a link to the listing.
- Escape `<` when serialising: `JSON.stringify(x).replace(/</g, '\\u003c')`.

### Gate 6

- [ ] Every target phrase greppable in the rendered HTML (`curl -s localhost:3000 | rg -i "<phrase>"`).
- [ ] JSON-LD validated; no self-referential ratings.
- [ ] One canonical origin across metadata, JSON-LD, sitemap, robots.
- [ ] Share card renders in a link preview.

---

## Phase 7 — Performance

The brief sets a budget (last one: **600 KB initial load**, max 2 font files, no autoplay
video, CTA works without JS). Treat it as LOCKED. The last build shipped **326 KB
brotli** on the critical path, which is the standard to beat, not a ceiling to fill.

### Fonts — the biggest single win

1. **Self-host.** A Google-served variable font is a render-blocking preload on the
   critical path.
2. **Instance out the axes you never move.** Fraunces ships four axes at 120 KB; the
   design fixed three of them and only `opsz` varied. Baking the three into the file gives
   an identical rendering at **34 KB** — most of a second off the largest paint on a
   budget Android over 3G.

   ```sh
   pip install fonttools brotli
   python -c "
   from fontTools.ttLib import TTFont; from fontTools.varLib import instancer
   f = instancer.instantiateVariableFont(TTFont('Family[AXES].ttf'), {'SOFT': 18, 'WONK': 1, 'wght': 500})
   f.flavor = 'woff2'; f.save('public/fonts/Family-opsz-var.woff2')"
   ```

   Keep the `font-variation-settings` declaration in CSS anyway, with a comment saying it
   is inert against the shipped file — so the intent survives if someone swaps the full
   font back in.

3. **Ship only the weights the page sets.** Grep for `font-bold`, `font-semibold`,
   `<strong>`, `<b>` before including 700; on the last site nothing used it and it was
   33 KB of preload for a weight that never rendered.
4. woff2 always (.otf → woff2 roughly halves it), `display: 'swap'`, exposed as a CSS
   variable through `next/font/local`.
5. The licence file travels with the font (`public/fonts/Family-OFL.txt`). Check the
   licence permits subsetting and self-hosting before you do either.

### Images

```ts
images: {
  formats: ['image/avif', 'image/webp'],   // order matters: first Accept match wins
  deviceSizes: [640, 750, 828, 1080],      // trim to widths the sources can actually serve
  imageSizes: [96, 128, 256, 384],
  qualities: [75],                          // required allowlist; keeps the optimizer endpoint bounded
  minimumCacheTTL: 31_536_000,              // static assets whose hash changes when they do
}
```

Every source exported at 1000px wide means the default ladder's 1200/1920/2048/3840 rungs
can never return anything bigger than 828 — that was **44 KB of dead srcset markup, 12% of
the document**, and four extra optimizer cache entries per photo to pay for. Trim the
ladder to the truth.

- `fill` for tiles whose box is decided by the layout; pass a `sizes` string that matches
  the real rendered width or the browser over-downloads.
- `priority` only on the actual largest paint. If the hero's largest paint is the
  _headline_, the hero tiles stay **lazy** so their preloads stop racing the fonts for the
  first round trips.

### Other

- `experimental.inlineCss: true` for first-visit-dominated sites (bio link traffic, budget
  Android): inlines the sheet instead of a render-blocking request.
- Check each release's defaults before adding an experimental flag — several graduate and
  become dead config.
- Every route should still prerender as static. If one flips to dynamic, find out why.

### Gate 7

- [ ] Critical path measured (brotli) and under the brief's budget; number recorded in the commit.
- [ ] Font files: count and bytes justified, each weight rendered somewhere.
- [ ] No image ladder rung that cannot be served.
- [ ] `pnpm build` shows every route static.

---

## Phase 8 — Accessibility gate

Run `fable-accessibility` before delivery. Beyond it, the rules this build settled:

- **Contrast is measured against the pixels that actually render**, not against the token's
  nominal background. Text over a photographic field is measured against the darkest tile
  it can sit on. When it fails, **fix the text colour, not the veil** — thinning a scrim to
  save contrast hides the idea the section is built around. Record the worst case per
  element in the commit body.
- Body text floor: 16px (we ship 17px). No thin weights for body copy. The bar is "legible
  on a budget phone in sunlight".
- `:focus-visible` styled globally, with offset. A skip link as the first focusable
  element.
- Semantic markup over ARIA: hours as a description list, not divs.
- Any overlay traps focus, closes on Escape, returns focus to its trigger, and stops the
  page behind it scrolling.
- `[id] { scroll-margin-top }` so anchored sections are not hidden under a fixed header.
- Decorative layers get `aria-hidden`.

### Gate 8

- [ ] Every text/background pair measured, including over imagery.
- [ ] Keyboard-only pass: skip link, nav, every CTA, overlay open and close.
- [ ] Reduced-motion pass.
- [ ] Real device or a true mobile viewport, not just a resized desktop window.

---

## Phase 9 — Ship

```sh
pnpm check          # format:check + lint
pnpm build          # every route static?
rm -rf .next && pnpm build   # when anything config-level changed
```

- [ ] Every LOCKED item from Gate 0 re-checked against the built site.
- [ ] Placeholder audit: no stand-in photo, no lorem, no invented fact survives.
- [ ] Client's name/phone/address identical on site, profile and chat app.
- [ ] `open_questions` handed over as a list, with what each one blocks.
- [ ] Profile repointed at the new site on launch day.

### Writing it down

The comment explains **why**, with the number. `deviceSizes` trimmed is not "optimised
images" — it is "44 KB of dead srcset markup, 12% of the document". A future reader (often
you, two weeks later, for a different client) needs the reasoning, because the reasoning is
what transfers and the code does not.

Commit bodies carry the same weight: what changed, what it was before, what it measured
after, and what was deliberately _not_ done. Those bodies are where this playbook came
from.

---

## What is constant vs what the brief decides

| Constant across every project                               | The brief decides                      |
| ----------------------------------------------------------- | -------------------------------------- |
| Purge-first; deps match imports                             | Which features exist at all            |
| One typed data file, provenance in comments                 | What the facts are                     |
| kebab-case folders, `index.tsx`                             | Which components exist                 |
| Server-first; client leaves only                            | Which interactions are worth an island |
| Works with JS off                                           | —                                      |
| Never invent a fact                                         | Which facts are known                  |
| Fable route: dna → surface → critique                       | Concept, palette, type, photography    |
| One primary action, works as a plain link                   | What the action is                     |
| Canonical origin in one module; sitemap; robots; share card | Domain, phrases, entity type           |
| Fonts instanced and self-hosted; trimmed image ladder       | Which typefaces, which imagery         |
| Contrast measured on rendered pixels                        | The palette being measured             |
| No fake urgency, no invented proof, no em dashes in copy    | Voice and language                     |

## Cost discipline

This file exists so the same decisions are not re-derived at full price on every project.

- Read the brief and this file **first**. Do not re-audit what is written here.
- Do not spawn subagents for work you can do inline.
- Batch independent reads into one call.
- When a new decision generalizes, **add it here** in one or two lines rather than letting
  it live only in a commit message nobody will find again.
