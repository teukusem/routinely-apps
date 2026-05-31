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

```bash
npm install
npm run ios
```

If macOS is still pointed at Command Line Tools instead of full Xcode, use:

```bash
npm run ios:xcode
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
