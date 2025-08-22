// Core domain & minimal engine helpers (day-based)
export type ISODate = string; // 'YYYY-MM-DD'

export type WorkingDay = { weekday: 0|1|2|3|4|5|6; hours: number };
export type ExceptionDay = { date: ISODate; hours: number };

export type Resource = {
  id: string;
  name: string;
  skills: Record<string, number>;
  calendar: {
    workingDays: WorkingDay[];
    exceptions?: ExceptionDay[];
    timezone?: string;
  };
  maxParallelPct?: number;
};

export type Task = {
  id: string;
  parentId?: string;
  name: string;
  start: ISODate;
  end: ISODate; // exclusive
  effortHours?: number;
  children?: Task[];
  status?: 'planned'|'in_progress'|'done'|'blocked';
};

export type AllocationFragment = { start: ISODate; end: ISODate; pct: number };
export type Assignment = {
  id: string; taskId: string; resourceId: string;
  start: ISODate; end: ISODate; fragments: AllocationFragment[]; role?: string;
};

export type PlannerConfig = {
  planStart: ISODate; planEnd: ISODate; hoursPerDayDefault: number; workWeek: (0|1|2|3|4|5|6)[];   holidays?: ISODate[];
};

export type Plan = {
  config: PlannerConfig;
  resources: Resource[];
  tasks: Task[];
  assignments: Assignment[];
};

// ---- Date utils ----
const d = (s: ISODate) => new Date(s + 'T00:00:00Z');
export const fmt = (dt: Date) => dt.toISOString().slice(0,10);
export const addDays = (dt: Date, n: number) => { const t = new Date(dt); t.setUTCDate(t.getUTCDate()+n); return t; };
export const diffDays = (a: ISODate, b: ISODate) => Math.round((d(b).getTime()-d(a).getTime())/86400000);
export const clampRange = (date: ISODate, start: ISODate, end: ISODate) => (date >= start && date < end);

// Expand days in [planStart, planEnd)
export const expandPlanDays = (cfg: PlannerConfig): ISODate[] => {
  const out: ISODate[] = [];
  let cur = d(cfg.planStart);
  const until = d(cfg.planEnd);
  while (cur < until) { out.push(fmt(cur)); cur = addDays(cur, 1); }
  return out;
};

// Working hours for a resource on a date (simple day-of-week + exceptions override)
export function getWorkingHoursFor(resource: Resource, date: ISODate, cfg: PlannerConfig): number {
  const dow = d(date).getDay() as 0|1|2|3|4|5|6;
  const ex = resource.calendar.exceptions?.find(e => e.date === date);
  if (ex) return ex.hours;
  const wd = resource.calendar.workingDays.find(w => w.weekday === dow);
  if (!wd) return 0;
  return wd.hours ?? cfg.hoursPerDayDefault;
}

// Percent on date from fragments
export function pctOnDate(fragments: AllocationFragment[], date: ISODate): number {
  for (const f of fragments) if (clampRange(date, f.start, f.end)) return f.pct;
  return 0;
}

// Aggregate resource load from assignments (sum pct, convert to hours by resource calendar)
export function aggregateResourceLoad(plan: Plan) {
  const days = expandPlanDays(plan.config);
  const perRes: Record<string, Record<ISODate, { usedHours: number; usedPct: number }>> = {};
  for (const a of plan.assignments) {
    const res = plan.resources.find(r => r.id === a.resourceId);
    if (!res) continue;
    for (const date of days) {
      if (!clampRange(date, a.start, a.end)) continue;
      const pct = pctOnDate(a.fragments, date);
      if (pct <= 0) continue;
      const wh = getWorkingHoursFor(res, date, plan.config);
      const usedH = wh * pct / 100;
      const rload = (perRes[res.id] ||= {});
      const cell = (rload[date] ||= { usedHours: 0, usedPct: 0 });
      cell.usedHours += usedH;
      cell.usedPct += pct;
    }
  }
  return perRes;
}

// Utilization of the whole plan per day: 0.0 .. 1.0 (100%); can exceed 1.0 if overloaded
export function computePlanDailyUtilization(plan: Plan): Record<ISODate, number> {
  const days = expandPlanDays(plan.config);
  const usedByRes = aggregateResourceLoad(plan); // {resId:{date:{usedHours}}}
  const out: Record<ISODate, number> = {};
  for (const day of days) {
    let totalCap = 0;
    let totalUsed = 0;
    for (const res of plan.resources) {
      const cap = getWorkingHoursFor(res, day, plan.config);
      totalCap += cap;
      const used = usedByRes[res.id]?.[day]?.usedHours ?? 0;
      totalUsed += used;
    }
    out[day] = totalCap > 0 ? totalUsed / totalCap : 0;
  }
  return out;
}

// Normalize fragments: order, merge equal % touching, clamp
export function normalizeFragments(frags: AllocationFragment[]): AllocationFragment[] {
  const s = [...frags].sort((a,b) => a.start.localeCompare(b.start));
  const out: AllocationFragment[] = [];
  for (const f of s) {
    if (!out.length) { out.push({...f}); continue; }
    const last = out[out.length - 1];
    if (last.end === f.start && last.pct === f.pct) {
      last.end = f.end;
    } else {
      out.push({...f});
    }
  }
  return out;
}
