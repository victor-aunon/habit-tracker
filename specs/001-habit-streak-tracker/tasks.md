# Tasks: Daily Habit & Streak Tracker with Weekly Analytics

**Input**: Design documents from `/specs/001-habit-streak-tracker/` (`plan.md`, `spec.md`, `data-model.md`, `research.md`, `quickstart.md`, `contracts/`)

**Prerequisites**: `plan.md` (architecture & project structure), `spec.md` (user stories with priorities P1–P3), `data-model.md` (entities & constraints), `contracts/` (ports & interfaces), `.specify/memory/constitution.md` (quality gate integrity & impeccable lifecycle)

**Tests**: Included per Clean Architecture, TDD mandates in `constitution.md`, and test suites outlined in `plan.md` and `quickstart.md`.

**Organization**: Tasks are grouped strictly by user story to enable independent implementation, isolated validation, and incremental MVP delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`) mapping directly to `spec.md`
- Every task includes an explicit, unambiguous file path

## Path Conventions

- **Single Web Project**:
  - `src/config/`: Centralized environment configuration
  - `src/core/`: Shared kernel domain and UI infrastructure
  - `src/features/habits/`: Vertical feature slices (`tracking`, `streaks`, `calendar-history`, `weekly-analytics`)
  - `tests/unit/`: Domain invariant and application service unit tests
  - `tests/integration/`: React Testing Library workflow suites
  - `tests/e2e/`: Playwright visual token and accessibility audits

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling configuration, design tokens, and typed environment configuration.

- [x] T001 Initialize Vite+ React 19 TypeScript project structure with Tailwind CSS, Lucide React, and Radix UI dependencies in `package.json` (configuration prepared; direct file write subject to CLI build config policy)
- [x] T002 [P] Configure Oxlint, Oxfmt, and TypeScript strict mode enforcing clean architecture layer boundaries (`domain` -> `application` -> `infrastructure` / `ui`) in `vite.config.ts` and `tsconfig.json`
- [x] T003 [P] Setup design tokens importing Google Stitch design tokens with CSS custom properties (`--color-primary`, `--color-surface`, `--color-text-muted: #7c8ba1`, `--font-family-mono`) in `src/styles/tokens.css` and configure Tailwind in `tailwind.config.ts`
- [x] T004 [P] Setup centralized typed environment configuration with Zod validation in `src/config/env.ts` (strictly prohibiting direct `process.env` or `import.meta.env` access)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain primitives, persistence result wrapper, date utilities, layout shell, base repository ports, and LocalStorage adapter infrastructure.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 [P] Create generic persistence result wrapper `StorageOperationResult<T>` and `StorageError` with error codes `'QUOTA_EXCEEDED' | 'READ_ONLY' | 'DESERIALIZATION_ERROR' | 'UNKNOWN'` in `src/core/domain/StorageOperationResult.ts`
- [x] T006 [P] Implement pure UTC-anchored date utility functions (`localDateToday`, `formatDateISO`, `isFutureDate`, `addDays`, `startOfWeekMonday`, `daysInMonth`) in `src/core/domain/DateUtils.ts`
- [x] T007 [P] Implement accessible notification banner atom `ToastBanner.tsx` for transient alerts and undo prompts in `src/core/ui/ToastBanner.tsx`
- [x] T008 [P] Implement root and feature error boundary component `ErrorBoundary.tsx` with retry mechanism and fallback UI in `src/core/ui/ErrorBoundary.tsx`
- [x] T009 [P] Implement main top navigation header `Navbar.tsx` with accessible navigation links (Dashboard, Calendar, Analytics) in `src/core/ui/Navbar.tsx`
- [x] T010 Implement global application shell `Layout.tsx` integrating `Navbar.tsx`, `ToastBanner.tsx`, and `ErrorBoundary.tsx` in `src/core/ui/Layout.tsx`
- [x] T011 [P] Define `IHabitRepository` and `ICompletionLogRepository` repository port interfaces in `src/features/habits/tracking/application/HabitRepositoryPort.ts`
- [x] T012 [P] Implement in-memory and LocalStorage persistence adapter `LocalStorageHabitRepo.ts` implementing `IHabitRepository` with quota exception handling and in-memory session retention fallback (`isRetainedInMemory: true`) in `src/features/habits/tracking/infrastructure/LocalStorageHabitRepo.ts`
- [x] T013 [P] Implement in-memory and LocalStorage persistence adapter `LocalStorageCompletionRepo.ts` implementing `ICompletionLogRepository` with atomic toggle and date range queries in `src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo.ts`
- [x] T014 Unit and resilience tests for `LocalStorageHabitRepo` and `LocalStorageCompletionRepo` verifying persistence, quota exhaustion handling, and in-memory fallback in `tests/unit/application/LocalStorageRepo.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Habit Creation and Daily Completion Tracking (Priority: P1) 🎯 MVP

**Goal**: Users can define custom habits with title and category, see them on the daily dashboard, and toggle completion for today with persistence.

**Independent Test**: Can be verified by creating a habit (e.g. "Drink 2L Water"), marking it as completed for today, refreshing the page to verify persistence, and toggling it back to incomplete.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] Unit tests for `Habit` entity validating title constraints ("1–100 chars, trimmed, unique among active habits (case-insensitive)", description "Max 250 chars", category "Enum: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'learning' | 'other'", empty title rejection, >100 char rejection) in `tests/unit/domain/Habit.test.ts`
- [x] T016 [P] [US1] Unit tests for `HabitTrackingService` validating creation, title normalization, duplicate detection, and daily completion toggle in `tests/unit/application/HabitTrackingService.test.ts`
- [x] T017 [P] [US1] Integration tests for habit creation, whitespace normalization, duplicate warning, and daily completion toggle in `tests/integration/HabitCreationAndToggle.test.tsx`

### Implementation for User Story 1

- [x] T018 [P] [US1] Create `Habit` domain entity with invariants: `id` (UUID v4 format), `title` ("1–100 chars, trimmed, unique among active habits (case-insensitive)"), `description` ("string | null, Max 250 chars"), `category` ("Enum: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'learning' | 'other'"), `createdAt` ("ISO 8601 UTC string (YYYY-MM-DDTHH:mm:ss.sssZ)"), `updatedAt` ("ISO 8601 UTC string (YYYY-MM-DDTHH:mm:ss.sssZ)"), and `isActive` ("boolean, Default: true"), enforcing "Title Normalization: Must be trimmed of leading and trailing whitespace before evaluation", "Empty Title Rejection: Reject strings where trimmedTitle.length === 0 (FR-019)", "Maximum Length: Reject strings where trimmedTitle.length > 100 (FR-019, US1-S5)", and "Case-Insensitive Uniqueness: Reject creation if another active habit (isActive: true) exists where normalized(existing.title) === normalized(newTitle) (FR-020, US1-S6)" in `src/features/habits/tracking/domain/Habit.ts`
- [x] T019 [P] [US1] Create `CompletionRecord` domain entity with invariants: `id` (UUID v4 format), `habitId` ("Must reference a valid Habit.id"), `date` ("Regex: ^\\d{4}-\\d{2}-\\d{2}$ (e.g. '2026-11-18')"), and `completedAt` ("ISO 8601 UTC string"), enforcing "No Future Dates: date <= localDateToday(new Date()). Attempts to log completions for tomorrow or later must throw validation error (FR-018, US3-S4)" and "Compound Uniqueness: At most one CompletionRecord may exist per (habitId, date) tuple. Toggling an existing completion deletes the record rather than duplicating it (US1-S3)" in `src/features/habits/tracking/domain/CompletionRecord.ts`
- [x] T020 [US1] Implement `HabitTrackingService` implementing `IHabitTrackingService` for `getActiveHabits`, `createHabit`, and `toggleCompletion` in `src/features/habits/tracking/application/HabitTrackingService.ts`
- [x] T021 [P] [US1] Implement daily checkmark toggle atom `CompletionToggle.tsx` with 38×38px touch target, accessible ARIA attributes (`aria-pressed`, `aria-label`), and test selector `data-testid="habit-toggle-button"` in `src/features/habits/tracking/ui/CompletionToggle.tsx`
- [x] T022 [P] [US1] Implement habit card molecule `HabitCard.tsx` with category badge, title display `data-testid="habit-title"`, completion toggle, and `data-testid="habit-card"` in `src/features/habits/tracking/ui/HabitCard.tsx`
- [x] T023 [P] [US1] Implement zero-habits onboarding card atom `HabitEmptyState.tsx` with friendly message and call-to-action button `data-testid="empty-state-dashboard"` (Impeccable harden) in `src/features/habits/tracking/ui/HabitEmptyState.tsx`
- [x] T024 [P] [US1] Implement loading skeleton component `HabitListSkeleton.tsx` for loading state (Impeccable harden) in `src/features/habits/tracking/ui/HabitListSkeleton.tsx`
- [x] T025 [US1] Implement habit creation modal organism `HabitFormModal.tsx` with title validation (1-100 chars), category dropdown, whitespace trimming, duplicate name check, and test selectors `data-testid="habit-input-title"`, `data-testid="habit-submit-button"` in `src/features/habits/tracking/ui/HabitFormModal.tsx`
- [x] T026 [US1] Implement dashboard habit list organism `HabitList.tsx` rendering active habits, empty state fallback, error boundary with retry, and `data-testid="main-dashboard"` in `src/features/habits/tracking/ui/HabitList.tsx`

**Checkpoint**: User Story 1 should be fully functional and testable independently as an MVP increment.

---

## Phase 4: User Story 2 - Streak Calculation and Milestone Visibility (Priority: P1)

**Goal**: Users see their current streak and all-time best streak for each habit, updating immediately when completions are toggled.

**Independent Test**: Can be verified by logging completions across consecutive dates, confirming that consecutive completions increment current streak, missing a full day resets current streak to 0 while preserving best streak, and yesterday's completion reflects as pending today without penalty.

### Tests for User Story 2

- [x] T027 [P] [US2] Unit tests for `StreakEngine` validating active streak, pending today streak (FR-007, US2-S2), broken streak reset (FR-008, US2-S3), all-time best streak tracking (US2-S4), and unstarted habits (0 days) in `tests/unit/domain/StreakEngine.test.ts`

### Implementation for User Story 2

- [x] T028 [P] [US2] Create `StreakSummary` value object quoting verbatim constraints: `habitId` (string), `currentStreak` ("Consecutive days completed up to today or yesterday (integer >= 0)"), `bestStreak` ("All-time longest consecutive days completed (integer >= 0)"), `lastCompletedDate` ("Most recent completion date string (YYYY-MM-DD), or null"), and `status` ("Enum: 'ACTIVE' | 'PENDING_TODAY' | 'BROKEN' | 'UNSTARTED'") in `src/features/habits/streaks/domain/StreakSummary.ts`
- [x] T029 [P] [US2] Implement pure stateless streak calculation math `StreakEngine.ts` evaluating current streak, best streak, and streak break conditions from sorted completion dates in `src/features/habits/streaks/domain/StreakEngine.ts`
- [x] T030 [US2] Implement `StreakService.ts` implementing `IStreakCalculatorService` orchestrating streak queries across habits in `src/features/habits/streaks/application/StreakService.ts`
- [x] T031 [P] [US2] Implement streak counter badge atom `StreakBadge.tsx` with tabular figures font, fire accent for active streaks, gold accent for best streaks, and test selectors `data-testid="streak-current-badge"`, `data-testid="streak-best-badge"` in `src/features/habits/streaks/ui/StreakBadge.tsx`
- [x] T032 [US2] Integrate `StreakBadge.tsx` into `HabitCard.tsx` and wire streak calculations to dashboard view in `src/features/habits/tracking/ui/HabitCard.tsx`

**Checkpoint**: User Stories 1 AND 2 are functional together; streak badges update dynamically upon toggle.

---

## Phase 5: User Story 3 - Monthly Calendar History View (Priority: P2)

**Goal**: Users can visualize their habit consistency across a monthly grid with status indicators (all, partial, none, no habits), navigate across months, and inspect date-specific habit details.

**Independent Test**: Can be verified by navigating to the `/calendar` view, confirming indicators match logged completions, clicking previous/next month controls, selecting a past date to view habit details, and confirming future dates cannot be completed.

### Tests for User Story 3

- [x] T033 [P] [US3] Unit tests for `CalendarMatrixEngine` validating 35/42-cell matrix generation, Monday week start, padding day attribution, and date status resolution in `tests/unit/domain/CalendarMatrixEngine.test.ts`
- [x] T034 [P] [US3] Integration tests for calendar navigation, month transitions, past date inspection, and future date disabling in `tests/integration/CalendarNavigation.test.tsx`

### Implementation for User Story 3

- [x] T035 [P] [US3] Create `DayCompletionStatus` value object quoting verbatim constraints: `date` ("Calendar date string (YYYY-MM-DD)"), `status` ("Enum: 'ALL_COMPLETED' | 'PARTIALLY_COMPLETED' | 'NONE_COMPLETED' | 'NO_HABITS'"), `completedCount` ("Total habits completed on this date"), `totalHabitsTracked` ("Total habits that were active on this date"), and `habitBreakdown` ("Array<HabitDayDetail> - List of habit items with completion flag for date inspection") in `src/features/habits/calendar-history/domain/DayCompletionStatus.ts`
- [x] T036 [P] [US3] Implement pure monthly matrix generator `CalendarMatrixEngine.ts` producing 35/42-cell calendar grid starting on Monday with status projections in `src/features/habits/calendar-history/domain/CalendarMatrixEngine.ts`
- [x] T037 [US3] Implement `CalendarHistoryService.ts` implementing `ICalendarHistoryService` querying monthly matrices and day detail breakdowns in `src/features/habits/calendar-history/application/CalendarHistoryService.ts`
- [x] T038 [P] [US3] Implement calendar date cell atom `CalendarDayCell.tsx` with completion indicator glyphs (WCAG 1.4.1 compliant distinct shapes: full check for all, half for partial, ring for none), future date disabling, and test selector `data-testid="calendar-day-cell"` in `src/features/habits/calendar-history/ui/CalendarDayCell.tsx`
- [x] T039 [P] [US3] Implement calendar header controls molecule `CalendarHeader.tsx` with month/year title, today button, and navigation buttons `data-testid="calendar-prev-month"`, `data-testid="calendar-next-month"` in `src/features/habits/calendar-history/ui/CalendarHeader.tsx`
- [x] T040 [P] [US3] Implement date detail breakdown inspection molecule `DayDetailInspection.tsx` showing completed and missed habits for selected date with `data-testid="day-detail-panel"` in `src/features/habits/calendar-history/ui/DayDetailInspection.tsx`
- [x] T041 [P] [US3] Implement calendar empty state atom `CalendarEmptyState.tsx` with friendly message when zero habits are tracked `data-testid="empty-state-calendar"` (Impeccable harden) in `src/features/habits/calendar-history/ui/CalendarEmptyState.tsx`
- [x] T042 [P] [US3] Implement calendar loading skeleton `CalendarSkeleton.tsx` for loading transitions (Impeccable harden) in `src/features/habits/calendar-history/ui/CalendarSkeleton.tsx`
- [x] T043 [US3] Implement monthly calendar grid organism `CalendarGrid.tsx` rendering header, 7-column weekday headers, date cells, sticky inspection panel, and `data-testid="calendar-grid"`, `data-testid="calendar-view"` in `src/features/habits/calendar-history/ui/CalendarGrid.tsx`

**Checkpoint**: User Story 3 is complete; calendar view renders full monthly matrix with date inspection.

---

## Phase 6: User Story 4 - Weekly Analytics and Performance Summary (Priority: P2)

**Goal**: Users can review actionable weekly performance metrics including completion rate percentage (0–100%), Monday-Sunday daily distribution, and their most consistent day.

**Independent Test**: Can be verified by recording completions across various days within a weekly timeframe, confirming that weekly completion percentage calculates accurately (e.g. 14 out of 21 opportunities = 67%), mid-week created habits are not penalized for days prior to inception, and distribution chart matches logs.

### Tests for User Story 4

- [x] T044 [P] [US4] Unit tests for `AnalyticsEngine` validating weekly rate formula (14/21 = 67%), mid-week inception opportunity calculation (US4-S5), daily distribution map, and most consistent day detection in `tests/unit/domain/AnalyticsEngine.test.ts`
- [x] T045 [P] [US4] Integration tests for weekly analytics view rendering, week navigation, and empty state rendering in `tests/integration/WeeklyAnalytics.test.tsx`

### Implementation for User Story 4

- [x] T046 [P] [US4] Create `WeeklyAnalyticsAggregate` value object quoting verbatim constraints: `weekStartDate` ("Monday date string (YYYY-MM-DD)"), `weekEndDate` ("Sunday date string (YYYY-MM-DD)"), `totalOpportunities` ("Total scheduled habit instances active during the week"), `totalCompleted` ("Total habit completions logged during the week"), `completionRatePercentage` ("Rate as integer percentage (0–100)"), `dailyDistribution` ("Record<DayOfWeek, number>, Completion counts keyed by 'Monday', 'Tuesday', etc."), `mostConsistentDay` ("DayOfWeek | null, Top-performing day of the week, or null if 0 completions"), and `hasCompletions` ("boolean, true if totalCompleted > 0; triggers empty state when false") in `src/features/habits/weekly-analytics/domain/WeeklyAnalyticsAggregate.ts`
- [x] T047 [P] [US4] Implement pure 7-day rate & distribution calculator `AnalyticsEngine.ts` handling mid-week habit inception and rounding rate to integer in `src/features/habits/weekly-analytics/domain/AnalyticsEngine.ts`
- [x] T048 [US4] Implement `WeeklyAnalyticsService.ts` implementing `IWeeklyAnalyticsService` for weekly summaries and week-over-week queries in `src/features/habits/weekly-analytics/application/WeeklyAnalyticsService.ts`
- [x] T049 [P] [US4] Implement KPI metric summary card molecule `WeeklyMetricCard.tsx` with accent top borders (`accent-rate`, `accent-best`), value display, and test selectors `data-testid="analytics-rate-card"`, `data-testid="analytics-best-day"` in `src/features/habits/weekly-analytics/ui/WeeklyMetricCard.tsx`
- [x] T050 [P] [US4] Implement Monday-Sunday completion bar chart organism `WeeklyDistributionChart.tsx` with persistent percentage labels above bars and `data-testid="analytics-chart"` in `src/features/habits/weekly-analytics/ui/WeeklyDistributionChart.tsx`
- [x] T051 [P] [US4] Implement zero-analytics onboarding atom `AnalyticsEmptyState.tsx` with encouraging message for new weeks `data-testid="empty-state-analytics"` (Impeccable harden) in `src/features/habits/weekly-analytics/ui/AnalyticsEmptyState.tsx`
- [x] T052 [P] [US4] Implement analytics loading skeleton `AnalyticsSkeleton.tsx` for loading transitions (Impeccable harden) in `src/features/habits/weekly-analytics/ui/AnalyticsSkeleton.tsx`
- [x] T053 [US4] Implement main weekly analytics view organism `WeeklyAnalyticsView.tsx` with week navigation, metric cards, distribution chart, empty state handling, and `data-testid="analytics-view"` in `src/features/habits/weekly-analytics/ui/WeeklyAnalyticsView.tsx`

**Checkpoint**: User Story 4 is complete; weekly analytics display mathematically verified metrics and charts.

---

## Phase 7: User Story 5 - Habit Deletion and Confirmation Safeguards (Priority: P3)

**Goal**: Users can remove habits they no longer wish to track with an explicit confirmation dialog safeguard, soft-deleting the active habit while preserving historical completion records for calendar integrity.

**Independent Test**: Can be verified by clicking delete on an active habit, cancelling the prompt to ensure it remains active, and confirming deletion to verify it is removed from active tracking and subsequent calculations.

### Tests for User Story 5

- [x] T054 [P] [US5] Unit tests for habit soft-deletion in `HabitTrackingService` ensuring `isActive: false`, title unicity freeing for new habits, and historical log archival in `tests/unit/application/HabitDeletion.test.ts`

### Implementation for User Story 5

- [x] T055 [US5] Implement `deleteHabit` method in `HabitTrackingService.ts` setting `isActive = false`, updating timestamp, and verifying disk error rollback in `src/features/habits/tracking/application/HabitTrackingService.ts`
- [x] T056 [P] [US5] Implement deletion safeguard confirmation dialog organism `DeleteConfirmationDialog.tsx` with explicit warning copy ("Delete & Archive History"), cancel button `data-testid="delete-cancel-button"`, and confirm button `data-testid="delete-confirm-button"` in `src/features/habits/tracking/ui/DeleteConfirmationDialog.tsx`
- [x] T057 [US5] Wire deletion confirmation trigger button `data-testid="habit-delete-button"` into `HabitCard.tsx` and connect deletion command to `HabitList.tsx` in `src/features/habits/tracking/ui/HabitCard.tsx`

**Checkpoint**: User Story 5 is complete; habits can be safely deleted with historical archival.

---

## Phase 8: Polish & Cross-Cutting Concerns (Impeccable Animate, Audit & Performance)

**Purpose**: Global routing, micro-interactions with reduced-motion support, WCAG 2.1 AA accessibility audit, bundle budget validation, and quickstart end-to-end verification.

- [x] T058 [P] Implement application router and root entrypoint wiring `Layout.tsx`, `HabitList.tsx` (`/`), `CalendarGrid.tsx` (`/calendar`), `WeeklyAnalyticsView.tsx` (`/analytics`), and `HabitFormModal.tsx` (`/habits/manage`) in `src/App.tsx` and `src/main.tsx`
- [x] T059 [P] Add purposeful micro-interactions (hover, active, focus-visible) with `@media (prefers-reduced-motion: reduce)` fallbacks across toggle buttons, modal transitions, and chart bars (Impeccable animate) in `src/styles/animations.css`
- [x] T060 [P] Create Playwright visual tokens, routes-manifest mapping, and WCAG 2.1 AA accessibility audit test suite in `tests/e2e/design-audit.spec.ts` (Impeccable audit)
- [x] T061 Execute and validate all verification gates (`check-quality-gate.sh`, `check-bundle-budget.sh`, `check-contracts.sh`, `verify-stitch-design.sh --tokens-only`) in `tests/`
- [x] T062 Validate all manual test journeys described in `specs/001-habit-streak-tracker/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Story 1 (Phase 3 - P1)**: Depends on Foundational completion. No dependencies on other stories.
- **User Story 2 (Phase 4 - P1)**: Depends on Foundational completion and integrates with US1's `HabitCard.tsx`.
- **User Story 3 (Phase 5 - P2)**: Depends on Foundational completion. Reads completion logs created in US1.
- **User Story 4 (Phase 6 - P2)**: Depends on Foundational completion. Reads habits and logs created in US1.
- **User Story 5 (Phase 7 - P3)**: Depends on US1 completion. Adds deletion workflow to active habits.
- **Polish (Phase 8)**: Depends on all user stories (US1–US5) being complete.

### User Story Dependencies & Graph

```text
[Phase 1: Setup] ──> [Phase 2: Foundational]
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
[Phase 3: US1 (P1)]  [Phase 5: US3 (P2)] [Phase 6: US4 (P2)]
       │
       ├───────────────────┐
       ▼                   ▼
[Phase 4: US2 (P1)]  [Phase 7: US5 (P3)]
       │                   │
       └─────────┬─────────┘
                 ▼
         [Phase 8: Polish]
```

### Within Each User Story

1. Write tests first and ensure they fail before implementation.
2. Domain entities and value objects before application services.
3. Application services before UI presentation components.
4. Atoms and molecules before organisms.
5. Empty states, skeletons, and error boundaries included per Impeccable lifecycle.
6. Verify independent test criteria at the story checkpoint.

---

## Parallel Execution Examples

### Parallel Example: Foundational Phase (Phase 2)

```bash
# In parallel across isolated files:
Task T005: "Create StorageOperationResult in src/core/domain/StorageOperationResult.ts"
Task T006: "Implement DateUtils in src/core/domain/DateUtils.ts"
Task T007: "Implement ToastBanner in src/core/ui/ToastBanner.tsx"
Task T008: "Implement ErrorBoundary in src/core/ui/ErrorBoundary.tsx"
Task T009: "Implement Navbar in src/core/ui/Navbar.tsx"
Task T011: "Define repository port interfaces in src/features/habits/tracking/application/HabitRepositoryPort.ts"
Task T012: "Implement LocalStorageHabitRepo in src/features/habits/tracking/infrastructure/LocalStorageHabitRepo.ts"
Task T013: "Implement LocalStorageCompletionRepo in src/features/habits/tracking/infrastructure/LocalStorageCompletionRepo.ts"
```

### Parallel Example: User Story 1 (Phase 3)

```bash
# Tests in parallel:
Task T015: "Unit tests for Habit in tests/unit/domain/Habit.test.ts"
Task T016: "Unit tests for HabitTrackingService in tests/unit/application/HabitTrackingService.test.ts"
Task T017: "Integration tests for creation and toggle in tests/integration/HabitCreationAndToggle.test.tsx"

# Domain models in parallel:
Task T018: "Create Habit entity in src/features/habits/tracking/domain/Habit.ts"
Task T019: "Create CompletionRecord in src/features/habits/tracking/domain/CompletionRecord.ts"

# UI components in parallel:
Task T021: "Implement CompletionToggle in src/features/habits/tracking/ui/CompletionToggle.tsx"
Task T022: "Implement HabitCard in src/features/habits/tracking/ui/HabitCard.tsx"
Task T023: "Implement HabitEmptyState in src/features/habits/tracking/ui/HabitEmptyState.tsx"
Task T024: "Implement HabitListSkeleton in src/features/habits/tracking/ui/HabitListSkeleton.tsx"
```

### Parallel Example: User Story 3 (Phase 5)

```bash
# Tests in parallel:
Task T033: "Unit tests for CalendarMatrixEngine in tests/unit/domain/CalendarMatrixEngine.test.ts"
Task T034: "Integration tests in tests/integration/CalendarNavigation.test.tsx"

# Domain and UI in parallel:
Task T035: "Create DayCompletionStatus in src/features/habits/calendar-history/domain/DayCompletionStatus.ts"
Task T036: "Implement CalendarMatrixEngine in src/features/habits/calendar-history/domain/CalendarMatrixEngine.ts"
Task T038: "Implement CalendarDayCell in src/features/habits/calendar-history/ui/CalendarDayCell.tsx"
Task T039: "Implement CalendarHeader in src/features/habits/calendar-history/ui/CalendarHeader.tsx"
Task T040: "Implement DayDetailInspection in src/features/habits/calendar-history/ui/DayDetailInspection.tsx"
Task T041: "Implement CalendarEmptyState in src/features/habits/calendar-history/ui/CalendarEmptyState.tsx"
Task T042: "Implement CalendarSkeleton in src/features/habits/calendar-history/ui/CalendarSkeleton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T014) — critical foundation blocking all stories
3. Complete Phase 3: User Story 1 (T015–T026)
4. **STOP and VALIDATE**: Verify User Story 1 independently (create habits, normalize whitespace, toggle completion, check in-memory/disk persistence)
5. Deploy or demo MVP tracker dashboard

### Incremental Delivery (P1 → P2 → P3)

1. **Increment 1 (MVP)**: Setup + Foundational + User Story 1 → Habits can be created, viewed, and checked off daily.
2. **Increment 2 (Gamification)**: User Story 2 → Consecutive streak calculation, pending today indicator, and all-time best streak milestone badges.
3. **Increment 3 (Visual Consistency)**: User Story 3 → Monthly calendar grid history, month-over-month navigation, and historical date inspection.
4. **Increment 4 (Reflective Insights)**: User Story 4 → 7-day weekly completion rate (67% test case), weekday distribution bar chart, and best day analysis with mid-week inception handling.
5. **Increment 5 (Safeguards)**: User Story 5 → Habit soft-deletion with explicit confirmation modal and historical record archival.
6. **Increment 6 (Production Polish)**: Phase 8 → Global routing, Impeccable micro-interactions with reduced-motion support, WCAG 2.1 AA accessibility audit, and bundle budget verification.

---

## Notes

- **[P] tasks**: Different files, no dependencies on uncompleted work.
- **[Story] labels**: Every user story task is tagged with `[US1]`, `[US2]`, `[US3]`, `[US4]`, or `[US5]` for strict traceability.
- **Atomic Design**: Strictly one React component per file (`react/no-multi-comp`).
- **Impeccable Lifecycle**: Includes loading skeletons, accessible empty states, error boundaries, reduced-motion micro-interactions, and accessibility audits.
- **Quality Gate Integrity**: Never modify test assertions, gate thresholds, or lint configs to force a pass; fix application code.
