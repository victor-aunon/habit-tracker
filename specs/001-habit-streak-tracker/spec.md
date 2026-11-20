# Feature Specification: Daily Habit & Streak Tracker with Weekly Analytics

**Feature Branch**: `001-habit-streak-tracker`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "Create a Daily Habit & Streak Tracker with weekly analytics. The user can add and delete habits, show the streak and a calendar view"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Habit Creation and Daily Completion Tracking (Priority: P1)

Users need to establish daily routines by defining custom habits and recording their completion each day. When opening the application, the user sees their list of active daily habits for the current date, each with an intuitive toggle to mark it as completed or incomplete.

**Why this priority**: Core value proposition. Without the ability to define habits and record daily completion, no streak calculation, calendar visualization, or analytics can function.

**Independent Test**: Can be fully tested by creating a habit (e.g., "Drink 2L Water"), marking it as completed for today, refreshing/revisiting to verify completion persists, and toggling it back to incomplete.

**Acceptance Scenarios**:

1. **Given** a user is on the habit tracker dashboard, **When** they provide a valid habit title (1 to 100 characters) and submit the creation form, **Then** the new habit immediately appears in their active habits list with an incomplete status for today.
2. **Given** an active habit exists for today in an incomplete state, **When** the user marks the habit as completed, **Then** the habit visual state changes to completed, the completion counter increases, and the completion timestamp is recorded for today.
3. **Given** a habit is currently marked as completed for today, **When** the user clicks to toggle completion off, **Then** the habit returns to incomplete status and today's completion entry is removed.
4. **Given** a user attempts to create a habit with an empty or whitespace-only name, **When** they submit, **Then** the system prevents creation and displays a clear message requesting a valid habit name (1 to 100 characters).
5. **Given** a user enters a habit title exceeding 100 characters, **When** they attempt to submit, **Then** the system blocks submission and displays a boundary validation error indicating the title cannot exceed 100 characters.
6. **Given** a habit named "Morning Run" already exists (case-insensitive), **When** the user attempts to create another habit with the same normalized name, **Then** the system warns the user of the duplicate title and prevents duplicate entry creation.
7. **Given** the persistence layer experiences an unexpected failure (e.g., storage quota exceeded or disk write restriction), **When** the user toggles a habit completion, **Then** the system displays a non-blocking error notification, retains the change in local session memory, and provides a retry mechanism.

---

### User Story 2 - Streak Calculation and Milestone Visibility (Priority: P1)

Users are motivated by consecutive consistency. Each habit displays the user's current streak (consecutive days completed ending either today or yesterday) and their longest all-time streak.

**Why this priority**: Streaks provide the primary behavioral incentive and gamification mechanic that drives daily user retention and habit formation.

**Independent Test**: Can be fully tested by simulating or logging completions across sequential dates and verifying that consecutive completions increment the streak, whereas missing a full calendar day resets the current streak to zero while preserving the all-time best streak.

**Acceptance Scenarios**:

1. **Given** a habit was completed yesterday and has a streak of 4 days, **When** the user marks the habit completed today, **Then** the current streak counter updates to 5 days.
2. **Given** a habit was completed yesterday and has not yet been marked today, **When** the user views the habit during today, **Then** the current streak still reflects yesterday's count (e.g., 4 days) with an indicator that today is pending completion.
3. **Given** a habit was last completed two or more days ago (missing at least one full day), **When** the user completes the habit today, **Then** the current streak resets to 1 day.
4. **Given** a habit's current streak reaches a count higher than its previous all-time best streak, **When** today's completion is logged, **Then** the all-time best streak updates to match the new current streak count.
5. **Given** a new habit is created today with zero completions, **When** viewing its streak counters, **Then** the current streak displays 0 days and the best streak displays 0 days.

---

### User Story 3 - Monthly Calendar History View (Priority: P2)

Users need a visual overview of their consistency over time. The calendar view presents a monthly grid where dates indicate habit performance (e.g., all habits completed, partially completed, or no habits completed), with the ability to navigate across previous and future months and inspect completions for any specific date.

**Why this priority**: The calendar view offers spatial and visual proof of habit adherence across weeks and months, helping users identify broader behavioral patterns.

**Independent Test**: Can be fully tested by navigating to the calendar view, reviewing date markers that match previously logged completions, navigating between adjacent months, and selecting an individual date to inspect which habits were completed on that day.

**Acceptance Scenarios**:

1. **Given** a user navigates to the calendar view, **When** the view loads, **Then** it displays the current month with distinct visual indicators for each day showing whether all, some, or none of the scheduled habits were completed.
2. **Given** the user is viewing the current month, **When** they click the previous month or next month controls, **Then** the calendar updates to display the corresponding month's days and historical completion data.
3. **Given** the calendar grid is displayed, **When** the user selects a specific past date, **Then** a detail panel or list displays the exact habits that were completed or missed on that selected date.
4. **Given** a user views a future date on the calendar, **When** inspecting that date, **Then** the system displays the date as upcoming with no completions recorded and prevents marking future completions.
5. **Given** a user has zero active habits in the system, **When** they open the calendar view, **Then** the calendar renders a helpful empty state explaining that tracking history will appear once habits are created, while keeping calendar navigation intact.

---

### User Story 4 - Weekly Analytics and Performance Summary (Priority: P2)

Users need actionable insights to evaluate their progress over time. The weekly analytics view summarizes completion rates for the current 7-day period (or Monday-Sunday week), visualizes daily breakdown trends, highlights the user's most consistent day, and calculates overall weekly consistency percentage.

**Why this priority**: Analytics translate raw completion checkmarks into reflective insights, enabling users to adjust routines and celebrate weekly progress.

**Independent Test**: Can be fully tested by recording completions across various days within a weekly timeframe and verifying that the weekly completion percentage, total completions, and day-by-day distribution accurately reflect the recorded data.

**Acceptance Scenarios**:

1. **Given** a user navigates to the analytics section, **When** the weekly summary displays, **Then** it shows the total completed habits for the week, the overall completion rate percentage (completed vs. total possible habit instances), and the most consistent day of the week.
2. **Given** a user has completed 14 out of 21 possible habit opportunities in the current week, **When** viewing the weekly summary, **Then** the weekly completion rate displays 67%.
3. **Given** a user has habit records spanning multiple weeks, **When** they toggle between the current week and previous weeks, **Then** the analytics recalculate and display metrics corresponding to the selected week.
4. **Given** a new user has not yet logged any completions in the current week, **When** opening the weekly analytics, **Then** the view gracefully displays an informative zero-state encouraging them to complete their first habit.
5. **Given** a user creates their first habit mid-week on Thursday, **When** computing weekly analytics, **Then** total possible opportunities count only from each habit's creation date forward, preventing false penalty for days prior to habit inception.

---

### User Story 5 - Habit Deletion and Confirmation Safeguards (Priority: P3)

Users need the ability to remove habits they no longer wish to track or that were created in error, with clear confirmation to prevent accidental loss of historical data.

**Why this priority**: Keeps the dashboard uncluttered and relevant as user goals evolve over time.

**Independent Test**: Can be fully tested by choosing to delete an existing habit, triggering the confirmation prompt, cancelling once to ensure the habit remains, and confirming deletion to verify it is removed from the active view.

**Acceptance Scenarios**:

1. **Given** an existing habit on the user's list, **When** the user initiates deletion of that habit, **Then** the system displays a confirmation dialog warning that this action will remove the habit from active tracking.
2. **Given** the deletion confirmation dialog is open, **When** the user cancels the confirmation, **Then** the habit remains active and unchanged in the list.
3. **Given** the deletion confirmation dialog is open, **When** the user confirms deletion, **Then** the habit is immediately removed from the active habit list and subsequent streak/analytics calculations.
4. **Given** the persistence layer fails during a deletion command, **When** the user confirms deletion, **Then** the system alerts the user that the operation could not be saved to disk and leaves the habit intact rather than in a desynchronized state.

---

### Edge Cases

- **Midnight & Timezone Transitions**: What happens when a user is using the application across midnight or changes their device timezone? The system anchors date calculations to the user's local calendar day (00:00 to 23:59). When midnight passes, the dashboard transitions to the new calendar day without requiring manual reload.
- **Same-Day Toggling & Rapid Clicking**: What happens if a user repeatedly or accidentally toggles a habit's completion? Each toggle atomically updates the daily completion state and recalculates the streak without duplicate entries, race conditions, or permanent distortion of historical data.
- **Zero Active Habits & Empty States**: How does the system handle an empty state where all habits are deleted or none have been created yet? The dashboard, calendar, and analytics present helpful onboarding empty states inviting the user to create their first habit with zero broken UI or NaN metrics.
- **Historical Edits / Backdating**: What happens if a user forgets to check off a habit yesterday? By default, the calendar view allows reviewing past dates; marking habits for past dates is supported through the day inspection view, which automatically recalculates historical streaks accurately.
- **Future Dates**: How does the calendar handle future dates? Future dates are strictly non-actionable; users cannot pre-complete habits for tomorrow or subsequent dates.
- **Long Names, Unicode & Whitespace Normalization**: How does the system handle very long habit titles, leading/trailing whitespace, or special characters/emojis? Habit titles are normalized by trimming surrounding whitespace. Titles support emojis and international text up to 100 characters. Titles exceeding 100 characters are rejected at the validation boundary.
- **Persistence Failures, Quota Exhaustion & Offline Behavior**: What happens if local storage is disabled, read-only, or full? The application detects persistence failures gracefully, shows a non-disruptive warning banner, retains the active state in memory for the duration of the session, and offers an export/retry mechanism to prevent uncommunicated data loss.
- **Duplicate Habit Titles**: What happens if a user inputs an identical title to an existing active habit? The system normalizes titles (trimmed, case-insensitive) and blocks duplicate creation with an inline validation message to maintain clarity in lists and analytics.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users MUST be able to create new habits by specifying a habit title (1 to 100 characters) and an optional description or category tag.
- **FR-002**: Users MUST be able to delete any existing habit, subject to an explicit user confirmation prompt before deletion takes effect.
- **FR-003**: The system MUST display all active habits for the current date with an explicit completion toggle for each habit.
- **FR-004**: Users MUST be able to toggle the completion status of any active habit for the current date between completed and incomplete.
- **FR-005**: The system MUST calculate and display the **Current Streak** for each habit, defined as the number of consecutive calendar days the habit has been completed up to either today or yesterday.
- **FR-006**: The system MUST calculate and display the **Best Streak** (all-time longest streak) achieved for each habit.
- **FR-007**: A habit's current streak MUST NOT be considered broken during the current day if yesterday was completed and today has not yet ended.
- **FR-008**: If a full calendar day passes without a habit being completed, the habit's current streak MUST reset to 0 (or to 1 upon the next completion).
- **FR-009**: The system MUST provide a **Calendar View** rendering a monthly grid layout showing all days of the selected month.
- **FR-010**: Each date cell in the Calendar View MUST visually indicate the habit completion status for that day (e.g., all completed, partially completed, none completed, or no habits tracked).
- **FR-011**: Users MUST be able to navigate to previous and future months in the Calendar View.
- **FR-012**: Selecting any date in the Calendar View MUST display a daily breakdown listing each habit and its completion status on that date.
- **FR-013**: The system MUST provide a **Weekly Analytics** view summarizing habit performance over a rolling or calendar 7-day period.
- **FR-014**: The Weekly Analytics view MUST display the overall weekly completion rate expressed as a percentage of completed habits over total scheduled habit opportunities.
- **FR-015**: The Weekly Analytics view MUST display a day-by-day distribution chart or breakdown showing total habits completed on each day of the week (Monday through Sunday).
- **FR-016**: The Weekly Analytics view MUST identify and display the user's most consistent day of the week (the day with the highest historical completion rate).
- **FR-017**: The system MUST persist all habits, completion logs, and streak records so that data remains available across user sessions.
- **FR-018**: The system MUST prevent marking habit completions for any date in the future.
- **FR-019**: The system MUST normalize habit titles by trimming leading and trailing whitespace and reject any title that is empty, whitespace-only, or longer than 100 characters.
- **FR-020**: The system MUST validate habit titles for uniqueness among active habits (case-insensitive) and prevent duplicate habit creation.
- **FR-021**: The system MUST detect and handle storage/persistence failures gracefully, informing the user with an explicit alert and retaining in-memory state without unhandled exceptions.
- **FR-022**: The system MUST render dedicated, accessible empty-state views for the Dashboard, Calendar View, and Analytics View when zero active habits or completions exist.

### Architectural Boundaries & Domain Invariants

To ensure Clean Architecture and maintainable vertical slices, this specification establishes strict domain boundaries without coupling to specific UI frameworks or persistence technologies:

- **Domain Layer Isolation**:
  - All business invariants (Streak calculation, Completion toggling, Rate percentage computations, and Date-window filtering) MUST be defined as pure domain functions and entities with zero dependencies on frameworks, DOM APIs, or storage drivers.
  - Domain rules MUST remain 100% unit-testable in isolation.
- **Vertical Slice Boundaries**:
  - `habits/tracking`: Encapsulates habit creation, title normalization, active status management, and daily completion commands.
  - `habits/streaks`: Pure calculation engine responsible for evaluating current streak, best streak, and streak break conditions.
  - `habits/calendar-history`: Query/projection slice responsible for generating monthly date matrices and querying daily completion records.
  - `habits/weekly-analytics`: Analytical projection slice responsible for computing completion rates, daily distributions, and top-performing days.
- **Infrastructure Decoupling**:
  - Persistence is declared as an abstract repository contract (`HabitRepository`, `CompletionLogRepository`).
  - No infrastructure details (such as localStorage keys, database schemas, network protocols, or external library types) leak into domain entities or functional requirements.

### Key Entities _(include if feature involves data)_

- **Habit**: Represents a recurring daily routine configured by the user. Key attributes include a unique identifier, title (1-100 characters, trimmed), optional description/category, creation timestamp, and active status.
- **Completion Record**: Represents a single historical instance of a habit completed on a specific calendar date. Key attributes include the associated habit identifier, the calendar date (YYYY-MM-DD), and the recorded timestamp.
- **Streak Summary**: Represents the calculated streak metrics for a specific habit. Key attributes include the current streak count, best all-time streak count, last completed date, and streak health indicator (active, pending today, or broken).
- **Weekly Analytics Aggregate**: Represents computed performance indicators for a specified 7-day weekly period. Key attributes include start date, end date, total habit instances scheduled, total instances completed, completion percentage (0-100%), daily completion distribution map, and top-performing day.
- **Storage Operation Result**: Represents the outcome of persistence operations, capturing status (success/failure) and error metadata for user notification and retry orchestration.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create and begin tracking a new habit in under 15 seconds from the main dashboard.
- **SC-002**: Users can check off all daily habits in under 5 seconds upon opening the application.
- **SC-003**: Streak metrics update instantaneously upon completion toggling, with zero perceptible lag for the user (< 50ms computation time).
- **SC-004**: 100% of calendar dates accurately reflect historical completion records when navigated across any past month.
- **SC-005**: Weekly analytics calculations (weekly completion percentage, daily totals, and best day) remain mathematically accurate and consistent with recorded daily logs in 100% of test scenarios.
- **SC-006**: First-time users can navigate between the daily tracker list, the monthly calendar view, and the weekly analytics view without confusion or error in 95% of usability evaluations.
- **SC-007**: System handles 100% of persistence failure scenarios without unhandled exceptions or silent data loss, displaying user feedback and preserving in-memory session state.
- **SC-008**: 100% of boundary validation rules (empty title, >100 characters, duplicates) produce deterministic validation feedback prior to persistence.

## Assumptions

- **Frequency Model**: All habits in this initial feature version operate on a daily frequency cadence (every calendar day). Custom non-daily frequencies (e.g., "3 days per week" or "weekdays only") are deferred to future enhancements.
- **Calendar & Timezone**: Dates are computed according to the user's local system timezone, with calendar weeks standardizing on Monday as the first day of the week (or configurable based on regional locale defaults).
- **Data Persistence**: Data is persisted via an abstracted repository adapter, ensuring seamless retrieval without loss between visits and resilient error handling when storage is constrained.
- **Habit Deletion Scope**: When a habit is deleted, it is removed from active daily tracking; historical completion records for deleted habits are archived so historical calendar summaries remain mathematically consistent.
- **Single User Context**: The feature is designed for an individual user tracking their personal habits; shared or multi-user accountability groups are out of scope for this version.
