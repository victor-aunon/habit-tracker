# Data Model Specification: Daily Habit & Streak Tracker with Weekly Analytics

**Feature**: `001-habit-streak-tracker`  
**Date**: 2026-11-18  
**Status**: Completed  
**Spec Reference**: `specs/001-habit-streak-tracker/spec.md`

---

## 1. Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────┐
│              HABIT              │
├─────────────────────────────────┤
│ id: string (UUIDv4, PK)         │
│ title: string (1-100 chars)     │
│ description: string | null      │
│ category: HabitCategory         │
│ createdAt: ISO8601 string       │
│ updatedAt: ISO8601 string       │
│ isActive: boolean               │
└───────────────┬─────────────────┘
                │ 1
                │
                │ 0..*
┌───────────────▼─────────────────┐
│        COMPLETION RECORD        │
├─────────────────────────────────┤
│ id: string (UUIDv4, PK)         │
│ habitId: string (FK -> Habit)   │
│ date: string (YYYY-MM-DD)       │
│ completedAt: ISO8601 string     │
└─────────────────────────────────┘
```

---

## 2. Core Entities

### 2.1 Habit Entity (`src/features/habits/tracking/domain/Habit.ts`)

Represents a recurring daily habit defined by the user.

| Field         | Type             | Required | Constraints / Validation                                                                  | Description                                  |
| :------------ | :--------------- | :------: | :---------------------------------------------------------------------------------------- | :------------------------------------------- |
| `id`          | `string`         |   Yes    | UUID v4 format                                                                            | Unique identifier for the habit              |
| `title`       | `string`         |   Yes    | 1–100 chars, trimmed, unique among active habits (case-insensitive)                       | Display title of the habit                   |
| `description` | `string \| null` |    No    | Max 250 chars                                                                             | Optional user notes or guidance              |
| `category`    | `HabitCategory`  |   Yes    | Enum: `'health' \| 'fitness' \| 'productivity' \| 'mindfulness' \| 'learning' \| 'other'` | Categorical grouping for filtering/styling   |
| `createdAt`   | `string`         |   Yes    | ISO 8601 UTC string (`YYYY-MM-DDTHH:mm:ss.sssZ`)                                          | Timestamp when the habit was created         |
| `updatedAt`   | `string`         |   Yes    | ISO 8601 UTC string (`YYYY-MM-DDTHH:mm:ss.sssZ`)                                          | Timestamp of last modification               |
| `isActive`    | `boolean`        |   Yes    | Default: `true`                                                                           | Soft deletion indicator (false when deleted) |

#### Validation Rules & Business Invariants:

- **Title Normalization**: Must be trimmed of leading and trailing whitespace before evaluation.
- **Empty Title Rejection**: Reject strings where `trimmedTitle.length === 0` (FR-019).
- **Maximum Length**: Reject strings where `trimmedTitle.length > 100` (FR-019, US1-S5).
- **Case-Insensitive Uniqueness**: Reject creation if another active habit (`isActive: true`) exists where `normalized(existing.title) === normalized(newTitle)` (FR-020, US1-S6).
- **Immutability of Inception**: `createdAt` cannot be modified after initial creation; used to anchor weekly opportunity math (US4-S5).

---

### 2.2 Completion Record Entity (`src/features/habits/tracking/domain/CompletionRecord.ts`)

Represents an individual historical instance of a completed habit on a calendar day.

| Field         | Type     | Required | Constraints / Validation                           | Description                            |
| :------------ | :------- | :------: | :------------------------------------------------- | :------------------------------------- |
| `id`          | `string` |   Yes    | UUID v4 format                                     | Unique record identifier               |
| `habitId`     | `string` |   Yes    | Must reference a valid `Habit.id`                  | Target habit identifier                |
| `date`        | `string` |   Yes    | Regex: `^\d{4}-\d{2}-\d{2}$` (e.g. `'2026-11-18'`) | Calendar date string in local timezone |
| `completedAt` | `string` |   Yes    | ISO 8601 UTC string                                | Exact timestamp when toggle was logged |

#### Validation Rules & Business Invariants:

- **No Future Dates**: `date <= localDateToday(new Date())`. Attempts to log completions for tomorrow or later must throw validation error (FR-018, US3-S4).
- **Compound Uniqueness**: At most one `CompletionRecord` may exist per `(habitId, date)` tuple. Toggling an existing completion deletes the record rather than duplicating it (US1-S3).

---

## 3. Value Objects & Projections

### 3.1 Streak Summary (`src/features/habits/streaks/domain/StreakSummary.ts`)

Calculated projection encapsulating streak metrics for a specific habit.

| Field               | Type             | Description                                                        |
| :------------------ | :--------------- | :----------------------------------------------------------------- |
| `habitId`           | `string`         | Target habit identifier                                            |
| `currentStreak`     | `number`         | Consecutive days completed up to today or yesterday (integer >= 0) |
| `bestStreak`        | `number`         | All-time longest consecutive days completed (integer >= 0)         |
| `lastCompletedDate` | `string \| null` | Most recent completion date string (`YYYY-MM-DD`), or null         |
| `status`            | `StreakStatus`   | Enum: `'ACTIVE' \| 'PENDING_TODAY' \| 'BROKEN' \| 'UNSTARTED'`     |

#### State Definitions:

- `'ACTIVE'`: Completed today ($T_0$). Current streak is incremented and secured for today.
- `'PENDING_TODAY'`: Completed yesterday ($T_{-1}$), but not yet completed today ($T_0$). Streak is held at yesterday's count without penalty (FR-007, US2-S2).
- `'BROKEN'`: Missed both today and yesterday. Current streak is 0. Next completion resets streak to 1 (FR-008, US2-S3).
- `'UNSTARTED'`: Habit has zero logged completions. Current streak is 0, best streak is 0 (US2-S5).

---

### 3.2 Day Completion Status (`src/features/habits/calendar-history/domain/DayCompletionStatus.ts`)

Calendar matrix cell projection representing aggregated habit performance for a specific calendar date.

| Field                | Type                    | Description                                                                         |
| :------------------- | :---------------------- | :---------------------------------------------------------------------------------- |
| `date`               | `string`                | Calendar date string (`YYYY-MM-DD`)                                                 |
| `status`             | `DayStatus`             | Enum: `'ALL_COMPLETED' \| 'PARTIALLY_COMPLETED' \| 'NONE_COMPLETED' \| 'NO_HABITS'` |
| `completedCount`     | `number`                | Total habits completed on this date                                                 |
| `totalHabitsTracked` | `number`                | Total habits that were active on this date                                          |
| `habitBreakdown`     | `Array<HabitDayDetail>` | List of habit items with completion flag for date inspection                        |

#### Status Resolution Logic:

```typescript
if (totalHabitsTracked === 0) return 'NO_HABITS';
if (completedCount === totalHabitsTracked) return 'ALL_COMPLETED';
if (completedCount > 0) return 'PARTIALLY_COMPLETED';
return 'NONE_COMPLETED';
```

---

### 3.3 Weekly Analytics Aggregate (`src/features/habits/weekly-analytics/domain/WeeklyAnalyticsAggregate.ts`)

Analytical projection evaluating performance over a 7-day calendar week (Monday through Sunday).

| Field                      | Type                        | Description                                                       |
| :------------------------- | :-------------------------- | :---------------------------------------------------------------- |
| `weekStartDate`            | `string`                    | Monday date string (`YYYY-MM-DD`)                                 |
| `weekEndDate`              | `string`                    | Sunday date string (`YYYY-MM-DD`)                                 |
| `totalOpportunities`       | `number`                    | Total scheduled habit instances active during the week            |
| `totalCompleted`           | `number`                    | Total habit completions logged during the week                    |
| `completionRatePercentage` | `number`                    | Rate as integer percentage (0–100)                                |
| `dailyDistribution`        | `Record<DayOfWeek, number>` | Completion counts keyed by `'Monday'`, `'Tuesday'`, etc.          |
| `mostConsistentDay`        | `DayOfWeek \| null`         | Top-performing day of the week, or `null` if 0 completions        |
| `hasCompletions`           | `boolean`                   | `true` if `totalCompleted > 0`; triggers empty state when `false` |

#### Rate Calculation Formula:

$$\text{completionRatePercentage} = \begin{cases} 0 & \text{if } \text{totalOpportunities} = 0 \\ \operatorname{round}\left(\frac{\text{totalCompleted}}{\text{totalOpportunities}} \times 100\right) & \text{otherwise} \end{cases}$$

_Example Verification_: 14 completions out of 21 opportunities yields $\operatorname{round}(14 / 21 \times 100) = \operatorname{round}(66.666\dots) = \mathbf{67\%}$ (US4-S2).

---

### 3.4 Storage Operation Result (`src/core/domain/StorageOperationResult.ts`)

Result wrapper for all infrastructure persistence transactions.

```typescript
export type StorageErrorCode = 'QUOTA_EXCEEDED' | 'READ_ONLY' | 'DESERIALIZATION_ERROR' | 'UNKNOWN';

export interface StorageError {
  readonly code: StorageErrorCode;
  readonly message: string;
  readonly originalError?: unknown;
}

export interface StorageOperationResult<T> {
  readonly success: boolean;
  readonly data: T | null;
  readonly error: StorageError | null;
  readonly isRetainedInMemory: boolean;
}
```

---

## 4. State Transitions

### 4.1 Habit Lifecycle

```
[ Form Submission ]
       │
       ▼ (validate title, category)
┌──────────────┐
│    ACTIVE    │ ◄────────────────────────┐
└──────┬───────┘                          │
       │                                  │
       ▼ (Initiate Deletion)              │ (Cancel Confirmation)
┌───────────────────────────┐             │
│ DELETION_CONFIRM_PENDING  ├─────────────┘
└──────────┬────────────────┘
           │ (Confirm Deletion)
           ▼
┌───────────────────────────┐
│     DELETED / ARCHIVED    │ (Removed from active tracking;
└───────────────────────────┘  historical completions archived)
```

### 4.2 Daily Completion Toggle

```
                    [ Today: Incomplete ]
                              │
                              │ (User clicks toggle)
                              ▼
                    [ Today: Completed ]
                     - Record created
                     - Current streak increments
                     - Best streak updates if current > best
                              │
                              │ (User clicks toggle again)
                              ▼
                    [ Today: Incomplete ]
                     - Record removed
                     - Current streak recalculated
```
