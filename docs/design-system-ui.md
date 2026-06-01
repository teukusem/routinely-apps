# Design System UI

## Design Direction

Routinely uses a **neutral black** visual foundation: true-black depth,
charcoal cards, off-white typography, and restrained gray signals. It should
feel focused, premium, and crisp without becoming flat or visually noisy.

Keywords:

- Dark.
- Solid.
- High-contrast.
- Charcoal.
- Restrained.
- Clear.
- Fast.
- Rounded.
- Premium.

## Visual Principles

- The Today screen must be scannable in under three seconds.
- Completion should feel immediate and satisfying.
- Analytics should clarify behavior, not decorate the app.
- Mood and notes should feel private and quiet.
- The screen background uses the solid `background` token. Avoid wallpaper,
  gradients, and decorative glows behind content.
- Cards and navigation can use restrained frosted surfaces (`GlassSurface`) to
  preserve hierarchy without reducing text contrast.
- Avoid flat cream or white card stacks on dark backgrounds.
- Use cards only for repeated items, modals, and framed tools.
- Keep mobile tap targets large and predictable.

## Approved primitives

- A plain `View` using the solid `background` token for the full-bleed screen
  background.
- `expo-blur` `BlurView` for frosted surfaces (native); semi-opaque fallback on web.

## Color Tokens

Neutral-black palette (see [`src/theme/colors.ts`](../src/theme/colors.ts)).
App surfaces use black `#000000`, charcoal `#202020`, off-white `#F6F6F6`,
gray `#A6A6A6`, and transparent variants. Semantic roles remain named by
purpose, but use neutral tones so status never depends on hue alone.

```ts
export const colors = {
  background: '#000000',
  backgroundElevated: '#202020',
  glass: 'rgba(246, 246, 246, 0.14)',
  glassBorder: 'rgba(246, 246, 246, 0.36)',
  text: '#F6F6F6',
  textMuted: '#A6A6A6',
  primary: '#F6F6F6',
  primarySoft: 'rgba(246, 246, 246, 0.14)',
  success: '#F6F6F6',
  warning: '#D8D8D8',
  danger: '#F6F6F6',
  focus: '#D8D8D8',
  wellness: '#A6A6A6',
  onAccent: '#000000',
} as const;
```

Usage rules:

- Off-white primary is for main actions, active tabs, and key metrics.
- Translucent `*Soft` tokens are for badges and selected chip backgrounds.
- Off-white marks completion and positive momentum.
- Off-white marks overdue, attention, and destructive states. Pair these states
  with explicit labels because color is intentionally restrained.
- Gray supports secondary information, focus states, and wellness data. Pair
  semantic states with icons, text, or shapes because the palette is monochrome.

## Spacing Tokens

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;
```

Usage rules:

- Screen horizontal padding: `md` or `lg`.
- Card internal padding: `md`.
- Dense list gap: `sm`.
- Section gap: `lg`.

## Radius Tokens

```ts
export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;
```

Usage rules:

- Habit cards: `md`.
- Panels and cards: `lg`.
- Hero surfaces and bottom navigation: `xl`.
- Buttons: `lg` or `pill`.
- Pills and segmented controls: `pill`.
- Rounded should feel soft and premium, not bubbly or childish.

## Typography

Use system fonts.

Scale:

- Screen title: 28/34, weight 700.
- Section title: 18/24, weight 700.
- Card title: 16/22, weight 600.
- Body: 15/22, weight 400.
- Caption: 13/18, weight 500.
- Tiny label: 11/14, weight 600, uppercase only when useful.

Rules:

- No negative letter spacing.
- Do not scale font size with viewport width.
- Keep analytics labels short.
- Avoid paragraph-heavy UI.

## Core Components

### Button

Variants:

- Primary.
- Secondary.
- Ghost.
- Danger.
- Icon-only.

States:

- Default.
- Pressed.
- Disabled.
- Loading.

Rules:

- Use icons for common actions where obvious: add, edit, delete, close, back.
- Use text buttons only for clear commands.
- Minimum height: 44.

### Habit Card

Content:

- Habit name.
- Time or recurrence label.
- Goal progress.
- Current streak.
- Completion control.
- Overflow menu.

States:

- Upcoming.
- Due now.
- Completed.
- Overdue.
- Archived in management views.

Interaction:

- Tapping checkbox completes habit.
- Tapping card opens Habit Detail.
- Overflow opens edit/archive/delete actions.

### Completion Control

Variants:

- Checkbox.
- Count stepper.
- Duration timer.

Rules:

- Completion feedback should be instant.
- Uncomplete should be possible from Today.
- Count and duration controls must not resize the card when values change.

### Progress Ring / Bar

Use for:

- Daily completion summary.
- Challenge progress.
- Habit detail summary.

Rules:

- Must include text label.
- Color cannot be the only indicator.

### Calendar Heatmap

Use for:

- Monthly and yearly habit history.

Rules:

- Provide empty state.
- Provide legend.
- Tapping a day opens day detail.

### Mood Selector

Use:

- 1-5 scale with labels.

Rules:

- Make selected state obvious.
- Allow editing today's mood.
- Keep it optional and non-blocking.

### Segmented Control

Use for:

- Analytics ranges.
- Calendar filters.
- Habit goal type selection.

Rules:

- Stable height.
- Text must fit at small screen widths.

### Empty State

Rules:

- Explain the state in one short sentence.
- Provide one primary action.
- Avoid decorative illustration in early product unless it directly helps.

## Screen Composition

### Today

Layout:

1. Date and greeting.
2. Daily progress summary.
3. Chronological sections.
4. Floating or fixed Add Habit action.

Rules:

- First viewport should show at least one actionable habit when habits exist.
- Completed habits can collapse under a completed section.
- Empty state should point directly to habit creation.

### Add/Edit Habit

Layout:

1. Name field.
2. Goal type selector.
3. Frequency section.
4. Schedule section.
5. Reminder section.
6. Save button.

Rules:

- Progressive disclosure for advanced recurrence.
- Do not show irrelevant fields for selected goal type.

### Habit Detail

Layout:

1. Habit header.
2. Key metrics row.
3. Calendar/heatmap.
4. Trends.
5. Notes.
6. Management actions.

Rules:

- The first screen should explain current performance without scrolling.
- Destructive actions belong near the bottom or inside a menu.

### Analytics

Layout:

1. Date range selector.
2. Overall summary.
3. Habit rankings.
4. Weekday patterns.
5. Mood correlations.

Rules:

- Prefer plain labels over mysterious scores.
- Explain computed metrics in tooltips or detail screens.

## Motion And Feedback

- Complete action: instant state change with a checkmark and optional subtle fade.
- Screen transitions: native defaults.
- Loading skeletons for Today and Habit Detail.
- Avoid long celebratory animations for every completion.
- Use stronger celebration only for milestones.
- Respect Reduce Motion. Never use motion as the only way to communicate state.

## Accessibility Rules

- Target WCAG 2.2 Level AA as the product baseline.
- Default iOS touch target: 44 x 44 pt. Do not go below 28 x 28 pt.
- Keep visible text at 11 pt or larger. Support Dynamic Type and verify layouts
  with Larger Accessibility Text Sizes enabled.
- Small text needs at least 4.5:1 contrast. Large or bold text needs at least
  3:1. Meaningful non-text controls and boundaries need at least 3:1.
- Use dark `onAccent` content on bright custom accents. Primary reading text
  remains white on the solid dark background.
- Give interactive controls a useful accessibility label, role, and state.
- Never communicate state by color alone. Pair color with text, icons, shapes,
  or another persistent indicator.
- Destructive actions need explicit labels and confirmation.
- Charts need a visible text summary, visible values, and accessibility labels
  for individual data points.
- Progress bars need an accessibility label and numeric value.
- Status changes should remain visible and use polite announcements when they
  change without moving focus.
- For async work, render content or placeholders immediately. Use determinate
  progress when the duration is measurable and indeterminate progress when it
  is not. Never leave a blank screen while loading.

## Native Accessibility Verification

Before release, test the iOS build with Accessibility Inspector, VoiceOver,
Full Keyboard Access, Switch Control, Larger Accessibility Text Sizes, Bold
Text, Increase Contrast, and Reduce Motion. Web rendering and static checks
cannot certify native assistive-technology behavior.

## Glass surfaces

Use `GlassSurface` for habit cards, panels, metric tiles, floating bottom nav, and
screen heroes. Defaults:

### Bottom navigation

- Horizontal glass bar fixed to the **bottom** of the screen (full width with side margins).
- Use `variant="nav"` on the bottom bar for stronger frost (no heavy drop shadow).
- Active tab: filled white icon. Inactive tabs use white outline icons.

### Date selector (active day)

- Inactive days: uniform thin `glassBorder` on the glass pill.
- Active day: off-white label text with a charcoal selected fill.

### Glass variants (`GlassSurface`)

- `card` — single blur layer for heroes, metrics, and date pills.
- `panel` — light grouped container (no blur); holds list content.
- `nested` — no blur; subtle fill for rows, notes, filters, and habits inside panels.
- `nav` — bottom bar only.

Avoid nesting `card` inside `card` (double blur reads as black/muddy edges). Do not use drop shadows on cards.

### Glass defaults

- Blur intensity: ~36 (`src/theme/glass.ts`).
- Border: 1px `glassBorder`.
- Radius: `xl` for heroes and nav; `lg` for panels; `md` for habit rows.

## Design Debt To Avoid

- Putting every section inside a card.
- Nesting many blurred layers on one screen (performance).
- Hiding important actions behind gestures only.
- Building a beautiful dashboard before Today is fast.
- Using vague metrics that users cannot understand.
- Making mood tracking feel mandatory.
- Reverting to light cream surfaces that read as generic templates.
