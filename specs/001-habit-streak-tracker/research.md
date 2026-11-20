# Research & Architectural Decisions: Daily Habit & Streak Tracker with Weekly Analytics

**Feature**: `001-habit-streak-tracker`  
**Date**: 2026-11-18  
**Status**: Completed  
**Spec Reference**: `specs/001-habit-streak-tracker/spec.md`

---

## 1. Architectural Style & State Management

### Decision

Implement Clean Architecture structured into four cohesive vertical slices under `src/features/habits/`:

1. `tracking/`: Habit entity lifecycle (creation, validation, active status, daily completion commands).
2. `streaks/`: Pure streak calculation engine (current streak, best streak, status evaluation).
3. `calendar-history/`: Monthly date matrix generation, historical day inspection projections.
4. `weekly-analytics/`: Rolling 7-day and calendar-week performance metrics, consistency percentages, and day-of-week distributions.

Cross-cutting application orchestration will use typed React Context and custom hooks (`useHabitTracker`, `useHabitStreaks`, `useCalendarHistory`, `useWeeklyAnalytics`) backed by application use-case services that consume abstract repository ports.

### Rationale

- **Zero Infrastructure Leakage**: Meets Constitution & Clean Architecture mandates where domain entities and invariants have 0 external dependencies.
- **Strict Boundary Enforcement**: Directly maps to Vite+ Oxlint overrides (`no-restricted-imports` prohibiting domain from importing application, infrastructure, or UI).
- **Bundle Efficiency**: Built-in React Context + hooks eliminate bulky third-party state managers (e.g. Redux or MobX), ensuring bundle sizes easily respect the 250 KB per-chunk and 1000 KB total production budget.
- **Testability**: Every domain use case and calculation engine is 100% testable in pure TypeScript without DOM or mocking frameworks.

### Alternatives Considered

- **Zustand / Redux Toolkit**: Adds 15–45 KB of third-party dependencies and introduces external state stores that often tempt developers to bypass application service layers.
- **Monolithic Single-Slice (`src/habits/`)**: Violates vertical slice isolation by intertwining analytics algorithms, calendar projections, and streak math into one large state blob.

---

## 2. Streak Calculation Engine Logic

### Decision

Adopt a pure, stateless calculation function that computes both **Current Streak** and **All-Time Best Streak** on demand from a habit's normalized, deduplicated, and sorted list of historical completion date strings (`YYYY-MM-DD`).

#### Calculation Algorithm:

Given a target reference date $T_0$ (today) and reference date $T_{-1}$ (yesterday):

1. **Deduplication & Sorting**: Parse and extract unique completion dates in descending chronological order ($D_0, D_1, \dots, D_{N-1}$).
2. **Current Streak**:
   - If $T_0 \in \text{Completions}$, start counting consecutive calendar days backwards from $T_0$. Streak status is `ACTIVE`.
   - If $T_0 \notin \text{Completions}$ but $T_{-1} \in \text{Completions}$, start counting consecutive calendar days backwards from $T_{-1}$. Streak status is `PENDING_TODAY` (the streak is preserved because today is still in progress).
   - If neither $T_0$ nor $T_{-1} \in \text{Completions}$, the current streak is `0`. Streak status is `BROKEN` (or `UNSTARTED` if completions are empty).
3. **Best Streak**:
   - Iterate through the sorted date list from oldest to newest.
   - Maintain `longestRun = 0` and `currentRun = 0`.
   - For each adjacent pair $(D_k, D_{k+1})$, if $D_{k+1}$ is exactly 1 calendar day after $D_k$, increment `currentRun`. Otherwise, reset `currentRun = 1`.
   - `bestStreak = max(longestRun, currentStreak)`.
4. **Time Complexity**: $O(N \log N)$ where $N$ is the number of completion entries (typically $< 365$ entries per habit per year, executing in $< 0.5$ ms).

### Rationale

- Completely eliminates race conditions and drift bugs caused by storing mutable streak counters in persistence.
- Handles backdating, edits, or toggling off past completions automatically and deterministically.
- Satisfies requirements FR-005, FR-006, FR-007, and FR-008.

### Alternatives Considered

- **Stored Streak Counters**: Incrementing a counter upon toggle and decrementing on untoggle. Rejected because backdated entries, deletions, or failed writes leave the counter permanently desynchronized.

---

## 3. Date & Calendar Grid Modeling

### Decision

Represent all dates within the domain as ISO calendar strings formatted as `YYYY-MM-DD` (e.g., `'2026-11-18'`). All date arithmetic (adding days, determining day of week, start of month, days in month) is encapsulated within pure helper functions using native JavaScript `Date` (UTC-anchored at 12:00:00 to prevent daylight saving time / timezone rollover anomalies).

For the Monthly Calendar Grid:

- A month is represented as a 35-cell or 42-cell matrix (5 to 6 weeks of 7 days, starting on Monday).
- Padding days from previous/next months are marked with `isCurrentMonth: false`.
- Each date cell projects a `DayCompletionStatus`:
  - `ALL_COMPLETED`: All active habits tracked on that date were completed.
  - `PARTIALLY_COMPLETED`: At least one, but not all, active habits were completed.
  - `NONE_COMPLETED`: Zero active habits were completed on that date.
  - `NO_HABITS`: No habits existed or were scheduled on that date.

### Rationale

- Storing `YYYY-MM-DD` strings decouples persistence and domain comparison from local browser timezone offsets and ISO timestamp UTC conversions.
- Anchoring internal date calculations prevents 23-hour or 25-hour daylight saving shift bugs.
- Complies with FR-009, FR-010, FR-011, and FR-018 (future date prohibition).

### Alternatives Considered

- **Full ISO Timestamp Strings (`2026-11-18T14:32:00.000Z`) for Date Grouping**: Causes false mismatches when comparing dates across different UTC offsets.
- **Moment.js / Luxon**: Heavyweight libraries (70KB+ minified) that trigger bundle gate warnings and are unnecessary given native ES date capabilities.

---

## 4. Weekly Analytics & Mid-Week Habit Inception

### Decision

Standardize the analytics window on a 7-day calendar week (Monday 00:00 to Sunday 23:59).

#### Mathematical Formulation:

- **Eligible Habit Opportunity**: For any given day $D$ in the week $[W_{\text{start}}, W_{\text{end}}]$, a habit $H$ represents an active opportunity if and only if $D \ge \text{DateOnly}(H.\text{createdAt})$ and $H.\text{isActive} = \text{true}$ (or $H$ was active during that date).
- **Total Possible Opportunities ($O\_{\text{total}}$)**: Sum of daily eligible habit opportunities across all 7 days of the week.
- **Total Completed ($C\_{\text{total}}$)**: Count of completed records recorded for those habits during the week.
- **Weekly Completion Rate ($R$)**:
  $$R = \begin{cases} 0\% & \text{if } O_{\text{total}} = 0 \\ \operatorname{round}\left(\frac{C_{\text{total}}}{O_{\text{total}}} \times 100\right) & \text{if } O_{\text{total}} > 0 \end{cases}$$
- **Daily Distribution**: Map of Monday through Sunday to completed count.
- **Most Consistent Day**: Day of the week with the highest completion count (or highest completion percentage across all historical records, defaulting to `null` when 0 completions exist).

### Rationale

- Satisfies US4-S5 and FR-014 by preventing penalization of newly created habits for days prior to their inception.
- Eliminates division by zero ($0/0$) when a user has no active habits, rendering an empty state rather than `NaN%`.

### Alternatives Considered

- **Fixed $7 \times \text{totalHabits}$ Denominator**: Unfairly penalizes users who create their first habit on Friday by evaluating their week as $2 / (7 \times 1) = 28\%$ instead of $2 / (3 \times 1) = 67\%$.

---

## 5. Storage Persistence & Fault Tolerance Strategy

### Decision

Implement the Repository Pattern with browser `localStorage` as the primary persistence mechanism, wrapped with an in-memory session cache and comprehensive error resilience.

#### Repository Interface:

- `HabitRepository`: `getAllActive()`, `getById(id)`, `save(habit)`, `delete(id)`
- `CompletionLogRepository`: `getByHabitId(habitId)`, `getByDate(date)`, `getByDateRange(start, end)`, `toggleCompletion(habitId, date)`

#### Fault Resilience Workflow:

1. Every write operation is wrapped in a `try...catch` block inspecting for `DOMException.QUOTA_EXCEEDED_ERR` or security restriction exceptions.
2. Operations return a typed `StorageOperationResult<T>` containing:
   - `success`: boolean
   - `data`: T | null
   - `error`: StorageError | null ('QUOTA_EXCEEDED' | 'READ_ONLY' | 'DESERIALIZATION_ERROR')
   - `isRetainedInMemory`: boolean (always true on write failure so user can continue session uninterrupted)
3. If storage fails, an accessible UI toast/banner notifies the user with actionable guidance (e.g. "Storage full. Data saved in memory for this session; click to export backup").

### Rationale

- Fulfills FR-017, FR-021, and US1-S7 / US5-S4.
- In-memory fallback guarantees that user progress is never discarded mid-session due to browser quota limits.

### Alternatives Considered

- **Direct unabstracted `localStorage.setItem` in UI components**: Violates Clean Architecture, leaks storage implementation into views, and crashes on quota exhaustion.
- **IndexedDB**: Higher async orchestration overhead; habit tracking for an individual user (< 500 KB) is ideally suited for lightweight synchronous storage adapters.

---

## 6. UI Component Isolation & Impeccable Design Token Alignment

### Decision

Organize UI presentation components according to Atomic Design and the Impeccable UI Craft Lifecycle:

1. **One Component Per File**: Strictly one React component per file (`react/no-multi-comp`).
2. **Component Hierarchy**:
   - **Atoms**: `StreakBadge.tsx`, `CompletionToggle.tsx`, `StatusDot.tsx`, `CalendarDayCell.tsx`, `ProgressBar.tsx`
   - **Molecules**: `HabitCard.tsx`, `CalendarHeader.tsx`, `WeeklyMetricCard.tsx`, `DayDetailRow.tsx`
   - **Organisms**: `HabitList.tsx`, `CalendarGrid.tsx`, `WeeklyAnalyticsChart.tsx`, `HabitFormModal.tsx`, `DeleteConfirmationDialog.tsx`
3. **Impeccable Lifecycle**:
   - **Conception**: Design critique verifies WCAG AA contrast (4.5:1 text, 3:1 controls) and visual hierarchy.
   - **Robustness**: Empty states with friendly CTAs, loading skeletons, and error boundaries with retry triggers for every view.
   - **Polish**: Micro-interactions with CSS transitions honoring `@media (prefers-reduced-motion: reduce)`.
4. **Token Consistency**: All styling consumes CSS variables defined in `tokens.css` (`--color-primary`, `--color-surface`, `--radius-md`, etc.) aligned with Google Stitch designs.

### Rationale

- Complies with AGENTS.md, `vite.config.ts` complexity and function-length limits, and the non-negotiable quality gate requirements.
- Guarantees zero ghost classes and zero `@shadcn/lint` arbitrary value violations.

---

## 7. Technology Stack Summary

| Dimension               | Selected Technology            | Standard / Version                           |
| :---------------------- | :----------------------------- | :------------------------------------------- |
| **Language & Runtime**  | TypeScript                     | v5.8+, Strict Mode                           |
| **UI Framework**        | React                          | v19.0+                                       |
| **Bundler & Toolchain** | Vite+ (`vp`)                   | Oxlint, Oxfmt, VoidZero / Airbnb standard    |
| **CSS & Design Tokens** | Tailwind CSS + CSS Variables   | Google Stitch Tokens (`tokens.css`), WCAG AA |
| **Icons**               | Lucide React                   | v0.400+                                      |
| **Testing**             | Vitest & React Testing Library | Unit, Integration, Component contracts       |
| **Visual / E2E Audit**  | Playwright                     | Accessibility & Visual Regression Gates      |
