# Release checklist

Status on 2026-10-28: built on the local branch `website`, not pushed or
deployed. Lint, typecheck, tests and the production build pass locally.

## Owner steps

1. **Review and merge** the `website` branch, then push. CI runs on the push.
2. **Cloudflare account.** Run `npx wrangler@4 login`, then `npm run deploy`.
   The Worker is named `osu-daily` and serves `dist/` as static assets. The
   first deploy prints a `*.workers.dev` URL.
3. **Domain (optional).** Add the domain in Cloudflare, then uncomment the
   `routes` example in `wrangler.jsonc` and deploy again.
4. **Absolute share URLs.** Once the domain is known, change `og:image` and
   `twitter:image` in `index.html` to absolute URLs and add
   `<meta property="og:url" content="https://…/">`. Some link previews
   (Discord included) ignore relative image paths.
5. **Launch day.** Puzzle #1 is 2026-10-28 (`LAUNCH_DAY` in
   `src/shared/daily/day.ts`). To start numbering on the real launch date,
   change it before going public. Changing it later renumbers every puzzle and
   reshuffles the rotations, so pick it once.
6. **Data refresh (optional).** Create an osu! OAuth application (account
   settings, "OAuth" section), then run
   `OSU_CLIENT_ID=… OSU_CLIENT_SECRET=… npm run data:refresh`, optionally
   `-- --top 2`. Never commit the secret. The script was written against the
   API v2 docs but **has not been run** (no credentials were available).
   Check its output diff before committing.
7. **Lighthouse.** Run Lighthouse on the deployed URL in Chrome DevTools before
   quoting scores; it couldn't be run here.
8. **Deploy from CI (optional).** Add `CLOUDFLARE_API_TOKEN` and
   `CLOUDFLARE_ACCOUNT_ID` secrets and a deploy job using
   `cloudflare/wrangler-action@v3`, if you want main to deploy automatically.

## Decisions made while you were away

- **Stack:** React 19, TypeScript, Vite 7, Tailwind 4, Vitest. No router
  library: a 30-line History API router covers five routes.
- **Games:** Trivia, Backdrop (cover guess), Higher or Lower, Mapper. Mapper
  covers the "mapper or player" idea; players were left out because their
  stats are per-mode and change constantly.
- **Cloudflare:** Worker static assets (not Pages) with SPA fallback, so deep
  links like `/trivia/3` work. Wrangler isn't a dependency; the
  deploy script uses `npx wrangler@4` so installs and CI stay light.
- **Dataset:** 92 sets and 84 mappers, bootstrapped from public osu! pages
  through the same transform the API script uses. Song duplicates keep the
  most played set. Explicit sets are dropped.
- **Mapper answers** only come from hosts with at least 300 mapping
  subscribers (42 people), so the answer is usually someone players know. That
  gives 42 days before the rotation repeats; a data refresh with `--top`
  extends it.
- **Backdrop** uses the full-size background (`fullsize.jpg`) in a 16:9 frame;
  six tries, a hint per miss. Search hides artwork in suggestions so it can't
  give the answer away.
- **Trivia questions** are computed from data only, with minimum gaps between
  options so small data drift can't flip an answer. Hand-written facts were
  avoided.
- **Streaks** count days finished on the day itself. Archive plays are saved
  and appear in stats but don't extend streaks.
- **Day boundary:** UTC midnight for everyone. A game open at midnight keeps
  its puzzle until the page is reloaded.
- **Dark only.** The palette is dark-first; no light theme for v1.
- **Share text** uses coloured squares (the convention for daily games) and the
  site origin. The UI itself has no emoji.
- **Security headers:** `public/_headers` sets a CSP that allows images only
  from `assets.ppy.sh` and `a.ppy.sh`, plus long-lived caching for hashed
  assets.

## Verified here

- 796 Vitest tests: seeding and determinism, UTC rollover across time zones,
  puzzle validity for every day of a year, scoring, streaks, interrupted
  sessions, storage corruption, and the API transform.
- Played every game end to end in a browser at 375 px and desktop width; no
  console errors; no horizontal overflow at 375 px.
- axe-core: no violations on all routes and key states.
- Screenshots in `docs/screenshots/` (desktop at 1440 px, mobile at 375 px @2x).

## Not verified

- Lighthouse scores (no Chrome available to run it).
- The osu! API refresh script against the live API.
- Real link-preview rendering of the OG image.
- Behaviour on Safari iOS and Firefox (checked in Chromium and WebKit only).
