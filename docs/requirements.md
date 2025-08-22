# Project Requirements — Capacity Gantt

## 1. Purpose
Provide a day-based capacity planning and Gantt visualization library with:
- Hierarchical **Tasks**
- **Resources** with skills, weighted proficiency, and availability calendars
- **Assignments** with piecewise constant allocation (e.g., 10% → 30% → 100%)
- Drag-and-drop timeline editing (move and resize by days)
- Headless core suitable for other frameworks + React UI package

## 2. Users & Personas
- **Project/Delivery Managers:** plan and adjust schedules at day granularity.
- **Team Leads:** verify load vs availability and resolve over-allocations.
- **Developers/Designers:** view personal assignment breakdown (future scope).

## 3. Functional Requirements
### 3.1 Core (Headless)
1. Model **Task**, **Resource**, **Assignment**, **Calendar**.
2. Day-based utilities:
   - Expand planner days (`planStart` → `planEnd`)
   - Resource working-hours by date (work week + exceptions/holidays)
   - Allocation lookup per day from fragments
3. Aggregations:
   - Per-resource daily load (hours and % sum across parallel tasks)
4. Fragment normalization (sort, merge adjacent equal-% segments).
5. Deterministic, pure functions.

### 3.2 React UI
1. Virtualized-like (lightweight) **Gantt grid** with day columns.
2. **Task hierarchy** with indent levels.
3. **Drag and drop** on timeline:
   - Move entire task by whole days.
   - Resize start/end with snap-to-day.
4. **Zoom** control (change day width).
5. Timeline header with date labels.

### 3.3 Data
1. Demo dataset exercising:
   - Nested tasks
   - Multiple resources & calendars
   - Assignments with 10% → 30% → 100% etc.

### 3.4 Extensibility (future)
- Resource heatmap + over-allocation flags
- Dependency lines (FS/SS/FF/SF) and constraints
- Assignment editor (fragment timeline)
- Leveling hints (shift / rebalance / swap / split)
- Import/export JSON schema
- Accessibility-first keyboard ops

## 4. Non-Functional Requirements
- **TypeScript-first**, strict types.
- **Deterministic** headless engine.
- **Performance**: O(days × visible rows) rendering; array-backed day math.
- **Testability**: unit tests for date math, normalization, aggregation.
- **Styling**: Tailwind CSS, minimal custom CSS variables.
- **Packaging**: Nx monorepo with Vite for the demo app.

## 5. Constraints
- Time granularity = **day** (no hours).
- Inclusive `start`, exclusive `end` for date ranges.
- No external heavy DnD library—simple mouse handlers with snapping.

## 6. Deliverables
- `libs/capacity-core`: domain & helpers.
- `libs/capacity-react`: React components (Gantt, header), DnD.
- `apps/web`: demo app with mock data.
- `docs`: Requirements (this file) + Implementation Plan.
