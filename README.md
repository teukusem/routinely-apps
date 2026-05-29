# Expo Boilerplate

Small React Native boilerplate using Expo, TypeScript, and a lightweight `src/`
structure.

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
npm run doctor
```

## Structure

```text
src/
  components/  shared UI primitives
  screens/     app screens
  theme/       colors, spacing, and design tokens
```

Keep this boilerplate boring. Add navigation, data fetching, storage, analytics,
or native modules when the product needs them.
