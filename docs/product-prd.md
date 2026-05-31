# Frontend PRD

## Product: Routinely — Habit, Mood, Notes & Reminder Tracker

## 1. Frontend Scope

The frontend is responsible for the user experience, interface, client-side state management, form validation, navigation, optimistic updates, loading states, error handling, and displaying data from the backend.

The frontend should not own critical business logic such as streak calculation, reminder eligibility, habit schedule calculation, or analytics aggregation. Those must come from the backend.

---

## 2. Frontend Goals

### User Goals

* User can clearly see today’s habits.
* User can complete habits quickly.
* User can create and manage habits.
* User can log mood.
* User can write notes.
* User can configure reminders.
* User can see basic progress analytics.

### Engineering Goals

* Build reusable UI components.
* Keep pages clean and maintainable.
* Use strong TypeScript types.
* Handle loading, empty, error, and success states properly.
* Use server-provided data instead of recalculating business logic on the client.
* Make the UI responsive for mobile and desktop.

---

## 3. Recommended Frontend Stack

```txt
Next.js
React
TypeScript
Tailwind CSS
TanStack Query
Zustand
React Hook Form
Zod
date-fns or Luxon
Recharts
```

---

## 4. Main Navigation

The app should have 5 main menus.

```txt
Dashboard
Habits
Mood
Notes
Analytics
```

Secondary menu:

```txt
Settings
Profile
Notification Preferences
Logout
```

Settings should be placed under avatar/profile, not as a main menu.

---

# 5. Pages & Screens

---

## 5.1 Authentication Pages

### Screens

* Login page
* Register page
* Forgot password page
* Reset password page

### Requirements

* User can register.
* User can log in.
* User can log out.
* User can reset password.
* Form validation must happen before API request.
* API errors must be displayed clearly.

### Frontend Validation

Register form:

```txt
name: required
email: required, valid email
password: required, minimum 8 characters
confirmPassword: must match password
```

Login form:

```txt
email: required, valid email
password: required
```

### Acceptance Criteria

* Invalid form shows inline errors.
* Loading state appears during submission.
* User is redirected to Dashboard after successful login.
* Authenticated routes cannot be accessed by unauthenticated users.
* Unauthenticated users are redirected to Login.

---

## 5.2 Dashboard Page

### Purpose

The Dashboard answers:

```txt
"What do I need to do today?"
```

### Components

* Date selector
* Daily progress card
* Habit list grouped by time period
* Habit check-in button
* Mood card
* Notes preview
* Upcoming reminders
* Missed habits section

### Requirements

* Show today’s data by default.
* User can change selected date.
* User can complete habit.
* User can undo habit completion.
* User can open habit detail.
* User can log mood from dashboard.
* User can add note from dashboard.
* User can see reminder time.
* User can see current streak.

### Data Source

```txt
GET /dashboard?date=YYYY-MM-DD
```

### Acceptance Criteria

* Dashboard displays server-provided scheduled habits.
* Check-in uses optimistic UI.
* If check-in fails, UI rolls back.
* Empty state appears if no habits exist.
* Loading skeleton appears while fetching data.
* Error state appears if dashboard API fails.

---

## 5.3 Habits Page

### Purpose

The Habits page is for managing routines.

### Components

* Habit list
* Habit filter
* Create habit button
* Habit card
* Archive action
* Empty state

### Requirements

* User can view active habits.
* User can filter by category/status.
* User can create habit.
* User can edit habit.
* User can archive habit.
* User can delete habit.
* User can open habit detail.

### Data Source

```txt
GET /habits
POST /habits
PATCH /habits/:habitId
DELETE /habits/:habitId
POST /habits/:habitId/archive
```

### Acceptance Criteria

* Habit list loads correctly.
* New habit appears after creation.
* Edited habit updates UI.
* Archived habit disappears from active list.
* Delete action requires confirmation modal.

---

## 5.4 Create/Edit Habit Page or Modal

### Fields

* Habit name
* Description
* Category
* Icon
* Color
* Frequency
* Goal type
* Target value
* Unit
* Start date
* End date
* Reminder enabled
* Reminder time

### Requirements

* User can create checkbox habit.
* User can create numeric habit.
* User can create duration habit.
* User can choose frequency.
* User can enable reminder.
* User can set reminder time.
* User can save habit.

### Frontend Validation

```txt
name: required
frequencyType: required
goalType: required
targetValue: required for numeric/duration habits
startDate: required
reminderTime: required if reminder is enabled
```

### Acceptance Criteria

* Invalid fields show error messages.
* Submit button is disabled during submission.
* User is redirected to habit detail or habits page after save.
* Reminder fields are hidden unless reminder is enabled.
* Numeric/duration fields appear only for relevant goal types.

---

## 5.5 Habit Detail Page

### Purpose

Shows specific habit information and history.

### Components

* Habit overview
* Current streak
* Longest streak
* Completion rate
* Habit history
* Notes linked to habit
* Reminder settings
* Edit button
* Archive/delete actions

### Requirements

* User can view habit details.
* User can edit habit.
* User can see habit check-in history.
* User can see habit-specific notes.
* User can update reminder settings.

### Data Source

```txt
GET /habits/:habitId
GET /analytics/habits/:habitId
GET /notes?habitId=HABIT_ID
```

### Acceptance Criteria

* Habit data loads correctly.
* Habit notes display correctly.
* Reminder settings are editable.
* Archive/delete actions show confirmation.

---

## 5.6 Mood Page

### Purpose

The Mood page helps users track emotional state over time.

### Components

* Today mood form
* Mood history list
* Mood trend chart
* Energy level input
* Stress level input

### Fields

* Mood score
* Mood label
* Energy level
* Stress level
* Note

### Requirements

* User can create today’s mood log.
* User can edit today’s mood log.
* User can delete mood log.
* User can view mood history.
* User can see simple mood trend.

### Data Source

```txt
GET /mood-logs
POST /mood-logs
PATCH /mood-logs/:moodLogId
DELETE /mood-logs/:moodLogId
GET /analytics/mood
```

### Acceptance Criteria

* User cannot create duplicate mood log for same date.
* If today’s mood exists, form becomes edit mode.
* Mood chart updates after changes.
* Empty state appears if no mood logs exist.

---

## 5.7 Notes Page

### Purpose

The Notes page is for reflection, journaling, and habit-related notes.

### Components

* Notes list
* Search input
* Date filter
* Create note button
* Note editor
* Note detail
* Linked habit indicator

### Requirements

* User can create note.
* User can edit note.
* User can delete note.
* User can search notes.
* User can filter notes by date.
* User can link note to habit, check-in, or mood log.

### Data Source

```txt
GET /notes
GET /notes?date=YYYY-MM-DD
GET /notes?habitId=HABIT_ID
POST /notes
PATCH /notes/:noteId
DELETE /notes/:noteId
```

### Acceptance Criteria

* Empty notes cannot be saved.
* Search returns matching notes.
* Deleted notes disappear from UI.
* Note editor handles autosave later, but not required for MVP.

---

## 5.8 Analytics Page

### Purpose

Analytics helps users understand progress.

### Components

* Completion rate card
* Current streak card
* Longest streak card
* Weekly completion chart
* Mood trend chart
* Habit category chart
* Date range filter

### Requirements

* User can see overview analytics.
* User can filter by date range.
* User can see habit completion trend.
* User can see mood trend.
* User can see basic habit performance.

### Data Source

```txt
GET /analytics/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /analytics/mood?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /analytics/streaks
```

### Acceptance Criteria

* Charts render correctly.
* Loading state appears while data loads.
* Empty state appears if not enough data exists.
* Analytics should not calculate critical backend-owned values on frontend.

---

## 5.9 Settings Page

### Components

* Profile settings
* Timezone settings
* Notification preferences
* Logout button

### Requirements

* User can view profile.
* User can update timezone.
* User can manage notification preference.
* User can log out.

### Acceptance Criteria

* Timezone update affects future dashboard/reminder calculations.
* Notification preference updates correctly.
* Logout clears client auth state.

---

# 6. Frontend State Management

## 6.1 Server State

Use TanStack Query for:

* User session
* Dashboard data
* Habit list
* Habit detail
* Check-ins
* Mood logs
* Notes
* Analytics
* Reminders

## 6.2 Client/UI State

Use Zustand or local component state for:

* Sidebar open/closed
* Selected dashboard date
* Modal state
* Toast state
* Temporary form state
* Theme preference

---

# 7. Frontend Error Handling

Every page must handle:

* Loading state
* Empty state
* Error state
* Unauthorized state
* Validation error
* Network error

Bad pattern:

```txt
Only showing blank screen while data loads.
```

Better pattern:

```txt
Skeleton → Data / Empty State / Error State
```

---

# 8. Frontend Acceptance Criteria

The frontend MVP is considered complete when:

* User can register and log in.
* User can create habits.
* User can view today dashboard.
* User can complete habits.
* User can undo check-ins.
* User can log mood.
* User can create notes.
* User can configure reminders.
* User can view basic analytics.
* UI works on mobile and desktop.
* Forms have validation.
* Errors are handled properly.
* Optimistic UI works for check-ins.
