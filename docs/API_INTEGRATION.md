# API integration guide (mobile client)

This document describes how **nerd-gym-bros-mobile** talks to the Django REST API in [nerd-gym-bros](https://github.com/RavKov/nerd-gym-bros). For the authoritative contract, use the backend OpenAPI schema at `/api/schema/` and Swagger UI at `/api/docs/` when the server is running.

## Configuration

| Variable                             | Purpose                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`           | API origin without trailing slash (default `http://10.0.2.2:8000` for Android emulator) |
| `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for `@stripe/stripe-react-native`                                |

Defined in `src/config/env.ts`, loaded from `.env` (see `.env.example`).

## HTTP client stack

```
Screen / hook
    → src/api/<domain>.ts     (request functions)
    → src/api/client.ts       (re-exports axios instance)
    → src/config/api.ts       (axios + interceptors)
```

### Authentication

1. **Login** (`src/config/authService.ts`): `POST /api/auth/token/` → stores `access` and `refresh` in Expo Secure Store.
2. **Requests**: interceptor adds `Authorization: Bearer <access>`.
3. **401 handling**: one retry after `POST /api/auth/token/refresh/` with the stored refresh token. The backend may return a **rotated** refresh token; both tokens are persisted.
4. **Refresh failure or repeated 401**: tokens cleared, `notifySessionExpired()` → `AuthContext` logs the user out and React Query cache is cleared.

Login and refresh use plain `axios` against `API_BASE_URL` so they do not recurse through the response interceptor.

### Pagination

List endpoints use Django REST Framework pagination:

```json
{ "count": 42, "next": "http://host/api/items/?page=2", "previous": null, "results": [ ... ] }
```

The mobile app uses `fetchAllPages()` in `src/utils/pagination.ts` to follow `next` until all pages are loaded (no “load more” UI). Legacy non-paginated array responses are still supported.

Paginated list calls in this repo:

| Endpoint                   | API function             |
| -------------------------- | ------------------------ |
| `/api/exercises/`          | `fetchExercises`         |
| `/api/workout_plans/`      | `fetchWorkoutPlans`      |
| `/api/subscription_plans/` | `fetchSubscriptionPlans` |
| `/api/gyms/`               | `fetchGyms`              |
| `/api/equipments/`         | `fetchEquipments`        |

### Media URLs

Backend returns relative paths (e.g. `/media/thumbnails/...`). `getMediaUrl()` in `src/utils/getMediaUrl.ts` prefixes `API_BASE_URL` for `Image` and `expo-video` sources.

### Errors

- `parseApiErrorMessage()` / `getErrorMessage()` in `src/utils/apiErrors.ts` normalize DRF `detail`, `message`, and field errors.
- `alertAxiosError()` shows a native alert (used after mutations).
- Query screens use `QueryStateView` for load/error/retry states.

## Server state (TanStack Query)

`src/hooks/useApiQueries.ts` wraps API functions with React Query. Key query keys:

| Key                                       | Data                                               |
| ----------------------------------------- | -------------------------------------------------- |
| `profile`                                 | `GET /api/me/detail/`                              |
| `workoutPlanRun`                          | `GET /api/me/workout_plan_run/` (404/401 → `null`) |
| `exercises`, `exercise(id)`               | Exercise catalog                                   |
| `workoutPlans`                            | Available plans                                    |
| `subscriptionPlans`, `subscription`       | Plans and current subscription                     |
| `gyms`, `equipments`                      | Gym finder                                         |
| `content`                                 | CMS strings                                        |
| `workoutDayLog(id)`, `workoutItemLog(id)` | Active workout screens                             |

`AuthContext` invalidates `profile` and `workoutPlanRun` on login, logout, and session refresh.

## Endpoint map (mobile usage)

All paths are relative to `EXPO_PUBLIC_API_BASE_URL`. Methods reflect what the mobile app calls.

### Auth & registration

| Method | Path                       | Mobile module        | Notes                                                            |
| ------ | -------------------------- | -------------------- | ---------------------------------------------------------------- |
| POST   | `/api/auth/token/`         | `authService.login`  | Body: `username`, `password`                                     |
| POST   | `/api/auth/token/refresh/` | `api.ts` interceptor | Body: `refresh`; may return new `refresh`                        |
| POST   | `/api/register/`           | `auth.registerUser`  | Body: `username`, `email`, `first_name`, `last_name`, `password` |

### Profile & verification

| Method | Path                           | Mobile module                | Notes                                                                        |
| ------ | ------------------------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| GET    | `/api/me/detail/`              | `profile.fetchClientProfile` | `ClientProfile` incl. `verified`, `subscription_plan`, `active_workout_plan` |
| POST   | `/api/me/verify/`              | `profile.verifyAccount`      | Body: `email`, `code` (6 digits)                                             |
| POST   | `/api/me/resend_verification/` | `profile.resendVerification` | Body: `email`                                                                |

### Subscriptions & Stripe

| Method | Path                                | Mobile module                              | Notes                                                                          |
| ------ | ----------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| GET    | `/api/subscription_plans/`          | `subscriptions.fetchSubscriptionPlans`     | Paginated                                                                      |
| GET    | `/api/me/subscription/`             | `subscriptions.fetchCurrentSubscription`   | 404 → no subscription                                                          |
| POST   | `/api/me/subscription_plan/choose/` | `subscriptions.chooseFreeSubscriptionPlan` | Free plans only; paid plans return 400                                         |
| POST   | `/api/create_subscription_sheet/`   | `subscriptions.createSubscriptionSheet`    | Returns Stripe PaymentIntent client secret (+ optional customer/ephemeral key) |
| POST   | `/api/cancel_subscription/`         | `subscriptions.cancelSubscription`         |                                                                                |

**Paid plan flow (mobile):**

1. `createSubscriptionSheet(planId)` → initialize Stripe Payment Sheet.
2. User completes payment in the sheet.
3. Backend activates subscription via **Stripe webhook** (not via `choose` after payment).
4. Mobile polls `fetchClientProfile()` in `waitForSubscriptionPlan()` until `subscription_plan` matches (or times out).

### Workout plans & runs

| Method | Path                            | Mobile module                     | Notes                                                           |
| ------ | ------------------------------- | --------------------------------- | --------------------------------------------------------------- |
| GET    | `/api/workout_plans/`           | `workouts.fetchWorkoutPlans`      | Paginated                                                       |
| POST   | `/api/me/workout_plan/`         | `workouts.chooseWorkoutPlan`      | Body: `workout_plan_id`; resets progress                        |
| GET    | `/api/me/workout_plan_run/`     | `workouts.fetchWorkoutPlanRun`    | Active run; day logs sorted by `workout_day_order_number` in UI |
| PATCH  | `/api/me/workout_plan_run/`     | `workouts.finalizeWorkoutPlanRun` | Body: `finished_at`, `is_active: false`                         |
| GET    | `/api/me/workout_day_log/:id/`  | `workouts.fetchWorkoutDayLog`     | Day with item logs                                              |
| PATCH  | `/api/me/workout_day_log/:id/`  | `workouts.completeWorkoutDay`     | Body: `completed: true`                                         |
| GET    | `/api/me/workout_item_log/:id/` | `workouts.fetchWorkoutItemLog`    | Sets + exercise                                                 |
| PATCH  | `/api/me/workout_item_log/:id/` | `workouts.completeWorkoutItem`    | Body: `completed: true`                                         |
| PATCH  | `/api/me/set_log/:id/`          | `workouts.updateSetLog`           | Body: `actual_amount` (number or null)                          |

### Catalog & gyms

| Method | Path                  | Mobile module              | Notes                          |
| ------ | --------------------- | -------------------------- | ------------------------------ |
| GET    | `/api/exercises/`     | `exercises.fetchExercises` | Paginated                      |
| GET    | `/api/exercises/:id/` | `exercises.fetchExercise`  | Detail + video                 |
| GET    | `/api/gyms/`          | `gyms.fetchGyms`           | Paginated                      |
| GET    | `/api/equipments/`    | `gyms.fetchEquipments`     | Paginated; used as gym filters |

### CMS content

| Method | Path                       | Mobile module                   | Notes                                                                       |
| ------ | -------------------------- | ------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/mobile_app_content/` | `content.fetchMobileAppContent` | Paginated or array; normalized to `{ code, text }` map via `ContentContext` |

### Feedback

| Method | Path                           | Mobile module                   | Notes                                       |
| ------ | ------------------------------ | ------------------------------- | ------------------------------------------- |
| POST   | `/api/create_bug_report/`      | `feedback.createBugReport`      | `multipart/form-data` (optional screenshot) |
| POST   | `/api/create_feature_request/` | `feedback.createFeatureRequest` | JSON: `title`, `description`                |

## Onboarding routing

After login, the home screen (`src/app/(protected)/(drawer)/index.tsx`) uses `getOnboardingRedirectPath()` from `src/utils/onboarding.ts`:

1. Not verified → `/(protected)/(onboarding)/verify_account`
2. No `subscription_plan` → `choose_subscription`
3. No `active_workout_plan` → `choose_workout_plan`
4. Otherwise → main drawer (workout progress)

Protected routes are gated by `Stack.Protected` in `src/app/_layout.tsx` using `isAuthenticated` from `AuthContext`.

## Types

Shared response shapes live under `src/types/`:

- `clientProfile.ts` — user profile / onboarding flags
- `subscriptionPlan.ts` — plans and Stripe fields
- `workoutPlan.ts`, `workoutPlanRun.ts` — plans and active run logs

Keep these aligned with backend serializers when the API changes.

## Local development tips

| Issue                     | Suggestion                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| Network error on emulator | Use `10.0.2.2` instead of `localhost` in `EXPO_PUBLIC_API_BASE_URL`                      |
| 401 after idle            | Refresh rotation or re-login; check backend JWT settings                                 |
| Paid subscription stuck   | Confirm Stripe webhook is configured on backend; watch `waitForSubscriptionPlan` timeout |
| HTML error body           | Usually wrong base URL or Django debug page; `parseApiErrorMessage` detects HTML         |
| Verification code         | Check Django container logs after `POST /api/register/`                                  |

## Further reading

- Backend README and architecture: nerd-gym-bros repository
- Mobile modernization phases (local notes only): not committed to this repo by default
