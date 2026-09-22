# Project conventions

- Follow the feature-first Moku-iOS hierarchy documented in README.md.
- Use C# / .NET MAUI with MVVM. Place each view beside its view model under
  `OsuDaily/Features/<Feature>/`.
- Keep UI components in `Components`, business logic in `Domain`, and external
  data mapping/loading in `Data` within the owning feature.
- Use `Shared` only for code with a real shared responsibility.
- Prioritize readable names, small focused types, and short methods. Avoid
  giant view models and service classes. Around 500 lines in a file is a signal
  to review its responsibilities, not an exact maximum.
- Keep business logic independent of MAUI and API response objects.
- Do not introduce speculative interfaces, layers, games, or dependencies.
- The current scope is a directory scaffold. Do not expand into implementation
  without a user request.
- Do not install SDKs/workloads, restore packages, compile, or run builds/tests
  in this environment unless the user explicitly requests it. Windows build
  setup will be handled later.
- Use Moku-iOS as the supplied UI reference; see `docs/direction.md`.
- Trivia is the only MVP game. No accounts, backend, or extra product features.
