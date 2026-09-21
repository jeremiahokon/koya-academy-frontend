# Google Business Profile: a standing recommendation

> Standard advice for every local-business client. Free, takes an afternoon, and for a
> business with one physical location it is usually worth more than anything else we
> build. It belongs in the first conversation, not the last.

## The short version, for the client

> Before we talk about your website, set up your Google Business Profile — or if you
> already have one, claim it and check the website link. It is free. It is what puts you
> in the map box at the top of Google when someone nearby searches for what you do. Your
> website's job is to be the place that box sends people. One without the other is half
> a job.

## Why it works

Google does not rank local results the way it ranks ordinary pages. Its own published
guidance names three factors:

| Factor         | What it means                             | Can we influence it?                                      |
| -------------- | ----------------------------------------- | --------------------------------------------------------- |
| **Relevance**  | How well the profile matches the search   | **Yes.** Category, services, description, attributes.     |
| **Distance**   | How far the business is from the searcher | Only by getting the map pin exactly right.                |
| **Prominence** | How well known the business is            | **Yes.** Reviews, and a real web presence pointing at it. |

The profile is what Google reads for all three. A website alone does not put a business
in the map box; the profile does, and the website makes the profile's claim credible.

Two things worth saying plainly to a client who is sceptical:

- **The map box sits above the ordinary results.** Ranking first in the blue links below
  it is worth less than appearing in the box.
- **Reviews are a ranking input, not just decoration.** Google states review count and
  score feed prominence. This is the honest argument for asking happy customers to leave
  one, and it is why we never fake them.

No invented statistics in this document, and none in the pitch either. If a client asks
"by how much", the honest answer is that it varies by category and density and nobody
outside Google can tell them a number.

## The order to do it in

1. **Search for the business first.** Do not create a profile before checking. Google
   auto-generates listings from other data sources, so a business that has never touched
   Google often already has one — sometimes with reviews, sometimes with a wrong address.
   Creating a second one causes a duplicate, which is slower to fix than claiming.
2. **Claim and verify it.** Unclaimed profiles can be edited by members of the public and
   by Google's own suggested edits. Verification is by video, phone, email or postcard
   depending on category and country, and it can take days, so start it early.
3. **Check the website field.** See the trap below.
4. **Fill it out completely.** Primary category first — it carries the most weight —
   then services, hours including any odd day, attributes, and real photos.
5. **Match the name, address and phone to the website, character for character.** Same
   spelling, same abbreviations. Inconsistent details across the web read as a different
   business.
6. **Point the profile at the new site the day it launches.**

## The `.business.site` trap

Check this on every client who has had a profile for more than two years.

Google used to give every profile a free one-page website on a `yourbusiness.business.site`
address. **Those were shut down in March 2024.** They redirected to the owner's profile
until 10 June 2024, and after that they return "page not found".

So a long-standing profile may still list a website URL that has been dead for over a
year. Every person who found the business on Google, wanted to know more and tapped
**Website** hit an error page — and the owner has no way of knowing it is happening.

It is a thirty-second check and it is often the single highest-value thing we do for a
client all project.

## What this means for how we build

The site and the profile should agree, because Google is reading both and cross-checking:

- **`LocalBusiness` JSON-LD** carrying the same address, coordinates, phone, hours and
  services as the profile.
- **The name spelled identically** in the title tag, the visible header, the JSON-LD and
  the profile.
- **`sitemap.xml` and `robots.txt`**, so the site the profile points at is trivially
  crawlable.
- **The real address and day-by-day hours in visible text**, not only in markup.
- **No `aggregateRating` in our own JSON-LD.** Google treats a business marking up
  ratings about itself as self-serving and ignores it — and for reviews left on Google,
  Google already has them. Show the rating on the page next to a link to the listing
  instead.

## Where it sits commercially

Free to the client, and we should say so rather than bundling it invisibly. Two honest
ways to position it:

- **Included.** We set it up as part of the launch. Costs an hour, and it makes the site
  we just built measurably more effective, which is what gets us referred.
- **Handed over.** We give them this page, they do it themselves. Fine for a client who
  wants to own it, as long as someone actually checks the website field afterwards.

What we should never do is charge for it as though it were a build item, or imply it is
something only we can do. It is free and public, the client will eventually find that
out, and being the person who told them first is worth more than the fee.

## Checklist

- [ ] Searched Google and Maps for an existing or auto-generated profile
- [ ] Profile claimed, verification started
- [ ] **Website field checked — not a dead `.business.site` URL**
- [ ] Primary category correct; secondary categories added
- [ ] All services listed
- [ ] Hours complete, including days that differ
- [ ] Attributes set (accessibility, ownership, payment methods)
- [ ] Real photos: exterior, interior, work, team
- [ ] Name, address and phone match the website exactly
- [ ] Profile repointed at the new site on launch day
- [ ] Owner shown how to ask for reviews, and told never to buy them
