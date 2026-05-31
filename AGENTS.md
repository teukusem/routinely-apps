# Agent Guide

Before planning or implementing product work, read the docs in [`docs/`](./docs/README.md). That folder is the source of truth for HabitFlow direction, scope, and constraints.

## Docs index

| Doc | Path | Read when |
| --- | --- | --- |
| Docs overview | [docs/README.md](./docs/README.md) | Starting any product or architecture task |
| Product PRD | [docs/product-prd.md](./docs/product-prd.md) | Defining scope, features, phases, or success metrics |
| Frontend spec | [docs/frontend-expo-react-native-spec.md](./docs/frontend-expo-react-native-spec.md) | Building screens, navigation, client state, or mobile behavior |
| Backend PRD | [docs/backend-prd.md](./docs/backend-prd.md) | Designing APIs, data models, jobs, sync, or server-side logic |
| Design system | [docs/design-system-ui.md](./docs/design-system-ui.md) | UI, tokens, components, layout, or interaction design |

## Product constraints

- HabitFlow is **Habitify-inspired**, not a clone. Do not copy Habitify branding, visual design, exact UX, copy, or commercial identity.
- Prefer the stack and patterns described in the docs unless the user explicitly chooses otherwise.
- Keep the Expo boilerplate boring until the product needs more complexity.

## Hard problems (prioritize correctness)

The hardest parts are not checklist UI. Treat these as first-class concerns:

- Recurrence rules
- Timezone-safe habit logs
- Notification reliability
- Analytics integrity
- Sync conflict handling across devices

When docs and code disagree, follow the docs unless the user directs a change. If you update behavior, suggest updating the relevant doc in the same change when appropriate.
