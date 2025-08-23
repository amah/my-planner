import React from 'react';
import { usePlannerState } from '../state';
import { Task } from '@capacity/core';
import { format } from 'date-fns';

type DragState = null | {
  type: 'move' | 'resize-start' | 'resize-end';
  taskId: string;
  startX: number;      // mouse x at mousedown (anchor)
  appliedDays: number; // whole days already applied during this drag
};

/** Find a task by id in a hierarchical task list */
function findTaskById(tasks: Task[], id: string): Task | null {
  for (const t of tasks) {
    if (t.id === id) return t;
    if (t.children?.length) {
      const hit = findTaskById(t.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Day difference: (b - a) in whole days */
function daysBetween(aIso: string, bIso: string) {
  const a = new Date(aIso + 'T00:00:00');
  const b = new Date(bIso + 'T00:00:00');
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function useDragLogic() {
  const ui = usePlannerState((s) => s.ui);
  const plan = usePlannerState((s) => s.plan)!;
  const moveTaskByDays = usePlannerState((s) => s.moveTaskByDays);
  const resizeTaskEdge = usePlannerState((s) => s.resizeTaskEdge);
  const [drag, setDrag] = React.useState<DragState>(null);

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!drag) return;

      const task = findTaskById(plan.tasks, drag.taskId);
      if (!task) return;

      // Desired whole-day delta since drag began (no 1/2-day deadzone)
      const raw = (e.clientX - drag.startX) / ui.dayWidth;
      const desiredDays = Math.round(raw);

      // What we still need to apply on this tick
      let step = desiredDays - drag.appliedDays;
      if (step === 0) return;

      if (drag.type === 'move') {
        // Max allowed move so we stay within [planStart, planEnd] (end is exclusive)
        const maxRight = daysBetween(task.end, plan.config.planEnd);           // ≥ 0
        const maxLeft  = -daysBetween(plan.config.planStart, task.start);      // ≤ 0
        const clamped  = Math.max(Math.min(step, maxRight), maxLeft);
        
        
        if (clamped !== 0) {
          moveTaskByDays(task.id, clamped);
          setDrag({ ...drag, appliedDays: drag.appliedDays + clamped });
        }
        return;
      }

      if (drag.type === 'resize-start') {
        // Keep start within [planStart, end-1]
        const widthDays = daysBetween(task.start, task.end); // current width
        const maxRight  = widthDays - 1;                                     // shrink left edge rightwards
        const maxLeft   = -daysBetween(plan.config.planStart, task.start);   // extend leftwards to planStart
        const clamped   = Math.max(Math.min(step, maxRight), maxLeft);
        if (clamped !== 0) {
          resizeTaskEdge(task.id, 'start', clamped);
          setDrag({ ...drag, appliedDays: drag.appliedDays + clamped });
        }
        return;
      }

      if (drag.type === 'resize-end') {
        // Keep end within [start+1, planEnd] (end is exclusive)
        const widthDays = daysBetween(task.start, task.end);
        const maxLeft   = -(widthDays - 1);                                  // shrink right edge leftwards
        const maxRight  = daysBetween(task.end, plan.config.planEnd);        // extend rightwards to planEnd
        const clamped   = Math.max(Math.min(step, maxRight), maxLeft);
        if (clamped !== 0) {
          resizeTaskEdge(task.id, 'end', clamped);
          setDrag({ ...drag, appliedDays: drag.appliedDays + clamped });
        }
        return;
      }
    }

    function onUp() {
      setDrag(null);
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, ui.dayWidth, plan, moveTaskByDays, resizeTaskEdge]);

  return { setDrag };
}

function flattenTasks(tasks: Task[], depth = 0): Array<{ task: Task; depth: number }> {
  const out: Array<{ task: Task; depth: number }> = [];
  for (const t of tasks) {
    out.push({ task: t, depth });
    if (t.children?.length) out.push(...flattenTasks(t.children, depth + 1));
  }
  return out;
}

export function Gantt() {
  const plan = usePlannerState((s) => s.plan);
  const days = usePlannerState((s) => s.days);
  const ui = usePlannerState((s) => s.ui);
  const { setDrag } = useDragLogic();
  
  if (!plan) return null;
  const rows = flattenTasks(plan.tasks);

  // Generate months for header
  const months: { key: string; startIso: string; count: number }[] = [];
  let lastKey = '';
  days.forEach((iso) => {
    const key = iso.slice(0, 7); // yyyy-MM
    if (key !== lastKey) {
      months.push({ key, startIso: iso, count: 1 });
      lastKey = key;
    } else {
      months[months.length - 1].count++;
    }
  });

  const monthLabel = (iso: string, px: number) => {
    const dt = new Date(iso + 'T00:00:00');
    return px < 60 ? format(dt, 'MMM') : format(dt, 'MMM yyyy');
  };

  const dayIndex = (date: string) => Math.max(0, days.findIndex((d) => d === date));
  const widthDays = (start: string, end: string) => {
    const si = dayIndex(start), ei = Math.max(si + 1, dayIndex(end));
    return ei - si;
  };

  return (
      <div className="flex max-h-96 border">
        {/* Fixed Task Column */}
        <div className="w-64 shrink-0 border-r bg-white">
          {/* Task Header - Match calendar header height exactly */}
          <div className="bg-white sticky top-0 z-20 border-b">
            <div className="flex items-center h-[var(--row-h)] px-2 text-sm font-medium border-b border-neutral-200">
              Tasks
            </div>
            <div className="h-[var(--row-h)]"></div>
          </div>
          
          {/* Task Names */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(24rem - 2 * var(--row-h) - 1px)' }}>
            {rows.map(({ task, depth }) => (
                <div
                    key={task.id}
                    className="flex items-center h-[var(--row-h)] px-2 border-b text-sm"
                >
                  <div style={{ paddingLeft: depth * 12 }} className="truncate">
                    {task.name}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline Area */}
        <div className="flex-1 overflow-auto">
          <div style={{ minWidth: `${days.length * ui.dayWidth}px` }}>
            {/* Timeline Header - Sticky */}
            <div className="flex flex-col border-b bg-white sticky top-0 z-10">
              {/* Row 1: months */}
              <div className="flex border-b border-neutral-200 h-[var(--row-h)]">
                <div className="flex">
                  {months.map((m) => {
                    const w = m.count * ui.dayWidth;
                    return (
                      <div
                        key={m.key}
                        className="text-xs text-center border-r bg-neutral-50 whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center"
                        style={{ width: w, height: 'var(--row-h)' }}
                        title={monthLabel(m.startIso, w)}
                      >
                        {monthLabel(m.startIso, w)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: days */}
              <div className="flex h-[var(--row-h)]">
                <div className="flex">
                  {days.map((iso) => {
                    const dt = new Date(iso + 'T00:00:00');
                    return (
                      <div
                        key={iso}
                        className="text-[10px] text-center text-neutral-500 border-r tabular-nums whitespace-nowrap overflow-hidden flex items-center justify-center"
                        style={{ width: ui.dayWidth, height: 'var(--row-h)' }}
                        title={iso}
                      >
                        {format(dt, 'dd')}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Timeline Grid Content */}
            <div className="relative">
              {/* Grid background using repeating gradient — EXACTLY every ui.dayWidth px */}
              <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                  repeating-linear-gradient(
                    to right,
                    #e5e7eb 0,
                    #e5e7eb 1px,
                    transparent 1px,
                    transparent ${ui.dayWidth}px
                  )
                `,
                  }}
              />

              {/* Task Rows */}
              <div>
                {rows.map(({ task }) => {
                  const leftDays = dayIndex(task.start);
                  const wDays = widthDays(task.start, task.end);
                  const left = leftDays * ui.dayWidth;
                  const width = wDays * ui.dayWidth;

                  return (
                      <div
                          key={task.id}
                          className="relative border-b"
                          style={{ height: 'var(--row-h)' }}
                      >
                        <div
                            className="absolute top-1 bottom-1 rounded-md shadow-sm select-none bg-blue-500/80 hover:bg-blue-500 cursor-grab active:cursor-grabbing"
                            style={{ left, width }}
                            onMouseDown={(e) => {
                              e.preventDefault(); // avoid text selection
                              setDrag({
                                type: 'move',
                                taskId: task.id,
                                startX: e.clientX,
                                appliedDays: 0,
                              });
                            }}
                            title={`${task.start} → ${task.end}`}
                        >
                          {/* Resize handles */}
                          <div
                              className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDrag({
                                  type: 'resize-start',
                                  taskId: task.id,
                                  startX: e.clientX,
                                  appliedDays: 0,
                                });
                              }}
                          />
                          <div
                              className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDrag({
                                  type: 'resize-end',
                                  taskId: task.id,
                                  startX: e.clientX,
                                  appliedDays: 0,
                                });
                              }}
                          />
                          {/* Label */}
                          <div className="h-full flex items-center px-2 text-white text-xs">
                            {task.name}
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
