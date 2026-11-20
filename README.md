# Habit Streak Tracker

A production-grade, local-first daily habit and streak tracking application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Hexagonal Architecture**.

---

## ⚡ 100% Autonomously Engineered

> **Autonomous Development Notice**:  
> This entire codebase was **engineered 100% autonomously** using the **[speckit-viteplus-stitch-bundle](https://github.com/victor-aunon/speckit-viteplus-stitch-bundle)** Spec-Driven Development (SDD) workflow.
>
> The agent orchestrated and executed the complete software engineering lifecycle without manual coding:
>
> 1. **Specification & Domain Modeling**: Requirements breakdown, schema definition, and contract creation (`specs/001-habit-streak-tracker/contracts/`).
> 2. **Design-to-Code Synthesis**: Pixel-accurate translation of Google Stitch design mockups into responsive, accessible components.
> 3. **Hexagonal Architecture**: Strict separation of concerns (Domain Models, Application Services, Ports & Adapters, Presentation Layer).
> 4. **Test-Driven Development (TDD)**: Comprehensive unit and integration test suites written and validated before production code.
> 5. **Iterative Refinement**: Autonomous debugging, cross-device data portability, and high-craft motion design.

---

## ✨ Key Capabilities

- **Daily Habit Tracking**: Instant completion toggles with optimistic state updates and in-memory fallback resilience.
- **Empowered Streak Engine**: Progression tiers that scale as consistency builds:
  - **Daily Spark** (1–6 days)
  - **Weekly Power** (7–29 days): Distinct flame ember glow and milestone celebrations (`7d`, `14d`, `21d`).
  - **Monthly Mastery** (30+ days): Golden crown badge and prestige mastery status (`30d`, `60d`).
- **Interactive Calendar Matrix**: 35/42-cell monthly history view with zero-penalty habit inception (days prior to habit creation are never penalized as missed).
- **Weekly Analytics**: Real-time 7-day completion rate calculations, distribution charts, and consistency day identification.
- **Local-First Data Portability**: Complete backup export and restore via structured JSON files—enabling instant migration to other devices without external databases or server infrastructure.
- **Delight & Motion Design**: Authored micro-interactions including 8-directional physical energy spark bursts, tactile spring checkmarks, and new-habit arrival animations, fully compliant with WCAG AA `prefers-reduced-motion`.

---

## 🏗️ Architecture Overview

The system strictly adheres to **Ports and Adapters (Hexagonal Architecture)** to ensure business logic remains pure and decoupled from infrastructure:

```
src/
├── core/                       # Shared kernel, composition root, layout & navigation
│   ├── domain/                 # UTC-anchored date arithmetic & StorageOperationResult contracts
│   └── services.ts             # Composition root wiring repositories to application services
└── features/habits/
    ├── tracking/               # Habit lifecycle, creation, deletion & daily toggle
    │   ├── domain/             # Habit & CompletionRecord entities
    │   ├── application/        # HabitRepositoryPort & HabitTrackingService
    │   ├── infrastructure/     # LocalStorage repositories with quota resilience
    │   └── ui/                 # HabitCard, CompletionToggle, HabitList, HabitFormModal
    ├── streaks/                # Pure streak calculation engine & milestone tiers
    │   ├── domain/             # StreakEngine & StreakMilestones logic
    │   └── ui/                 # StreakBadge with dynamic strength tier indicators
    ├── calendar-history/       # Monthly calendar grid projection & inspection
    │   ├── domain/             # CalendarMatrixEngine & DayCompletionStatus
    │   └── ui/                 # CalendarGrid, CalendarDayCell, DayDetailInspection
    ├── weekly-analytics/       # Weekly aggregation & performance analytics
    │   ├── domain/             # AnalyticsEngine & WeeklyAnalyticsAggregate
    │   └── ui/                 # WeeklyAnalyticsView
    └── backup/                 # Data portability & local-first migration
        ├── domain/             # BackupData payload validation & serialization
        ├── application/        # BackupService orchestrating export and restore
        └── ui/                 # ExportImportModal
```

---

## 🧪 Quality & Verification

Every feature and bug fix is safeguarded by automated tests:

- **Unit & Integration Suite**: 69 automated tests across 16 test files covering domain mathematics, persistence adapters, and component interactions.
- **Strict Typing**: 100% type-safe TypeScript (`tsc --noEmit` clean).
- **Accessibility**: Semantic HTML5, ARIA labels/states (`aria-pressed`, `role="dialog"`), and keyboard navigation.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd habit-tracker

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

### Running Tests

```bash
npm test
```

### Type Checking

```bash
npx tsc --noEmit
```
