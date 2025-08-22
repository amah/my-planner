import { create } from 'zustand';
import { Plan, ISODate, expandPlanDays, fmt, addDays, diffDays, Task } from '@capacity/core';

type UIState = {
  dayWidth: number; // px per day
  rowHeight: number;
  start: ISODate;
  end: ISODate;
}

type PlannerState = {
  plan: Plan | null;
  days: ISODate[];
  ui: UIState;
  load: (plan: Plan) => void;
  uiSetDayWidth: (w: number) => void;
  moveTaskByDays: (taskId: string, deltaDays: number) => void;
  resizeTaskEdge: (taskId: string, edge: 'start'|'end', deltaDays: number) => void;
};

function updateTask(tasks: Task[], id: string, mut: (t: Task) => void): Task[] {
  return tasks.map(t => {
    if (t.id === id) {
      const copy: Task = { ...t };
      mut(copy);
      return copy;
    }
    if (t.children?.length) {
      return { ...t, children: updateTask(t.children, id, mut) };
    }
    return t;
  });
}

export const usePlannerState = create<PlannerState>((set, get) => ({
  plan: null,
  days: [],
  ui: { dayWidth: 26, rowHeight: 32, start: '2025-08-01', end: '2025-10-01' },
  load: (plan) => set(() => ({
    plan,
    days: expandPlanDays(plan.config),
    ui: { dayWidth: 26, rowHeight: 32, start: plan.config.planStart, end: plan.config.planEnd }
  })),
  uiSetDayWidth: (w) => set((s) => ({ ui: { ...s.ui, dayWidth: Math.max(10, Math.min(64, w)) } })),
  moveTaskByDays: (taskId, deltaDays) => set((s) => {
    if (!s.plan || deltaDays === 0) return {};
    const tasks = updateTask(s.plan.tasks, taskId, (t) => {
      const ns = fmt(addDays(new Date(t.start + 'T00:00:00'), deltaDays));
      const ne = fmt(addDays(new Date(t.end + 'T00:00:00'), deltaDays));
      t.start = ns; t.end = ne;
    });
    return { plan: { ...s.plan, tasks } };
  }),
  resizeTaskEdge: (taskId, edge, deltaDays) => set((s) => {
    if (!s.plan || deltaDays === 0) return {};
    const tasks = updateTask(s.plan.tasks, taskId, (t) => {
      if (edge === 'start') {
        const nd = fmt(addDays(new Date(t.start + 'T00:00:00'), deltaDays));
        // Prevent inverting
        if (diffDays(nd, t.end) > 0) t.start = nd;
      } else {
        const nd = fmt(addDays(new Date(t.end + 'T00:00:00'), deltaDays));
        if (diffDays(t.start, nd) > 0) t.end = nd;
      }
    });
    return { plan: { ...s.plan, tasks } };
  }),
}));
