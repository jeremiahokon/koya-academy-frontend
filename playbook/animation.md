# Animation playbook

> How this template does motion: GSAP + ScrollTrigger for scroll choreography, CSS for
> everything that does not need a timeline, and the build rules left intact. Server-first,
> complete with JavaScript off, and inside the performance budget.
>
> **The brief decides how loud the motion is. This file decides how it is built.** Read it
> at Phase 4 of [`website-build-playbook.md`](./website-build-playbook.md), after
> `fable-design-dna` and `fable-motion-design` have set the concept and the personality.

The code below is copy-ready. It was type-checked against `gsap@3.15.0` and `lenis@1.3.26`
under `strict` + `noUncheckedIndexedAccess`, and the sizes quoted were measured, not
estimated.

---

## 1. The shape of the system

The build rules and award-level motion look like they conflict. They do not, if
the system has this shape:

| Constraint from the playbook              | How the motion system meets it                                                                                                                                  |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Server-first, `'use client'` on leaves    | **One** client boundary, `MotionScope`. Sections stay Server Components and ask for motion with `data-motion="…"` attributes. No per-section client components. |
| Works with JS off                         | Every element renders in its final, visible state. JS sets the hidden "before" state, only for elements off-screen at boot.                                     |
| 600 KB budget, fonts win the first paint  | GSAP loads as its own chunk, **on idle, after hydration**. Nothing about it is render-blocking. Plugins load only if the page uses them.                        |
| Transform and opacity only                | Every effect below tweens `x/y/xPercent/yPercent/scale/skew/opacity` and nothing else.                                                                          |
| Reduced motion                            | One `gsap.matchMedia()` block. Under `reduce`, movement becomes a short fade or nothing, and pins and horizontal tracks switch off.                             |
| "Let sections declare themselves"         | Same idea as `data-has-cta`: mark an element, and the runtime finds it. Adding motion to a section never means editing the motion code.                         |
| Cache Components keeps routes in Activity | `MotionScope` lives in each **page**, not the layout. Hidden routes run the effect cleanup, so no trigger ever measures a `display: none` page.                 |

### Pick the engine per job

| Job                                                             | Engine                                 | Cost               |
| --------------------------------------------------------------- | -------------------------------------- | ------------------ |
| Hover, press, focus, open/close, menu states                    | CSS transitions                        | 0 KB               |
| Hero entrance (runs on **load**, must land in the first second) | CSS keyframes over server-split words  | 0 KB               |
| Marquees and ambient loops                                      | CSS keyframes, `-50%` of a doubled set | 0 KB               |
| Scroll progress hairline                                        | CSS `animation-timeline: scroll()`     | 0 KB               |
| Reveals, masked lines, counters, parallax, pins, horizontal     | GSAP + ScrollTrigger via `MotionScope` | 47 KB gz, deferred |
| Magnetic buttons, velocity skew                                 | GSAP `quickTo` via `MotionScope`       | included above     |
| SVG line drawing                                                | `DrawSVGPlugin`                        | +2.2 KB gz         |
| Layout changes (filter a grid, expand a card)                   | `Flip`                                 | +9.7 KB gz         |
| Route-to-route transitions                                      | React `<ViewTransition>` (see §8)      | 0 KB               |
| Eased wheel scrolling (showpiece tier only)                     | Lenis driven by the GSAP ticker        | +5.5 KB gz         |

Never import GSAP for a hover. Never build a scroll scene out of raw `scroll` listeners.

### Licence

Since 3.13, GSAP and **every** plugin (SplitText, DrawSVG, Flip, ScrollSmoother, MorphSVG)
are free for commercial use from the public `gsap` package. No club registry, no token. The
licence's one restriction is building a tool that competes with Webflow's visual builder,
which a client site never is.

---

## 2. Choose the tier from the brief

The brief's `visual.motion` field sets the tier. Extend it to this shape:

```yaml
visual:
  motion:
    tier: conversion # css | conversion | showpiece
    personality: # from fable-motion-design, e.g. "weighted, unhurried, editorial"
    signature: # the ONE moment the site owns: section id + mechanic
    loud_sections: [] # at most two scroll moments that pin or take over
    smooth_scroll: false # true only on showpiece
```

| Tier         | When                                                                                 | Install               | What ships                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `css`        | The brief says minimal motion, or the budget is already spent                        | nothing               | CSS hero, micro-interactions, the IntersectionObserver `reveal` island from the main playbook                                                            |
| `conversion` | **Default** for local-business briefs. Pages that must convert but should feel alive | `pnpm add gsap`       | everything in `css`, plus the GSAP runtime: reveals, lines, stagger, counter, parallax, unmask, magnetic, one pinned or horizontal moment                |
| `showpiece`  | `fable-award-winning-web` is the surface skill. Portfolios, launches, studios        | `pnpm add gsap lenis` | everything in `conversion`, plus scenes, horizontal tracks, draw, velocity, Lenis, view transitions, one signature effect from `fable-signature-effects` |

When the GSAP runtime ships, it **replaces** the `reveal` island. Two reveal systems on one
page is the same bug as two icon libraries. `@gsap/react` is not installed: the runtime
boots asynchronously and cleans up with `matchMedia().revert()`, which `useGSAP` does not
add anything to. `tw-animate-css` goes in the Phase 1 purge unless something renders one of
its classes.

---

## 3. Map the motion before writing any

"Maximise motion" means **every section moves; only one or two perform.** A page where every
section pins and scrubs has no rhythm, and rhythm is the thing award juries notice. Write
the map first, as a table in `src/components/motion/motion-map.md`, one row per section:

| Section archetype         | Weight | Motion                                                                               | Mobile (< 768px)          | Reduced motion  |
| ------------------------- | ------ | ------------------------------------------------------------------------------------ | ------------------------- | --------------- |
| Header                    | quiet  | hides on scroll down, returns on scroll up; progress hairline                        | same                      | never hides     |
| Hero                      | loud   | words rise from masks on **load**; image settles from 1.08×; CTA arrives last        | same                      | static          |
| Statement / intro         | medium | `lines` masked line reveal                                                           | same                      | 0.3s fade       |
| Services / offer grid     | quiet  | `stagger` by row; card image zoom on hover; magnetic primary CTA                     | stagger, no hover         | 0.3s fade       |
| Work / gallery / showcase | loud   | `horizontal`: vertical scroll drives the track; cards scale in as they cross         | native scroll-snap rail   | rail            |
| Process / how it works    | loud   | `steps` scene: pinned, steps cross over, snaps per step; or `draw` a connecting path | stacked list with reveals | list            |
| Numbers                   | medium | `counter` to the value already in the markup, tabular numerals                       | same                      | final numbers   |
| Reviews / proof           | quiet  | `stagger`, or a CSS marquee of quotes with `velocity` skew                           | marquee                   | static, wrapped |
| Plans / features          | medium | `stack`: sticky cards recede as the next arrives                                     | sticky only               | sticky only     |
| Image break               | medium | `parallax` (≤ 10%) or `unmask`                                                       | lower speed               | none            |
| Final CTA                 | medium | `words` on the headline; magnetic button                                             | words                     | fade            |
| Footer                    | quiet  | oversized wordmark `lines`; CSS marquee                                              | same                      | static          |

Rules for the map:

- **At most two loud scroll moments per page** (the hero's load entrance does not count). Never
  two pinned sections back to back; put a quiet section between them so the scroll
  breathes.
- **The signature moment sits on the section that carries the concept**, not wherever it
  looks cool. A salon's signature is the work; a builder's is the process.
- **Every loud row names its phone behaviour.** Horizontal and pinned scenes do not run on
  phones; the markup underneath is already the better phone experience.
- A section whose content is empty still renders complete. Motion never covers for a gap.

---

## 4. Install and wire it

```sh
pnpm add gsap            # conversion
pnpm add gsap lenis      # showpiece
```

```
src/components/
  motion/
    index.tsx        # MotionScope — the one client boundary
    runtime.ts       # loads GSAP + only the plugins the page asks for
    effects.ts       # generic data-motion effects
    scenes.ts        # this site's bespoke choreography
    motion-map.md    # the section-by-section map from §3
  split-words/
    index.tsx        # server-rendered hero word split
  smooth-scroll/
    index.tsx        # Lenis leaf, showpiece only
```

Wrap each page's content, **not** the layout. The page stays a Server Component; everything
passed through `children` renders on the server.

```tsx
// src/app/page.tsx
import { MotionScope } from '@/components/motion';

export default function Page() {
  return (
    <main id="main">
      <MotionScope>
        <Hero />
        <Work />
        <Process />
      </MotionScope>
    </main>
  );
}
```

Why the page and not the layout: with `cacheComponents: true`, Next keeps up to three
visited routes in the DOM under `<Activity mode="hidden">` (`display: none`). A scope in
the layout would find the hidden pages' elements and pin sections that have no size.
In the page, Activity runs the effect cleanup when the route hides and runs the effect
again when it returns, so triggers are always measured against the visible page.

### `motion/index.tsx`

```tsx
'use client';

import { type ReactNode, useEffect, useRef } from 'react';

type Props = { children: ReactNode; className?: string };

/**
 * The only client boundary the motion system needs. Children stay Server
 * Components; this file ships a few hundred bytes. GSAP arrives in its own
 * chunk, on idle, after the page is already complete and interactive.
 */
export function MotionScope({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    // Automated browsers get the static page: full-page screenshots never
    // scroll, so anything waiting on a scroll trigger would stay hidden.
    if (!root || navigator.webdriver) return;

    let dispose: (() => void) | undefined;
    let cancelled = false;

    const start = () =>
      import('./runtime')
        .then(({ boot }) => boot(root))
        .then((d) => (cancelled ? d() : (dispose = d)));

    const id =
      'requestIdleCallback' in window
        ? requestIdleCallback(start, { timeout: 1200 })
        : setTimeout(start, 200);

    // Runs on unmount AND when Activity hides this route (cacheComponents),
    // so pins and triggers never measure a display:none page.
    return () => {
      cancelled = true;
      if ('cancelIdleCallback' in window) cancelIdleCallback(id);
      clearTimeout(id);
      dispose?.();
    };
  }, []);

  return (
    <div ref={ref} className={className} data-motion-scope="">
      {children}
    </div>
  );
}
```

### `motion/runtime.ts`

```ts
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
  type Conditions,
  type EffectName,
  effects,
  type PluginName,
  type Tools,
} from './effects';
import { type SceneName, scenes } from './scenes';

// Loaded only when an element on the page asks for them.
const loaders: Record<PluginName, () => Promise<object>> = {
  SplitText: () => import('gsap/SplitText').then((m) => m.SplitText),
  DrawSVGPlugin: () =>
    import('gsap/DrawSVGPlugin').then((m) => m.DrawSVGPlugin),
  Flip: () => import('gsap/Flip').then((m) => m.Flip),
};

const queries = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 768px)',
  fine: '(hover: hover) and (pointer: fine)',
};

export async function boot(root: HTMLElement): Promise<() => void> {
  const byEffect = new Map<EffectName, HTMLElement[]>();
  for (const el of root.querySelectorAll<HTMLElement>('[data-motion]')) {
    const name = el.dataset.motion as EffectName;
    if (!(name in effects)) continue;
    byEffect.set(name, [...(byEffect.get(name) ?? []), el]);
  }
  const sceneEls = [
    ...root.querySelectorAll<HTMLElement>('[data-scene]'),
  ].filter((el) => (el.dataset.scene as SceneName) in scenes);
  if (byEffect.size === 0 && sceneEls.length === 0) return () => {};

  const needed = new Set<PluginName>([
    ...[...byEffect.keys()].flatMap((n) => effects[n].plugins),
    ...sceneEls.flatMap((el) => scenes[el.dataset.scene as SceneName].plugins),
  ]);
  const loaded = await Promise.all(
    [...needed].map(async (n) => [n, await loaders[n]()] as const)
  );

  gsap.registerPlugin(ScrollTrigger, ...loaded.map(([, p]) => p));
  ScrollTrigger.config({ ignoreMobileResize: true });
  const tools = { gsap, ScrollTrigger, ...Object.fromEntries(loaded) } as Tools;

  const mm = gsap.matchMedia();
  mm.add(queries, (ctx) => {
    const c = ctx.conditions as Conditions;
    const cleanups: (() => void)[] = [];
    for (const [name, els] of byEffect) {
      const undo = effects[name].run(els, tools, c);
      if (undo) cleanups.push(undo);
    }
    for (const el of sceneEls) {
      const undo = scenes[el.dataset.scene as SceneName].run(el, tools, c);
      if (undo) cleanups.push(undo);
    }
    return () => cleanups.forEach((f) => f());
  });

  // Webfonts reflow text after the first measure; re-measure once they land.
  void document.fonts.ready.then(() => ScrollTrigger.refresh());

  return () => mm.revert();
}
```

`gsap.matchMedia()` is doing three jobs at once: it re-runs every effect when the viewport
crosses 768px or the user flips reduced motion, it reverts every tween, ScrollTrigger and
SplitText created inside it (restoring the original inline styles and text), and it gives
each effect the current `conditions` so it can choose what to do.

### `motion/effects.ts`

```ts
import type { gsap as GSAP } from 'gsap';
import type { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import type { Flip } from 'gsap/Flip';
import type { ScrollTrigger as ST } from 'gsap/ScrollTrigger';
import type { SplitText } from 'gsap/SplitText';

export type PluginName = 'SplitText' | 'DrawSVGPlugin' | 'Flip';
export type Tools = {
  gsap: typeof GSAP;
  ScrollTrigger: typeof ST;
  // Present only when an effect on the page listed it in `plugins`.
  SplitText: typeof SplitText;
  DrawSVGPlugin: typeof DrawSVGPlugin;
  Flip: typeof Flip;
};
export type Conditions = {
  motion: boolean;
  reduce: boolean;
  desktop: boolean;
  fine: boolean;
};
export type Effect = {
  plugins: PluginName[];
  run: (els: HTMLElement[], t: Tools, c: Conditions) => void | (() => void);
};

// Mirrors --ease-out-expo in globals.css, so CSS and GSAP motion feel like one hand.
const EASE = 'expo.out';

/**
 * Elements already on screen when the runtime boots are left alone. Hiding
 * them now would flash visible → hidden → visible, and tall-viewport crawlers
 * see everything as "on screen" and so never get a hidden section.
 */
const pending = (els: Element[], { ScrollTrigger }: Tools) =>
  els.filter(
    (el) =>
      !ScrollTrigger.isInViewport(el) && !el.closest('[data-motion-track]')
  );

function revealBatch(targets: Element[], t: Tools, c: Conditions) {
  const els = pending(targets, t);
  if (els.length === 0) return;
  // opacity, never autoAlpha: visibility:hidden would drop links from the tab order.
  t.gsap.set(els, { opacity: 0, y: c.reduce ? 0 : 32 });
  t.ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) =>
      t.gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: c.reduce ? 0.3 : 0.9,
        ease: EASE,
        stagger: c.reduce ? 0 : 0.08,
        overwrite: true,
      }),
  });
}

function split(type: 'lines' | 'words'): Effect {
  return {
    plugins: ['SplitText'],
    run(els, t, c) {
      if (c.reduce) return revealBatch(els, t, c);
      for (const el of pending(els, t)) {
        t.SplitText.create(el, {
          type,
          mask: type,
          autoSplit: true, // re-splits on resize and font load, keeping lines true
          onSplit: (self) =>
            t.gsap.from(self[type], {
              yPercent: 110,
              duration: 1,
              ease: EASE,
              stagger: type === 'lines' ? 0.08 : 0.035,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }),
        });
      }
    },
  };
}

export const effects = {
  /** Fade and rise once, on entry. */
  reveal: { plugins: [], run: revealBatch },

  /** Direct children reveal in order; batched, so a grid staggers row by row. */
  stagger: {
    plugins: [],
    run: (els, t, c) =>
      revealBatch(
        els.flatMap((el) => [...el.children]),
        t,
        c
      ),
  },

  /** Masked line reveal for headings and short paragraphs. */
  lines: split('lines'),

  /** Masked word reveal for display type only. */
  words: split('words'),

  /** Background drift. data-motion-speed ≤ 0.1; the element must overscan its frame. */
  parallax: {
    plugins: [],
    run(els, { gsap }, c) {
      if (c.reduce) return;
      for (const el of els) {
        const s = Math.min(Number(el.dataset.motionSpeed ?? 0.08), 0.1) * 100;
        gsap.fromTo(
          el,
          { yPercent: -s },
          {
            yPercent: s,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    },
  },

  /** Image settles from 1.2× to 1× inside its overflow-hidden frame as it scrolls in. */
  unmask: {
    plugins: [],
    run(els, { gsap }, c) {
      if (c.reduce) return;
      for (const el of els) {
        gsap.fromTo(
          el,
          { scale: 1.2 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'center center',
              scrub: 0.6,
            },
          }
        );
      }
    },
  },

  /**
   * Vertical scroll drives a horizontal track. Desktop + motion only: everywhere
   * else the markup is already a native scroll-snap rail, which is the better
   * phone experience anyway.
   */
  horizontal: {
    plugins: [],
    run(els, { gsap }, c) {
      if (!c.desktop || c.reduce) return;
      const undo: (() => void)[] = [];
      for (const section of els) {
        const rail = section.querySelector<HTMLElement>('[data-motion-rail]');
        const track = section.querySelector<HTMLElement>('[data-motion-track]');
        if (!rail || !track) continue;

        section.dataset.motionPinned = ''; // CSS turns the rail into a clipped stage
        const distance = () => track.scrollWidth - rail.clientWidth;
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            start: 'top top',
            end: () => `+=${distance()}`,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        for (const item of track.querySelectorAll<HTMLElement>(
          '[data-motion-item]'
        )) {
          gsap.from(item, {
            opacity: 0.3,
            scale: 0.92,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              containerAnimation: tween,
              start: 'left right',
              end: 'left center',
              scrub: true,
            },
          });
        }

        // Tabbing into an off-stage card scrolls the page to where that card is on stage.
        const st = tween.scrollTrigger;
        const onFocus = (e: FocusEvent) => {
          const item = (e.target as HTMLElement).closest<HTMLElement>(
            '[data-motion-item]'
          );
          if (!item || !st) return;
          const p = Math.min(1, item.offsetLeft / Math.max(1, distance()));
          window.scrollTo({
            top: st.start + p * (st.end - st.start),
            behavior: 'instant',
          });
        };
        track.addEventListener('focusin', onFocus);
        undo.push(() => {
          track.removeEventListener('focusin', onFocus);
          delete section.dataset.motionPinned;
        });
      }
      return () => undo.forEach((f) => f());
    },
  },

  /** Sticky cards (sticky in CSS already); each one recedes as the next arrives. */
  stack: {
    plugins: [],
    run(els, { gsap }, c) {
      if (c.reduce) return;
      for (const stack of els) {
        const cards = [...stack.children] as HTMLElement[];
        cards.slice(0, -1).forEach((card, i) => {
          gsap.to(card, {
            scale: 0.92,
            transformOrigin: '50% 0%',
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top bottom',
              end: 'top 20%',
              scrub: true,
            },
          });
        });
      }
    },
  },

  /**
   * Counts up to the number already in the markup. The server renders the real
   * value, so JS-off, crawlers and reduced motion all read the fact.
   */
  counter: {
    plugins: [],
    run(els, t, c) {
      if (c.reduce) return;
      const restore: (() => void)[] = [];
      const locale = document.documentElement.lang || undefined;
      for (const el of pending(els, t)) {
        const final = el.textContent ?? '';
        const match = /-?\d[\d,.]*/.exec(final);
        if (!match) continue;
        const raw = match[0];
        const decimals = raw.split('.')[1]?.length ?? 0;
        const fmt = new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
        const n = { v: 0 };
        const write = () =>
          (el.textContent = final.replace(raw, fmt.format(n.v)));
        write();
        t.gsap.to(n, {
          v: Number(raw.replaceAll(',', '')),
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: write,
          onComplete: () => void (el.textContent = final),
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
        restore.push(() => void (el.textContent = final));
      }
      return () => restore.forEach((f) => f());
    },
  },

  /** SVG strokes draw with scroll. */
  draw: {
    plugins: ['DrawSVGPlugin'],
    run(els, { gsap }, c) {
      if (c.reduce) return;
      for (const el of els) {
        gsap.from(el.querySelectorAll('path, line, polyline, circle, rect'), {
          drawSVG: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: 0.8,
          },
        });
      }
    },
  },

  /** Pulls toward the pointer. Mouse and trackpad only; touch has nothing to follow. */
  magnetic: {
    plugins: [],
    run(els, { gsap }, c) {
      if (!c.fine || c.reduce) return;
      const off: (() => void)[] = [];
      for (const el of els) {
        const k = Number(el.dataset.motionStrength ?? 0.3);
        const xTo = gsap.quickTo(el, 'x', {
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        });
        const yTo = gsap.quickTo(el, 'y', {
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        });
        let r = el.getBoundingClientRect();
        const enter = () => (r = el.getBoundingClientRect()); // one layout read per hover, not per move
        const move = (e: PointerEvent) => {
          xTo((e.clientX - r.left - r.width / 2) * k);
          yTo((e.clientY - r.top - r.height / 2) * k);
        };
        const leave = () => (xTo(0), yTo(0));
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        off.push(() => {
          el.removeEventListener('pointerenter', enter);
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
        });
      }
      return () => off.forEach((f) => f());
    },
  },

  /** Skews with scroll speed and settles when scrolling stops. Pair with a CSS marquee. */
  velocity: {
    plugins: [],
    run(els, { gsap, ScrollTrigger }, c) {
      if (c.reduce) return;
      const skews = els.map((el) =>
        gsap.quickTo(el, 'skewX', { duration: 0.5, ease: 'power3.out' })
      );
      let settle: ReturnType<typeof gsap.delayedCall> | undefined;
      ScrollTrigger.create({
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / -400);
          skews.forEach((s) => s(v));
          settle?.kill();
          settle = gsap.delayedCall(0.12, () => skews.forEach((s) => s(0)));
        },
      });
    },
  },
} satisfies Record<string, Effect>;

export type EffectName = keyof typeof effects;
```

### `motion/scenes.ts`

Generic effects cover the page. Scenes are where the concept gets staged, written per site.
The `steps` scene is the template to copy.

```ts
import type { Conditions, PluginName, Tools } from './effects';

export type Scene = {
  plugins: PluginName[];
  run: (el: HTMLElement, t: Tools, c: Conditions) => void | (() => void);
};

/**
 * Bespoke choreography, one entry per named moment on this site. Generic
 * effects cover the page; scenes are where the concept gets staged. Keep it
 * to one or two: a pinned scene per page is a statement, three is a theme park.
 */
export const scenes = {
  /**
   * <section data-scene="steps"> with [data-steps] > [data-step] children and an
   * optional [data-step-fill] rule. JS off, reduced motion or phone: a plain
   * stacked list. Desktop: pinned, steps cross over, snapping to each one.
   */
  steps: {
    plugins: [],
    run(el, { gsap }, c) {
      if (c.reduce || !c.desktop) return;
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]', el);
      if (steps.length < 2) return;
      el.dataset.motionPinned = ''; // CSS stacks the steps into one grid cell

      gsap.set(steps.slice(1), { opacity: 0, yPercent: 20 });
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 0.8,
          start: 'top top',
          end: () => `+=${steps.length * 60}%`,
          snap: { snapTo: 'labels', duration: 0.4, ease: 'power2.inOut' },
        },
      });
      tl.addLabel('step-0');
      steps.slice(1).forEach((step, i) => {
        tl.to(steps[i]!, { opacity: 0, yPercent: -20 })
          .to(step, { opacity: 1, yPercent: 0 }, '<')
          .addLabel(`step-${i + 1}`);
      });
      const fill = el.querySelector('[data-step-fill]');
      if (fill)
        tl.fromTo(
          fill,
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', duration: tl.duration() },
          0
        );

      return () => void delete el.dataset.motionPinned;
    },
  },
} satisfies Record<string, Scene>;

export type SceneName = keyof typeof scenes;
```

Scene rules: one labelled timeline per scene (beats you can read and retune, never
`setTimeout` chains); `scrub: 0.5–1` so it feels weighted; `snap` to labels when the scene
has discrete states; `end` as a function so it re-measures on resize.

---

## 5. The attribute API

Sections are Server Components. They ask for motion with attributes and nothing else.

| Attribute                                         | Put it on                                                                          | Does                                                 | Plugin    |
| ------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | --------- |
| `data-motion="reveal"`                            | any block                                                                          | fade + 32px rise, once, batched with its neighbours  | none      |
| `data-motion="stagger"`                           | a grid or list                                                                     | its direct children reveal in order, row by row      | none      |
| `data-motion="lines"`                             | headings, short paragraphs                                                         | masked line reveal, re-split on resize and font load | SplitText |
| `data-motion="words"`                             | display type only                                                                  | masked word reveal                                   | SplitText |
| `data-motion="parallax"` + `data-motion-speed`    | an image that overscans its `overflow-hidden` frame                                | drift ≤ 10% with scroll                              | none      |
| `data-motion="unmask"`                            | an image inside an `overflow-hidden` frame                                         | settles 1.2× → 1× as it scrolls in                   | none      |
| `data-motion="horizontal"`                        | a section with `[data-motion-rail]` > `[data-motion-track]` > `[data-motion-item]` | pinned horizontal track on desktop                   | none      |
| `data-motion="stack"`                             | the parent of sticky cards                                                         | each card recedes as the next arrives                | none      |
| `data-motion="counter"`                           | an element whose text contains the real number                                     | counts up to it, once                                | none      |
| `data-motion="draw"`                              | an `<svg>`                                                                         | strokes draw with scroll                             | DrawSVG   |
| `data-motion="magnetic"` + `data-motion-strength` | the primary CTA, one or two per page                                               | pulls toward the pointer                             | none      |
| `data-motion="velocity"`                          | a marquee row                                                                      | skews with scroll speed, settles on stop             | none      |
| `data-scene="steps"`                              | a section built to the scene's markup contract                                     | bespoke pinned timeline                              | per scene |

A heading that is also the section's first child does not need `reveal` on the section
too. **One effect per element**; nest instead of stacking two on one node.

### Markup contracts

```tsx
// Horizontal: a native scroll-snap rail until the runtime pins it.
<section data-motion="horizontal" aria-labelledby="work-title">
  <h2 id="work-title" data-motion="lines">Recent work</h2>
  <div data-motion-rail="">
    <ul data-motion-track="">
      {work.map((w) => (
        <li key={w.id} data-motion-item="">…</li>
      ))}
    </ul>
  </div>
</section>

// Parallax / unmask: the frame clips, the image moves.
<div className="relative aspect-4/5 overflow-hidden">
  <Image data-motion="parallax" data-motion-speed="0.08" className="scale-[1.2]" fill … />
</div>

// Counter: the real number is in the HTML. Never animate an invented figure.
<p className="tabular-nums" data-motion="counter">{stats.years} years</p>

// Steps scene
<section data-scene="steps">
  <div className="h-px origin-left bg-current" data-step-fill="" aria-hidden />
  <ol data-steps="">
    {steps.map((s) => <li key={s.id} data-step="">…</li>)}
  </ol>
</section>
```

---

## 6. CSS layer

Add to `globals.css`. The CSS carries the hero, the loops, the micro-interactions and the
states the runtime toggles, so the JS stays small.

```css
@theme {
  /* One easing family across CSS and GSAP ('expo.out' ≈ this curve). */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
}

:root {
  --dur-press: 120ms;
  --dur-hover: 220ms;
  --dur-reveal: 900ms;
}

/* Hero word entrance: pairs with <SplitWords>, runs on load, no JS. */
.split-word {
  display: inline-block;
  overflow: clip;
  vertical-align: top;
  padding-block-end: 0.12em; /* keep descenders inside the mask */
  margin-block-end: -0.12em;
}
.split-word > span {
  display: inline-block;
  animation: word-rise var(--dur-reveal) var(--ease-out-expo)
    calc(var(--i) * 70ms + 80ms) both;
}
@keyframes word-rise {
  from {
    transform: translateY(105%);
  }
}

/* Horizontal: native scroll-snap rail until the runtime pins it. */
[data-motion-rail] {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
}
[data-motion-track] {
  position: relative; /* offsetParent for the focus handler */
  display: flex;
  width: max-content;
}
[data-motion-item] {
  scroll-snap-align: start;
}
[data-motion-pinned] {
  overflow: clip;
}
[data-motion-pinned] [data-motion-rail] {
  overflow: visible;
  scroll-snap-type: none;
}

/* Steps scene: a stacked list until pinned, then one shared grid cell. */
[data-scene='steps'][data-motion-pinned] [data-steps] {
  display: grid;
}
[data-scene='steps'][data-motion-pinned] [data-step] {
  grid-area: 1 / 1;
}

/* Marquee: two identical sets, the second aria-hidden, travelling exactly -50%. */
.marquee {
  display: flex;
  width: max-content;
  animation: marquee 40s linear infinite;
}
.marquee:hover,
.marquee:focus-within {
  animation-play-state: paused; /* WCAG 2.2.2: moving content can be stopped */
}
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

/* Scroll progress: zero JS where supported, simply absent where not. */
.scroll-progress {
  display: none;
}
@supports (animation-timeline: scroll()) {
  .scroll-progress {
    display: block;
    transform-origin: 0 50%;
    animation: progress linear both;
    animation-timeline: scroll(root);
  }
  @keyframes progress {
    from {
      transform: scaleX(0);
    }
  }
}

/* Underline that draws in from the left and leaves to the right. */
@utility link-draw {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    inset-inline: 0;
    bottom: -0.12em;
    height: 1px;
    background: currentColor;
    transform: scaleX(0);
    transform-origin: right;
    transition: transform var(--dur-hover) var(--ease-out-expo);
  }
  &:hover::after,
  &:focus-visible::after {
    transform: scaleX(1);
    transform-origin: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  .split-word > span,
  .marquee {
    animation: none;
  }
}
```

### `split-words/index.tsx`

```tsx
import type { CSSProperties } from 'react';

type Props = { text: string };

/**
 * Server-rendered word split for the hero headline. The entrance is pure CSS,
 * so it plays on first paint with no JavaScript at all. Screen readers get the
 * sentence once, not word by word.
 */
export function SplitWords({ text }: Props) {
  const words = text.split(' ');
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={`${i}-${word}`}>
            <span className="split-word">
              <span style={{ '--i': i } as CSSProperties}>{word}</span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </>
  );
}
```

```tsx
<h1 className="text-display">
  <SplitWords text={hero.headline} />
</h1>
```

The hero is CSS on purpose: the GSAP chunk arrives on idle, and the concept has to land
inside the first second. If the headline is the largest paint, measure LCP with the
entrance on and off; keep the first word moving by ~100ms and the last one settled by
~900ms.

---

## 7. Micro-interactions

Component-scale feedback is CSS, under 300ms, from `fable-micro-interactions`. Tailwind v4's
`hover:` variant already applies only under `(hover: hover)`, so touch never gets stuck
hover states.

| Element        | Recipe                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button press   | `transition-transform duration-(--dur-press) ease-out-expo active:scale-[0.97]`                                                                                                                                                        |
| Arrow in a CTA | parent `group`; icon `transition-transform duration-(--dur-hover) ease-out-expo group-hover:translate-x-1`                                                                                                                             |
| Text link      | `link-draw` utility above                                                                                                                                                                                                              |
| Image card     | frame `overflow-hidden`; image `transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]`                                                                                                                              |
| Focus          | global `:focus-visible` ring with offset, `transition-[outline-offset]` for a small settle                                                                                                                                             |
| Primary CTA    | add `data-motion="magnetic"`; it keeps its CSS press state underneath                                                                                                                                                                  |
| Menu / overlay | CSS transitions keyed off `data-state="open"`; opacity + translate only; focus trap and Escape stay in the island                                                                                                                      |
| Header         | hides on scroll down via a `data-hidden` attribute and a `translateY(-100%)` transition, set from a passive, rAF-throttled scroll listener that only compares `scrollY`. Never hides under reduced motion or while focus is inside it. |

A cursor follower, image trail, or WebGL hover is a **signature effect**: one per site, from
`fable-signature-effects`, pointer-fine only, and it goes into the `showpiece` tier's budget.

---

## 8. Showpiece extras

### Lenis, synced to ScrollTrigger

Lenis eases wheel scrolling so scrubbed scenes feel weighted. It is **not** scroll-jacking as
long as touch keeps native momentum and reduced motion keeps native scroll, which this leaf
enforces. Put it in the root layout as a sibling of `children`, add
`@import 'lenis/dist/lenis.css';` to `globals.css`, and mark any overlay that scrolls on
its own with `data-lenis-prevent`.

```tsx
'use client';

import { useEffect } from 'react';

/**
 * Showpiece tier only. Mouse and trackpad get eased scroll synced to
 * ScrollTrigger; touch keeps native momentum, reduced motion keeps native scroll.
 * Mark any overlay that scrolls on its own with data-lenis-prevent.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (
      !matchMedia('(prefers-reduced-motion: no-preference) and (pointer: fine)')
        .matches
    )
      return;
    let destroy: (() => void) | undefined;
    let cancelled = false;

    void Promise.all([
      import('lenis'),
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ autoRaf: false, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      destroy = () => {
        gsap.ticker.remove(tick);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return null;
}
```

Use Lenis, not ScrollSmoother: ScrollSmoother needs a fixed wrapper/content structure around
the whole page, which breaks `position: sticky` and puts a client wrapper around the layout.

### Route transitions

For multi-page sites, React's `<ViewTransition>` does route transitions with the browser's
View Transitions API: no library, and the page simply does not animate where it is
unsupported. Read `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` for the
shared-element morph (a work thumbnail becoming the case-study hero is the award-site
move). Do not drive route transitions with GSAP; it would have to fight the router for the
DOM.

### Layout changes with Flip

Filtering a work grid or expanding a card: put the final layout in CSS, capture
`Flip.getState()`, toggle the class, `Flip.from(state, { duration: 0.6, ease: 'expo.out' })`.
Add a scene or an effect that lists `'Flip'` in its `plugins` so the runtime loads it.

---

## 9. Performance contract

Measured with `gsap@3.15.0`, minified, gzip -9:

| Chunk                                              | Size    | Loaded                                 |
| -------------------------------------------------- | ------- | -------------------------------------- |
| `MotionScope`                                      | < 1 KB  | with the page                          |
| runtime (gsap core + ScrollTrigger + every effect) | 47.3 KB | on idle                                |
| SplitText                                          | 3.5 KB  | only if `lines`/`words` is on the page |
| DrawSVGPlugin                                      | 2.2 KB  | only if `draw` is on the page          |
| Flip                                               | 9.7 KB  | only if a scene asks                   |
| Lenis                                              | 5.5 KB  | showpiece only, on mount               |

Everything is off the critical rendering path, but it all still counts toward the brief's
`initial_load_kb`. Next 16 removed sizes from `next build` output, so measure the real
chunks yourself:

```sh
pnpm build
for f in .next/static/chunks/*.js; do printf '%7d %s\n' "$(brotli -c "$f" | wc -c)" "$f"; done | sort -n | tail -15
```

The rules the effects already obey, and new ones must too:

- **Only `transform` and `opacity`.** No `width/height/top/left/margin`, no `filter`, no
  `clip-path` on more than one element at a time, no `background-color` tweens (crossfade a
  second layer's opacity instead).
- **One ScrollTrigger per element, batched where possible.** `ScrollTrigger.batch` for
  reveals, not one trigger per card.
- **`scrub` is a number (0.5–1) on anything the eye tracks**; `scrub: true` only on parallax,
  where lag reads as float.
- **No permanent `will-change`.** GSAP applies transforms with `translate3d` while tweening.
- **Images inside pinned or horizontal sections have fixed aspect ratios** (`next/image`
  with `fill` in an aspect box), or ScrollTrigger measures before they decode and the pin
  ends in the wrong place.
- **`ignoreMobileResize: true`** so the phone address bar showing and hiding does not
  refresh every trigger.
- Holds 60fps at **6× CPU throttle on a 375px viewport** in the DevTools Performance panel,
  and no long task over 50ms when the runtime boots. If an effect fails that, it is cut.
- Profile motion by hand in DevTools. Automated browsers (`navigator.webdriver`) get the
  static page on purpose, so Playwright and screenshot runs never see it.

---

## 10. Accessibility contract

- **Reduced motion is a real design, not an off switch**: reveals become 0.3s fades, pins
  and horizontal tracks become their native markup, loops stop, the counter shows the
  number. Test with the OS setting on, not just the devtools emulation.
- Reveals use `opacity`, never `autoAlpha`: hidden-but-present links stay in the tab
  order, and focusing one scrolls it in, which triggers its reveal.
- Tabbing into a pinned horizontal track scrolls the page to that card (the `focusin`
  handler in `horizontal`).
- SplitText sets `aria-label` on split elements and hides the fragments by default; the
  server `SplitWords` does the same by hand with an `sr-only` copy.
- Nothing essential moves on its own for more than five seconds without a way to stop it
  (WCAG 2.2.2): marquees pause on hover and focus, or sit in a section with a pause
  control, and they stop under reduced motion.
- No motion carries meaning alone. A count-up is decoration on a number that is already
  true.

---

## Gate: motion

- [ ] `visual.motion.tier` picked from the brief; only that tier's packages installed.
- [ ] `motion-map.md` written before code; at most two loud scroll moments per page, none
      adjacent.
- [ ] `rg -l "'use client'" src/components/motion` returns `index.tsx` only.
- [ ] Scripts disabled: every section visible, every CTA works, horizontal is a scroll-snap
      rail, steps are a list, counters show the real numbers.
- [ ] OS reduced motion on: no pins, no horizontal track, no loops, content complete.
- [ ] Phone (375px, real device or true mobile viewport): no pin runs, rails swipe with native
      momentum, nothing overflows horizontally.
- [ ] `rg "gsap\.(to|from|fromTo|set)" src -A6 | rg "width|height|top|left|margin|filter|backgroundColor"`
      returns nothing.
- [ ] 60fps at 6× CPU throttle through every loud section; runtime boot under 50ms.
- [ ] Chunk sizes measured (brotli) and recorded in the commit body against the budget.
- [ ] Navigate away and back on a multi-page site: pins land in the right place, no
      duplicate pins (`document.querySelectorAll('.pin-spacer').length` in the console equals
      the number of pinned sections on the visible page).
- [ ] `fable-design-critique` run with the motion on; the motion rung of its ladder passes.
