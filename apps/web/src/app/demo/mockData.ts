import { Plan } from '@capacity/core';

export const demoPlan: Plan = {
  config: {
    planStart: '2025-08-01',
    planEnd: '2025-10-01',
    hoursPerDayDefault: 8,
    workWeek: [1,2,3,4,5],
    holidays: ['2025-08-15']
  },
  resources: [
    {
      id: 'r1',
      name: 'Alice',
      skills: { frontend: 0.9, backend: 0.6 },
      calendar: { workingDays: [
        { weekday: 1, hours: 8 },{ weekday: 2, hours: 8 },
        { weekday: 3, hours: 8 },{ weekday: 4, hours: 8 },{ weekday: 5, hours: 8 },
      ]},
      maxParallelPct: 100
    },
    {
      id: 'r2',
      name: 'Bob',
      skills: { frontend: 0.5, backend: 0.9 },
      calendar: { workingDays: [
        { weekday: 1, hours: 8 },{ weekday: 2, hours: 8 },
        { weekday: 3, hours: 8 },{ weekday: 4, hours: 8 },{ weekday: 5, hours: 8 },
      ]},
      maxParallelPct: 120
    }
  ],
  tasks: [
    {
      id: 't1',
      name: 'Project Alpha',
      start: '2025-08-04',
      end: '2025-09-12',
      children: [
        { id: 't1.1', parentId: 't1', name: 'Frontend', start: '2025-08-04', end: '2025-08-29', effortHours: 64 },
        { id: 't1.2', parentId: 't1', name: 'Backend', start: '2025-08-11', end: '2025-09-12', effortHours: 96 },
      ]
    },
    {
      id: 't2',
      name: 'Project Beta',
      start: '2025-08-18',
      end: '2025-09-26',
      children: [
        { id: 't2.1', parentId: 't2', name: 'API', start: '2025-08-18', end: '2025-09-19', effortHours: 72 },
        { id: 't2.2', parentId: 't2', name: 'UI Polish', start: '2025-09-01', end: '2025-09-26', effortHours: 40 },
      ]
    }
  ],
  assignments: [
    {
      id: 'a1', taskId: 't1.1', resourceId: 'r1',
      start: '2025-08-04', end: '2025-08-29',
      fragments: [
        { start: '2025-08-04', end: '2025-08-08', pct: 10 },
        { start: '2025-08-11', end: '2025-08-15', pct: 30 },
        { start: '2025-08-18', end: '2025-08-30', pct: 100 },
      ]
    },
    {
      id: 'a2', taskId: 't1.2', resourceId: 'r2',
      start: '2025-08-11', end: '2025-09-12',
      fragments: [
        { start: '2025-08-11', end: '2025-08-29', pct: 50 },
        { start: '2025-09-01', end: '2025-09-13', pct: 80 },
      ]
    },
    {
      id: 'a3', taskId: 't2.1', resourceId: 'r2',
      start: '2025-08-18', end: '2025-09-19',
      fragments: [
        { start: '2025-08-18', end: '2025-09-06', pct: 60 },
        { start: '2025-09-08', end: '2025-09-20', pct: 40 },
      ]
    },
    {
      id: 'a4', taskId: 't2.2', resourceId: 'r1',
      start: '2025-09-01', end: '2025-09-26',
      fragments: [
        { start: '2025-09-01', end: '2025-09-12', pct: 40 },
        { start: '2025-09-15', end: '2025-09-27', pct: 70 },
      ]
    }
  ]
};
