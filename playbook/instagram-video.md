# Instagram video on a client site

> One file, portable across projects. It carries the whole flow from "the client posts
> reels" to "the clips play on their website" — what to tell them to shoot, how to get a
> post onto the site, how to pull a real cover frame, and every trap that cost time the
> first time round.
>
> Built out of the Vianbella Salon & Spa build (ten clips). Every number here was
> measured, not estimated. Nothing in it is salon-specific.

## When this applies

A client with an active Instagram and no website is the normal case for this template.
They already have the single most persuasive asset available — video of the actual work,
in the actual room — and it is stranded on a platform that shows it to a few dozen
people. Putting it on the site is usually the highest-value hour of the build.

Reach for this when the brief mentions reels, video posts, "video evidence", or when the
content audit turns up a healthy video count against a low follower count. That gap is
the argument: the clips are good, the distribution is not.

**Do not reach for it to pad a thin site.** If the client has three blurry clips, a
gallery of stills is the better section. Ten clips is a rail; three is a mistake.

---

## Part 1 — What to tell the client, before they shoot

Give them this before the next batch, not after. It costs them nothing and it decides
whether the website section works.

> **The first frame of every clip becomes a picture on your website.** So start the
> video on something worth looking at — the finished work, or the room — and hold it
> still for a second before you move. If you start on a fast zoom or a whip, the website
> gets a blurred smudge as the preview and nobody taps it.

The rest, in order of how much it matters:

| Ask for                            | Why                                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| **A still opening second**         | It is the poster. Motion blur at 0:00 is the single most common unusable frame.       |
| **Vertical, filled edge to edge**  | Cards are 9:16. A landscape clip letterboxes into black bars on both sides.           |
| **The room in shot occasionally**  | A clip with the signboard or the floor visible is proof the place exists.             |
| **The doing, not just the reveal** | The gallery already shows finished work. Video's job is the part a photo cannot show. |
| **Daylight or the good lamp**      | Phone sensors are small. Dark clips compress badly and read as amateur.               |
| **Steady — elbow on something**    | No gimbal needed. A braced elbow beats handheld.                                      |

Two things worth saying plainly:

- **They do not need to shoot anything new.** Their back catalogue almost certainly has
  enough. This list is for the next batch, not a blocker on this one.
- **Trending audio is fine.** It travels with the embed and we do not touch it. It has no
  bearing on the site.

### What you actually need from them

A list of post links, nothing more. Either form works:

- The **embed code** — on the post, ⋯ → _Embed_ → _Copy embed code_. Long, ugly, fine.
- Or just the **post URL** — ⋯ → _Copy link_.

Ask for more than you need. Of ten clips, expect one or two to be unusable (bad opening
frame, wrong orientation, a style they no longer offer). Ask for twelve, ship ten.

---

## Part 2 — The data contract

One file holds the pastes. In the reference build it is `src/data/instagram-embeds.ts`.

```ts
const pasted: string[] = [
  `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/<code>/..."></blockquote>`,
  `https://www.instagram.com/reel/<code>/`, // a bare URL works too
];
```

A parser pulls `data-instgrm-permalink` out of a blockquote, or falls back to treating
the whole string as a URL, and derives:

| Field       | Value                                                 |
| ----------- | ----------------------------------------------------- |
| `shortcode` | `DdBqQLARV0b` — the key everything else references    |
| `kind`      | `reel`, `p` or `tv` — all three serve `/embed/`       |
| `permalink` | Canonical post URL, tracking query stripped           |
| `embedUrl`  | `https://www.instagram.com/<kind>/<shortcode>/embed/` |

Three rules that earned their place:

1. **A malformed paste throws at module load**, which fails the build. A clip that cannot
   resolve should stop the deploy, not ship a card that opens onto nothing.
2. **A blank entry is skipped, not thrown on.** Leaving trailing backticks in the array is
   a normal accident, not a bad paste. This distinction exists because it broke a build.
3. **A pasted clip with no card prints a build warning.** This is the one that actually
   bites: a paste parses, sits in the map, and renders nowhere. Ten pastes showing six
   cards is a silent failure unless something says so out loud.

> **Store the whole blockquote or just the URL — it does not matter.** Only
> `data-instgrm-permalink` is read. Everything else Instagram gives you is a loading
> skeleton their own `embed.js` throws away, and none of it reaches the browser.

### Never load `embed.js`

Its only job is to swap the blockquote for an iframe and negotiate the iframe's height
over `postMessage`. Render the iframe yourself and set the height from the model below.
That keeps a third-party script off a page that otherwise runs none.

---

## Part 3 — Do not put the embeds on the page

Measured on one Instagram embed, logged out:

| State                              | Weight      | Requests |
| ---------------------------------- | ----------- | -------- |
| Card rendered, nobody pressed play | **~1.3 MB** | 55       |
| After the video streams            | **~5.1 MB** | —        |

Ten of those on load is roughly **13 MB** against a typical **600 KB** budget, on a
target device that is a budget Android on metered data. It is not close.

**So the iframe mounts on tap.** Until someone presses a card, nothing is requested from
Meta, no Meta cookie is set, and the page weighs exactly what it weighed without the
section. The person who asked for the video pays for the video; nobody else does.

This also resolves the constraint most briefs carry ("reels linked not embedded"). The
constraint was written against a data budget, and on-tap loading honours the budget while
still playing the clip on the site rather than sending the visitor away.

### The frame height model

The embed is a cross-origin document with no intrinsic size, and without `embed.js` there
is no height handshake. Measured at 360px, 440px and 540px wide — the ratio held exactly:

```
height = (width × 1.25) + 208px
```

`width × 1.25` is the video box; `208px` is the header and action bar. Instagram's own
markup declares `min-width: 326px` and `max-width: 540px`, and below 326 its layout
breaks — which is why a clip opens in a dialog at a readable width rather than inside a
narrow rail card.

**Solve width from the height budget, do not cap height afterwards.** Capping clips
Instagram's own footer. Inverting the model picks the widest frame that still fits whole:

```css
--embed-h: 84svh;
--embed-w: clamp(
  20.375rem,
  min(92vw, (var(--embed-h) - 208px) / 1.25),
  33.75rem
);
width: var(--embed-w);
height: calc(var(--embed-w) * 1.25 + 208px);
```

---

## Part 4 — Cover frames

**The card's pre-play image must be the clip's own frame.** A borrowed still from the
feed sitting behind a play badge is a small lie, and on a site whose whole argument is
that the work is real, it is exactly the wrong one.

### Getting the frame

The cover URL is **not in the embed page's HTML** — Instagram fetches it client-side. A
`curl` of the page returns ~630 KB with zero `scontent` hits. This step needs a browser.

**Method A — the cover frame (default).** Open `/<kind>/<shortcode>/embed/` and read the
`poster` attribute off the `<video>` element. Take the uncapped `_e15_tt6` variant, not a
`p480x480` one. Its `efg` parameter base64-decodes to `video_default_cover_frame`, which
is how you confirm it is the real cover and not some other crop.

**Method B — any frame you want (when the cover is unusable).** Read `video.currentSrc`
for the `.mp4` URL and pull a frame with ffmpeg:

```sh
ffmpeg -ss 6.4 -i "<video url>" -frames:v 1 frame.png
```

Method B is strictly better whenever the opening frame is a blur or a transition, and it
is the only way to choose the moment. It also avoids a trap: screenshotting the paused
player bakes Instagram's white play triangle into the image, and hiding that overlay in
the DOM does not reliably reach it.

> **Copy those URLs mechanically, never by hand.** They are ~600 characters and signed
> across the whole query string. Dropping one parameter — `_nc_gid` is the easy one to
> lose — returns `403 URL signature mismatch`. Write them to a file from the browser and
> read the file.

They also carry an `oe` expiry, so they cannot be hot-linked. Download and commit the
file. That is also what keeps the promise that nothing loads from Meta until a tap.

### Encoding

Target the byte budget directly rather than guessing a quality number:

```sh
cwebp -mt -m 6 -size 72000 -resize 720 0 -resize_mode down_only \
  cover.jpg -o public/gallery/reel-<shortcode>.webp
```

- **`-size 72000`** lands under a typical 80 KB per-image budget. Ten clips came in at
  57–74 KB each.
- **`-resize 720 0`** is 2.5× a 288px card. Source covers arrive at 1290, 640 or 480 wide.
- **`-resize_mode down_only`** matters — several covers are natively 480 or 640 wide and
  upscaling buys nothing but bytes.
- **Name it for the short code.** `reel-<shortcode>.webp` makes it impossible for a frame
  and its clip to drift apart.

These are all below the fold and lazy, so they never touch the initial-load budget.

---

## Part 5 — Designing the section

### Label by what the clip shows, not by service category

The reference build started with one card per service, mirroring the menu. Then the
client sent ten clips and **eight of them were braiding**. Six cards reading "Hair" would
have said nothing, and four service cards would have stayed placeholders that only linked
out.

Labelling the style instead — _Knotless braids_, _Feed-in cornrows_, _Two ginger braids_ —
is more specific, lets every card play, and carries the phrases a customer would actually
search. Clips that are not styles get labelled honestly for what they are: _Men's
cornrows_, _Inside the salon_.

**Corollary: every card plays.** Make the short code required. A clip you cannot play does
not get a card, and a card never promises something it cannot do. Breadth of service is
the gallery's job, not this section's.

### A rail, not a grid

Vertical video is watched by swiping. Native `overflow-x` with CSS scroll-snap gives
momentum, keyboard scrolling and zero JavaScript, and it does not preload slides the way
a carousel does. Bleed it through the container gutter so the next card is always cut off
— that is the only affordance a rail needs.

Stagger the cards vertically with hand-set offsets and deliberate gaps in the sequence.
An every-other-card offset reads as a pattern, and a pattern reads as a grid again.

### Order for rhythm, not by date

Colour-heavy clips early. Break a long run of one subject with something different. End on
a card that is a destination rather than a clip — the feed, the profile — so the rail
stops on purpose instead of running out.

---

## Part 6 — Traps

Every one of these cost time. None are obvious.

| Trap                                                         | Fix                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Hand-copied CDN URL → `403 URL signature mismatch`           | Write URLs to a file from the browser; never retype.                                        |
| Cover URL absent from the embed page's HTML                  | It is fetched client-side. Use a browser, not `curl`.                                       |
| Screenshot of the paused player has a play triangle baked in | Use ffmpeg on the `.mp4` instead.                                                           |
| **Escape stops closing the dialog after the first play**     | Unfixable — see below. Make the close button the primary exit.                              |
| **`nth-child` stagger selects the wrong cards**              | Each card renders an `<a>` **and** a `<dialog>` as siblings. Use `nth-of-type`.             |
| Capping the frame's `max-height` clips Instagram's footer    | Solve width from the height budget instead.                                                 |
| Pasted clip renders nothing, silently                        | Warn at build time for any embed with no card.                                              |
| Trailing empty entry fails the build                         | Skip blank entries; only non-empty content must resolve.                                    |
| Two pastes of the same post                                  | Keyed by short code, so they dedupe silently. Usually what you want — know that it happens. |

### The Escape key, in detail

Once someone presses play, focus moves onto the `<iframe>`, and from then on the focused
document is Instagram's. Both a `document` keydown listener **and** the browser's own
modal close request are scoped to that document, so neither reaches your page. A native
`<dialog>` with `showModal()` fails here identically to a plain `div` with a listener —
measured both ways.

This is a cross-origin boundary, not a bug with a fix. So:

- The **close button is the primary exit** and gets a real 44px target.
- Escape and a backdrop click work up until the first press, and the button and backdrop
  still work after it.

Use a native `<dialog>` anyway — the top layer (no z-index contest with a fixed header or
a sticky booking bar), a real focus trap and `::backdrop` are all worth having. Just do
not claim it solves Escape.

### Unmount the iframe on close

Tearing the iframe down stops the video and ends Instagram's connections. Leaving a hidden
player mounted behind the page leaves it running.

---

## Part 7 — Privacy, and the thing you must not forget

**An Instagram embed sets Meta cookies and reports the view.** Confirmed in the network
log: `graph.instagram.com/logging_client_events` and `/ajax/bz` both fire on play.

If the footer says the site sets no cookies, **that line becomes false the moment someone
taps a clip.** Rewrite it in the same commit as the player. On the reference build:

> This site sets no cookies of its own and collects no personal data. Tap a clip and that
> one video loads from Instagram, which sets Meta's cookies — nothing reaches them before
> you tap. Booking happens in WhatsApp.

The "nothing before you tap" clause is a genuine differentiator worth stating plainly.
Competitor audits routinely turn up sites loading Meta and Google tags on arrival with no
consent mechanism at all — in Nigeria that is NDPA exposure, and in the EU it is worse.

**If the client later adds GTM or Analytics**, the on-tap decision does not change — 13 MB
is a data problem, not a cookie problem — but the footer line and a consent gate both
become required. Build the consent gate _with_ the tags, not before: Consent Mode v2 needs
the default-denied signal set before the tag loads, and a banner storing a choice nothing
reads yet is half a feature.

---

## Part 8 — Voice

Write every rendered string in **first person plural**. The site is the client speaking to
their customer, not an agency describing a third party.

> "**We** film them on the floor at 74 Gado Nasko Road." — not "she films them"
> "**Our** whole feed" — not "her whole feed"
> "filmed under **our** own signboard" — not "her own signboard"

This extends to alt text, which is rendered: "in **our** salon", not "in the salon". And
where a photographed customer's pronouns are not known, use _their_.

Code comments about the client are the one exception — those are notes to a developer, not
the site's voice.

---

## Checklist

Per clip:

- [ ] Paste the blockquote or URL into the embeds file.
- [ ] Watch it. Decide what it actually shows.
- [ ] Write a style label and a caption true to the frame. No generic fallbacks.
- [ ] Pull the cover frame — Method A, or Method B if the opening second is unusable.
- [ ] Encode to `reel-<shortcode>.webp` under the image budget.
- [ ] Wire short code, caption, label and poster into the rail's data.

Per section, before shipping:

- [ ] Every card plays. No placeholders behind a play badge.
- [ ] Idle page loads **zero** iframes, zero `cdninstagram`, zero `embed.js`.
- [ ] The dialog fits the viewport whole at 390px and at 1440px, nothing clipped.
- [ ] Close button, backdrop click and Escape-before-play all close it and unmount the iframe.
- [ ] Focus returns to the card that was tapped.
- [ ] Stagger offsets measure what you set them to (check `nth-of-type`).
- [ ] Footer privacy line matches what the page actually does.
- [ ] No third-person references to the client in any rendered string.
- [ ] Build prints no unwired-clip warning.
