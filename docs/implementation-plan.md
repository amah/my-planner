# Implementation Plan — Capacity Gantt (Nx)

## 1. Monorepo Layout
```
nx-capacity-gantt/
  apps/web/                # Vite demo app
  libs/capacity-core/      # Headless domain + engine helpers
  libs/capacity-react/     # React components + state (Zustand)
  docs/                    # Requirements & plan
```
Nx handles tasks: `build`, `serve`, `lint` per project.

## 2. Core Library (`libs/capacity-core`)
### 2.1 Types
- `Resource`, `Task`, `Assignment`, `AllocationFragment`, `PlannerConfig`, `Plan`.

### 2.2 Utilities
- Date helpers: `expandPlanDays`, `addDays`, `diffDays`, `fmt`.
- Calendars: `getWorkingHoursFor(resource, date, config)`.
- Allocation lookup: `pctOnDate(fragments, date)`.
- Aggregation: `aggregateResourceLoad(plan)`.
- Normalization: `normalizeFragments(fragments)`.

> Current scope implements these with day-level precision.

## 3. React Library (`libs/capacity-react`)
### 3.1 State (Zustand)
- `usePlannerState` provides:
  - `plan`, `days`, UI (`dayWidth`, `rowHeight`, `start`, `end`)
  - actions: `load(plan)`, `uiSetDayWidth`, `moveTaskByDays`, `resizeTaskEdge`

### 3.2 Components
- `TimelineHeader`: renders day labels and divides grid.
- `Gantt`: left task tree + right timeline grid + bars.
  - **DnD**:
    - bar drag → `moveTaskByDays`
    - left/right edge drag → `resizeTaskEdge`
  - Pixel→day conversion uses `dayWidth` and snaps by integer division.
  - Guard against inverted date ranges when resizing.

### 3.3 Accessibility & UX
- Large hit targets for resize handles (2px strip, can be expanded).
- Keyboard access (future): arrow keys to move/resize; ARIA labels.

## 4. Demo App (`apps/web`)
- Loads `demoPlan` with nested tasks, multiple assignments, and piecewise fragments.
- Zoom controls for day width.
- Header shows `MM-DD` slices for compactness.

## 5. Data Model Decisions
- **Exclusive `end` date** simplifies width by `end - start` days.
- Plan days pre-expanded to an array for direct index math.
- Hierarchical tasks are flattened for rendering; carry depth for indentation.

## 6. Timeline Drag & Drop
- Custom mouse handlers; maintains local drag state.
- Accumulates pixel motion and converts to whole-day deltas.
- On each day threshold crossed, commits state updates (snappy and deterministic).
- Resizing clamps so that `end > start` always holds.

## 7. Testing Strategy (Next Steps)
- Unit tests in `capacity-core`:
  - date math, fragment normalization, aggregation.
- Component tests in `capacity-react`:
  - Gantt bar layout for known tasks and day widths.
  - DnD handlers mocked mouse events.
- Axe-core integration in app (future) for a11y.

## 8. Performance Considerations
- Render cost mostly proportional to `visibleRows × visibleDays`.
- Future:
  - virtualize rows (react-window) and columns (windowed timeline)
  - memoize day cell grid and bar layout per zoom level.

## 9. Roadmap
1. **Now**: Core types/utilities, basic Gantt, DnD, demo (✅)
2. **Next**: Resource capacity heatmap + over-allocation highlighting
3. Dependencies & constraints + simple validations
4. Assignment editor UI with fragment timeline
5. Import/export schema + JSON validation
6. Leveling suggestions engine
7. Full keyboard a11y + tests + CI

## 10. How to Run
```bash
pnpm install
pnpm nx serve web
```
Open the browser tab that Vite launches. Drag bars or edges to edit. Use +/- to change day width.
