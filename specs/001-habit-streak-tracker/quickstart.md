# Quickstart & Verification Guide: Daily Habit & Streak Tracker with Weekly Analytics

**Feature**: `001-habit-streak-tracker`  
**Date**: 2026-11-18  
**Status**: Ready for Implementation  
**Data Model**: [data-model.md](./data-model.md)  
**Contracts**: [contracts/](./contracts/)

---

## 1. Prerequisites & Environment Setup

- **Node.js**: v22.x LTS or higher
- **Package Manager / Runtime**: Vite+ (`vp`) or standard `npm`
- **Browser**: Evergreen Chromium, Firefox, or Safari with LocalStorage enabled

### Initial Setup Commands

```bash
# 1. Ensure clean git status on feature branch
git status

# 2. Install workspace dependencies
vp install || npm install

# 3. Verify clean architecture boundaries and type safety
bash .specify/scripts/bash/check-quality-gate.sh
```

---

## 2. Automated Quality Gates

Before and after every implementation task, run these four deterministic gates:

```bash
# Core Quality Gate: Oxfmt, Oxlint, strict types, vertical slice import boundaries, unit tests
bash .specify/scripts/bash/check-quality-gate.sh

# Performance & Production Bundle Budget: Chunks <= 250 KB, Total <= 1000 KB
bash .specify/scripts/bash/check-bundle-budget.sh

# Component & Route Contract Integrity
bash .specify/scripts/bash/check-contracts.sh

# Stitch Design Tokens & Playwright Visual Regression
bash .specify/scripts/bash/verify-stitch-design.sh --tokens-only
```

---

## 3. End-to-End Validation Scenarios

### Scenario 1: Habit Creation, Validation Boundaries & Normalization (US1)

**Goal**: Verify habit creation accepts valid titles, normalizes whitespace, rejects boundary violations, and blocks duplicate names.

1. **Happy Path Creation**:
   - Open tracker dashboard (`/`).
   - Click `[data-testid="habit-create-button"]`.
   - Enter title `"Read 30 Mins"`, select category `"learning"`, and submit `[data-testid="habit-submit-button"]`.
   - **Expected Outcome**: Modal closes; new habit card appears with title `"Read 30 Mins"`, incomplete toggle state, and streak badge `"0 days"`.
2. **Whitespace Normalization**:
   - Submit a habit with leading and trailing spaces: `"   Meditate   "`.
   - **Expected Outcome**: Created habit displays cleanly as `"Meditate"`.
3. **Empty / Whitespace-Only Boundary**:
   - Attempt to submit `"   "` or an empty title.
   - **Expected Outcome**: Form blocks submission; displays inline validation error: `"Habit title must be between 1 and 100 characters."`.
4. **100-Character Boundary**:
   - Enter a title with 101 characters.
   - **Expected Outcome**: Form blocks submission with error: `"Habit title cannot exceed 100 characters."`.
5. **Duplicate Name Prevention**:
   - Attempt to create `"read 30 mins"` (case-insensitive duplicate of existing `"Read 30 Mins"`).
   - **Expected Outcome**: Submission blocked with warning: `"A habit with this title already exists."`.

---

### Scenario 2: Daily Completion Toggle & Streak Incrementation (US1 & US2)

**Goal**: Verify that marking habits completed updates the UI immediately, increments current streaks, and handles yesterday-to-today streak logic.

1. **First-Day Completion**:
   - Click `[data-testid="habit-toggle-button"]` on habit `"Read 30 Mins"`.
   - **Expected Outcome**: Toggle reflects completed state instantly (< 50ms); current streak updates from `0 days` to `1 day`; best streak updates to `1 day`.
2. **Toggle Reversal (Undo)**:
   - Click the toggle button again.
   - **Expected Outcome**: Toggle returns to incomplete; current streak updates back to `0 days`.
3. **Consecutive Days Streak Calculation**:
   - Simulate/fixture a completion logged for yesterday (`T - 1`).
   - View habit today: current streak shows yesterday's count with status `PENDING_TODAY`.
   - Click toggle today: current streak increments by +1; status changes to `ACTIVE`.
4. **Streak Break Reset**:
   - Simulate a habit last completed 3 days ago.
   - Mark completed today.
   - **Expected Outcome**: Current streak resets to `1 day`; previous all-time best streak is preserved intact.

---

### Scenario 3: Monthly Calendar Visualization & Day Inspection (US3)

**Goal**: Verify calendar navigation, status indicators, and past-date breakdown inspection.

1. **Month Grid Rendering**:
   - Navigate to `/calendar` view.
   - **Expected Outcome**: Displays current month grid with 7 column headers (Mon–Sun). Days with all habits completed show complete indicators; partial days show partial indicators.
2. **Month Navigation**:
   - Click `[data-testid="calendar-prev-month"]` and `[data-testid="calendar-next-month"]`.
   - **Expected Outcome**: Grid updates smoothly to previous/next month with corresponding historical completions.
3. **Past Date Inspection**:
   - Click on yesterday's date cell `[data-testid="calendar-day-cell"]`.
   - **Expected Outcome**: Inspection panel `[data-testid="day-detail-panel"]` opens showing exact habit list and completion status for that date.
4. **Future Date Boundary**:
   - Click on tomorrow's date cell.
   - **Expected Outcome**: Marked as upcoming; pre-completing habits for future dates is strictly disabled.
5. **Zero-Habit Empty State**:
   - Access calendar with 0 created habits.
   - **Expected Outcome**: Friendly empty state `[data-testid="empty-state-calendar"]` displays with CTA to create first habit.

---

### Scenario 4: Weekly Analytics & Mathematical Precision (US4)

**Goal**: Verify weekly completion rate formula, mid-week inception handling, and day-of-week distribution.

1. **Standard Weekly Rate (67% Test Case - US4-S2)**:
   - Set up test state with 3 active habits across a 7-day week (total opportunities = $3 \times 7 = 21$).
   - Log 14 total completions across the week.
   - Navigate to `/analytics`.
   - **Expected Outcome**: Overall weekly completion card `[data-testid="analytics-rate-card"]` displays exactly **67%** ($\operatorname{round}(14 / 21 \times 100)$).
2. **Mid-Week Inception Test (US4-S5)**:
   - Create a habit on Thursday (4 days active in week: Thu, Fri, Sat, Sun).
   - Log 3 completions for this habit.
   - **Expected Outcome**: Opportunities evaluated as 4 (not 7); rate displays $3 / 4 = \mathbf{75\%}$ without prior-day penalty.
3. **Daily Distribution & Top Day**:
   - Verify day-by-day distribution chart renders Monday through Sunday totals.
   - Check `[data-testid="analytics-best-day"]` reflects the day with highest completed count.
4. **Zero-Completion State**:
   - View analytics for a week with 0 completions.
   - **Expected Outcome**: Empty state `[data-testid="empty-state-analytics"]` renders encouraging message with 0% rate without `NaN%` errors.

---

### Scenario 5: Habit Deletion Safeguard & Historical Archive (US5)

**Goal**: Verify explicit confirmation prompt prevents accidental deletion, and confirming deletion archives the habit.

1. **Trigger Confirmation**:
   - On habit card, click `[data-testid="habit-delete-button"]`.
   - **Expected Outcome**: Modal opens warning that habit will be removed from tracking.
2. **Cancel Safeguard**:
   - Click `[data-testid="delete-cancel-button"]`.
   - **Expected Outcome**: Modal closes; habit remains active and intact in list.
3. **Confirm Deletion**:
   - Open dialog and click `[data-testid="delete-confirm-button"]`.
   - **Expected Outcome**: Habit is immediately removed from active list; historical completions remain archived for calendar accuracy.

---

### Scenario 6: Storage Fault Resilience & In-Memory Fallback (US1-S7 & US5-S4)

**Goal**: Verify application survives `localStorage` quota exhaustion or security blocks without crashing.

1. **Simulate Storage Quota Error**:
   - Inject mock throwing `DOMException('QuotaExceededError')` in `HabitRepository.save()`.
   - Attempt to create or toggle a habit.
   - **Expected Outcome**:
     - No unhandled runtime exception.
     - Non-blocking alert banner `[data-testid="storage-error-alert"]` notifies user: _"Storage limit reached. Changes saved in memory for this session."_
     - UI state reflects the toggled change in local memory.
