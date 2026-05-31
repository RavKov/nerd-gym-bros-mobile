# Nerd Gym Bros Mobile

[![CI](https://github.com/RavKov/nerd-gym-bros-mobile/actions/workflows/ci.yml/badge.svg)](https://github.com/RavKov/nerd-gym-bros-mobile/actions/workflows/ci.yml)

Mobile client for **Nerd Gym Bros**, an integrated gym and training management system (engineering thesis project). Built with **Expo SDK 54**, **React Native**, and **Expo Router**.

## Demo video

Overview of the full system (backend, admin panel, and mobile app):

https://www.youtube.com/watch?v=a2BepgsEpck

## Related repositories

| Component | Repository / path |
|-----------|-------------------|
| Backend API + admin | [nerd-gym-bros](https://github.com/RavKov/nerd-gym-bros) (Django) |
| Mobile app | this repo |

API integration details: [docs/API_INTEGRATION.md](docs/API_INTEGRATION.md).

## Requirements

- Node.js 20+
- Android Studio emulator (or physical device) for local development
- Running [nerd-gym-bros](https://github.com/RavKov/nerd-gym-bros) backend (`docker compose up`)

## Quick start (mobile)

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:

   - `EXPO_PUBLIC_API_BASE_URL` — backend URL. Use `http://10.0.2.2:8000` on the **Android emulator** (maps to host `localhost:8000`).
   - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key (test mode). Contact the author if you need working keys for thesis evaluation.

3. Install and run:

   ```bash
   npm install
   npx expo run:android
   ```

   For emulator setup issues, see [Expo: Android Studio emulator](https://docs.expo.dev/workflow/android-studio-emulator/).

4. Register a new account in the app. The email verification code is printed in the **Django server logs** after registration (not sent by real email in dev).

## Backend quick start

From the backend repository:

```bash
docker compose up --build
docker compose exec web bash -lc "/app/refresh_db.sh"
```

- Admin panel: http://127.0.0.1:8000  
- Default admin: `admin` / `admin`  
- OpenAPI schema: `/api/schema/` · Swagger UI: `/api/docs/`

## npm scripts

| Script | Description |
|--------|-------------|
| `npm start` | Expo dev server |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run lint` | ESLint (Expo config) |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run format` / `format:check` | Prettier |
| `npm test` / `test:ci` | Jest unit tests |

CI runs lint, typecheck, format check, and tests on push/PR to `main` / `master`.

## Project structure

```
src/
  app/              # Expo Router screens (auth, drawer, onboarding, workout flow)
  api/              # Backend HTTP functions (one module per domain)
  config/           # Axios client, JWT interceptors, env, auth helpers
  context/          # Auth + CMS content providers
  hooks/            # TanStack React Query hooks (useApiQueries)
  i18n/             # English UI copy catalog (CMS overrides via ContentContext)
  utils/            # Pagination, API errors, onboarding routing, media URLs
  validation/       # Client-side form validation
  types/            # Shared TypeScript models
```

## Features (mobile)

- JWT authentication with refresh token rotation and session expiry handling
- Onboarding: email verification → subscription (free or Stripe) → workout plan selection
- Active workout plan run with day/exercise/set logging
- Exercise catalog, gym finder (location + equipment filters)
- Bug reports and feature requests
- CMS-driven UI strings (`/api/mobile_app_content/`)

## License

See [LICENSE](LICENSE).
