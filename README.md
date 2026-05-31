# Nerd Gym Bros Mobile

Aplikacja mobilna do mojego projektu inżynierskiego, którym jest **Zintegrowany system zarządzania treningiem**.

Projekt stworzony z użyciem frameworka React Native Expo.

## Prezentacja wideo

Dla jasnego zrozumienia całości systemu, proszę zapoznać się z poniższą prezentacją:

https://www.youtube.com/watch?v=a2BepgsEpck

## Uruchomienie Zintegrowanego systemu zarządzania treningiem

### Uruchomienie nerd-gym-bros (Backendu i panelu administracyjnego)

1.  Uruchom `docker compose up --build`
2.  Po pomyślnym uruchomieniu serwera Django oraz bazy PostgreSQL uruchom: `docker compose exec web bash -lc "/app/refresh_db.sh"` - migracje i wczytywanie danych z fixtures
3.  Dostęp do panelu administracyjnego w przeglądarce na adresie `127.0.0.1:8000`
4.  Domyślne dane logowania admina. Login: admin | Hasło: admin

### Uruchomienie nerd-gym-bros-mobile (aplikacji mobilnej)

1.  Wymagany emulator z Android Studio - ja użyłem Medium_Phone_API_36 (emulator version: 36.3.10-14472402)
2.  Eksport zmiennych (wybierz swoją lokalizację sdk):
    2.1. `export ANDROID_HOME=$HOME/Library/Android/sdk`
    2.2. `export PATH=$PATH:$ANDROID_HOME/emulator`
    2.3. `export PATH=$PATH:$ANDROID_HOME/platform-tools`
3.  Urucom `npm install`
4.  Uruchom `npx expo run:android`
5.  W razie problemów: https://docs.expo.dev/workflow/android-studio-emulator/
6.  Po pomyślnym uruchomieniu aplikacji należy zarejestrować się. Kod do weryfikacji utworzonego usera pojawi się w logach serwera django po pomyślnym utworzeniu konta.
7.  UWAGA! Na githubie nie dołączyłem .env z tokenami, więc proszę o kontakt w razie niedziałającej integracji z Stripe.
