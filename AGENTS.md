# Development Guidelines & Rules

## Version Management Rule
- **Mandatory Version Bump**: Whenever any code modification, bug fix, or feature enhancement is made, the assistant MUST automatically increment the version:
  1. In `/src/data.ts`: Bump `APP_VERSION` (e.g. `V.5.2` -> `V.5.3` -> `V.5.4` ...).
  2. In `/package.json`: Bump the semver `version` accordingly (e.g. `3.2.1` -> `3.2.2` ...).
- This ensures users and client browsers immediately receive fresh cache-busting and transparent update notifications.
