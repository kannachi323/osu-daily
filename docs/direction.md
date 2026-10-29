# Direction

osu! daily started as a one-game .NET MAUI app plan. On 2026-10-28 the owner
switched it to a website: "the goal of osu-daily is to have nice fun mini games
for osu that me and others can play daily." Trivia stayed the first game;
Backdrop, Higher or Lower and Mapper joined it.

## Visual system

The bar is a modern, visual-led site with very little text and big,
satisfying controls.

- **Palette:** near-black ink `#0b0a0f`, surfaces `#15131b` / `#1e1b26`,
  hairline borders at 9% white, text `#f6f4f9`, muted `#a7a2b5`. Accent pink
  `#ff4f9a` (osu!-adjacent, not osu!'s own value) with dark ink text on it.
  Feedback: mint `#36d68f` for correct, coral `#ff6a5c` for wrong, always
  paired with a check or cross icon. Tokens live in `src/styles.css`.
- **Type:** one family, Inter (variable with optical sizes, self-hosted).
  Sentence case only: no all-caps labels, `uppercase`, small caps or tracked
  eyebrows. Tabular numerals for scores and countdowns. The scale, by role:

  | Role | Size | Weight |
  | --- | --- | --- |
  | Caption, label, footer | `text-sm` | regular / medium |
  | Body | `text-base` | regular |
  | Control (buttons, inputs, answers) | `text-lg` | medium / semibold |
  | Card title, clue value | `text-xl` | semibold |
  | Prompt, heading | `text-2xl`, `sm:text-3xl` | semibold |
  | Page title, tile name | `text-3xl` to `sm:text-5xl` | bold |
  | Score, stat value | `text-4xl` to `text-6xl` | bold |

  No arbitrary sizes (`text-[…]`), no `text-xs`, no extra-bold.
- **Spacing:** the 4 px grid, using steps 1, 2, 3, 4, 6, 8, 12 and 16
  (4–64 px). No half steps or 20/28 px. Cards pad 16 px on phones and 24 px
  from `sm`; stacked sections sit 24 px apart (`space-y-6`).
- **Shape:** radii are 12 px for thumbnails, 16 px for controls and list
  cards, 24 px for panels and artwork, full for pills. Buttons are 56–64 px
  tall; touch targets are at least 44 px.
- **Artwork first:** home tiles, Trivia subjects, Higher or Lower cards and
  Mapper clues show beatmap artwork under a dark scrim. Backdrop is built
  around the artwork itself.
- **Motion:** short rise and pop entrances, a shake on a wrong answer, and
  zoom-and-blur easing in Backdrop. `prefers-reduced-motion` cuts animation to
  near zero.
- **Avoid:** gradient blobs, emoji in UI copy, marketing copy, osu! logos or
  lookalike marks. The site mark is an original ring and dot.

An earlier native-iOS reference informed the restrained density, rounded
surfaces and quiet transitions; the web layout itself is new.

## Accessibility

- Keyboard play throughout, visible pink focus rings and a skip link.
- Answer feedback is announced through polite live regions.
- The answer search is an ARIA combobox with a listbox.
- axe-core 4 reported no WCAG 2.1 A/AA or best-practice violations on any
  route, including result screens, an answered question and the open search
  list (checked 2026-10-28, production build).
- No horizontal overflow at 375 px; layouts tested at 375 px and 1440 px.

## Data

- The bundled snapshot was bootstrapped from public osu! beatmapset and
  profile pages, using the same transform as the API refresh script. Sets were
  chosen as widely known ranked maps; a mirror's search only helped look up
  set IDs, and every stored value comes from osu! itself.
- Set-level vs difficulty-level fields: BPM, length and stars come from the
  hardest osu!standard difficulty; play count, favourites and ranked date
  belong to the set. Questions say "top difficulty" where it matters.
- Approved sets (pre-2014 status) are worded as "approved", not "ranked".
- Hosts use their current username; previous names are searchable in Mapper.
- Snapshot values (plays, favourites, stars, mapping subscribers) are labelled
  with the snapshot month or date wherever they are shown.
- Player statistics are left out: they are mode-dependent and change daily.

## Identity and assets

Following the [brand guidelines](https://osu.ppy.sh/wiki/en/Brand_identity_guidelines),
"osu!" stays lowercase and the site says it is an unofficial community project.
Artwork and avatars are referenced from osu!'s asset servers, never stored or
redistributed in this repo. The share image (`public/og.png`) is original and
contains no beatmap artwork.
