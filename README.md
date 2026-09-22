# osu! Daily Games

A small, unofficial collection of daily osu! puzzles. The first game is Trivia:
five questions, immediate answer feedback, and a locally saved daily result.

**Current state:** folder scaffold only. No application, project files, dependencies,
or build configuration yet. Build setup is deferred to the Windows development
environment. C# and .NET MAUI remain the intended stack, with iOS as the primary
mobile platform.

## Structure

The project uses a feature-first layout. Views and view models will live
beside each other in their feature folder, not in global MVVM directories.

```text
OsuDaily/
  App/                       App entry point and dependency wiring
  Features/
    Trivia/                  TriviaView.xaml and TriviaViewModel.cs will live here
      Components/            Small UI pieces used only by Trivia
      Domain/                Questions, generation, daily state, and scoring
      Data/                  Fixture loading and Trivia-specific data mapping
  Shared/
    Components/              UI pieces actually shared between screens
    Theme/                   App colors, typography, and spacing
    Storage/                 Local persistence
  Resources/
    Raw/                     Bundled, versioned fixture data
  Platforms/
    iOS/                     MAUI platform entry point and iOS-specific behavior
Tests/
  Trivia/                    Game logic tests independent of MAUI
docs/
  direction.md               Design reference and initial data research
```

The empty folders are intentional placeholders. Add Android platform files when
needed; keep game logic and view models free of platform APIs. Do not add other
games or a shared game framework yet.

## Code conventions

- Keep each file focused on one responsibility. Prefer a few short, clearly named
  types over one large view model or service.
- Keep XAML views and their view models together. Code-behind handles only UI
  concerns; generators, scoring, and persistence do not belong there.
- Keep domain code independent of MAUI and external API response types so it can
  be tested without launching the app.
- Start with ordinary C# and built-in APIs. Add a dependency or interface only
  when it solves a concrete problem.
- Split files when responsibilities diverge; roughly 500 lines is a warning to
  reconsider the structure, not a target or a rigid limit.

## Next implementation slice

Build only launch → today's Trivia → five questions → feedback → results →
persisted completion. Use bundled fixtures without API credentials. Cover
determinism, valid choices, scoring, interrupted sessions, completion, and daily
rollover with focused tests when that logic exists.

Do not install toolchains, restore packages, or compile in this workspace unless
explicitly requested.
