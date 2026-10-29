# Project conventions

- Keep README.md focused on this project. Never name or reference other apps
  used as internal design or architecture inspiration in the README.
- osu! daily is a static website: React + TypeScript + Vite, Tailwind CSS 4,
  Vitest. No backend, no accounts. Progress lives in localStorage.
- Follow the feature-first layout documented in README.md. Each game lives in
  `src/features/<game>/` with its page beside it, `components/` for UI used
  only by that game, and `domain/` for puzzle logic and its tests.
- Keep business logic in `domain/` modules that import nothing from React or
  the browser, and never from API response types. The dataset types in
  `src/shared/data/types.ts` are the boundary; `scripts/lib/transform.ts`
  maps osu! API objects onto them.
- Use `src/shared` only for code with a real shared responsibility (daily
  seeding, progress storage, guess-game rules, shared components).
- Prioritize readable names, small focused types, and short functions. Around
  500 lines in a file is a signal to review its responsibilities, not an exact
  maximum.
- Daily puzzles must stay deterministic: same UTC day, same puzzle for
  everyone. Changing the RNG, seeds or rotation salts changes every puzzle;
  the pinned snapshot in `random.test.ts` exists to catch that.
- Facts must be accurate. Prefer questions computed from dataset fields; do
  not add hand-written trivia without a source. Label values that drift
  (play counts, favourites, star ratings, follower counts) with the snapshot.
- Hot-link beatmap artwork from `assets.ppy.sh`; never commit it to the repo.
- Keep it clearly unofficial: no osu! logos or branding, keep the footer
  disclaimer.
- Do not introduce speculative interfaces, layers, games, or dependencies.
  New games need the owner's go-ahead.
- Design: dark-first, one type family (Outfit), pink accent, big touch
  targets, artwork over text. No emoji in UI copy, no gradient blobs. Respect
  reduced motion. See `docs/direction.md`.
- Before committing: `npm run lint`, `npm run typecheck`, `npm test`,
  `npm run build`. The dev server uses port 5205.
