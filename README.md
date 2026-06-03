# Routinely

Routinely is a habit, mood, notes, reminder, and analytics tracker built with
Expo, React Native, and TypeScript. The current frontend is a portfolio-ready
product shell covering Dashboard, Habits, Mood, Notes, and Analytics from the
PRD.

## Frontend Milestone

This repository currently ships the frontend prototype. Habit logs, mood data,
analytics, and reminders use local mock-backed state so the mobile experience
can be reviewed before API integration. Backend persistence, authentication,
offline sync, and notification delivery are intentionally deferred.

## Requirements

- Node.js and npm
- Xcode from the App Store or Apple Developer site
- Xcode license accepted

## Run

Start the app locally with Expo Go:

```bash
npm install
npm run ios
```

For Android, create an emulator in Android Studio or connect a phone first:

```bash
npm run android
```

If Expo cannot resolve `api.expo.dev`, use the offline fallback:

```bash
npm run ios:offline
npm run android:offline
```

If macOS is still pointed at Command Line Tools instead of full Xcode, use:

```bash
npm run ios:xcode
```

Use the native build commands only when you specifically need a local native
build or a shareable Android APK:

```bash
npm run ios:native
npm run android:native
npm run android:apk
```

The Gradle APK is written to:

```text
android/app/build/outputs/apk/release/app-release.apk
```

The same command also copies a shareable APK to:

```text
dist/routinely-android-v1.0.0.apk
```

For a permanent Xcode setup:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license
```

## Useful Checks

```bash
npm run typecheck
npm test -- --runInBand
npm run doctor
```

## Structure

```text
src/
  components/  shared UI primitives
  screens/     app screens
  theme/       colors, spacing, and design tokens
```

Keep the Expo setup boring. Add navigation, data fetching, storage, analytics,
or native modules when the product needs them.
