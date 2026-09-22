# Implementation direction

## Supplied design reference

Reference: `~/projects/moku-project/Moku-iOS`. Inspected the actual theme,
page headers, home surfaces, feature layout, and an implemented settings screenshot.

- Background: `#080808`; surface: `#171717`; sage accent: `#7AAA7A`.
- Native system typography, semibold page titles around 19 points, and muted
  secondary text. Preserve text scaling and clear hierarchy.
- Rounded cards around 16 points, subtle borders, and restrained density.
- Compact centered headers, 44-point touch targets, and pill-shaped actions.
- Quiet transitions and feedback that respect Reduce Motion.
- Moku uses 10-point outer page padding and 24-point section spacing on Home.
  Adapt spacing for readable trivia questions rather than reproducing a screen.

The source is `Moku/Shared/Theme/NavigationStyle.swift`,
`Moku/Shared/Components/PageHeader.swift`, and
`Moku/Shared/Components/HomeSurface.swift` in that project.
Use its design language without adding Moku's multi-tab navigation to a one-game app.
No UI is implemented in this scaffold.

## Initial osu! data research

Reviewed the [official API v2 documentation](https://osu.ppy.sh/docs/index.html).
Public reads can use OAuth client credentials with the `public` scope. Keep
the secret in a future developer-side importer, never in the mobile app.
The documented ceiling is 60 requests/minute; caching is encouraged, and bulk
harvesting should use [official data dumps](https://data.ppy.sh/) instead.

`GET /beatmaps/{id}` and beatmapset metadata support textual trivia. Distinguish
individual difficulties from sets: BPM, length, and difficulty belong to maps;
ranked date and favourites belong to sets. Mapper questions must account for
multiple owners and guest difficulties. Reject missing data and tied answers.

Artist, ranked-date, BPM, and length questions are promising initial candidates.
Difficulty and popularity need a frozen snapshot and precise wording. Player
statistics are mode-dependent and change over time; defer those categories.
No dataset has been imported or verified yet.

Use a bundled snapshot first. Proposed challenge identity: UTC date + algorithm
version + dataset fingerprint. Store the generated questions and each answer
immediately. UTC gives everyone the same rollover; explain that in the eventual UI.

## Identity and assets

Follow the [official brand guidance](https://osu.ppy.sh/wiki/en/Brand_identity_guidelines):
keep `osu!` lowercase and identify this as an unofficial community project.
Use an original app identity. No official logo or third-party media has been copied.

The [copyright policy](https://osu.ppy.sh/legal/en/Copyright) is not a blanket
redistribution license for songs or beatmap artwork. API caching guidance likewise
does not establish redistribution rights for every asset. Start with structured
text and source attribution; review dataset terms before distributing a snapshot.
No general API-specific attribution mandate was identified in the reviewed API
documentation; retain provenance and recheck applicable terms before release.
