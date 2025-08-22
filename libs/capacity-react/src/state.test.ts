import { usePlannerState } from './state';
import { Plan } from '@capacity/core';
import { renderHook, act } from '@testing-library/react';

const mockPlan: Plan = {
  config: {
    planStart: '2025-08-01',
    planEnd: '2025-10-01',
    hoursPerDayDefault: 8,
    workWeek: [1, 2, 3, 4, 5],
  },
  resources: [],
  assignments: [],
  tasks: [
    {
      id: 't1',
      name: 'Parent Task',
      start: '2025-08-04',
      end: '2025-08-29',
      children: [
        {
          id: 't1.1',
          parentId: 't1',
          name: 'Child Task',
          start: '2025-08-04',
          end: '2025-08-29',
        },
      ],
    },
  ],
};

describe('PlannerState - Task Movement', () => {
  it('should move task to the right by specified days', () => {
    const { result } = renderHook(() => usePlannerState());
    
    // Load the plan
    act(() => {
      result.current.load(mockPlan);
    });

    // Get initial task dates
    const initialTask = result.current.plan!.tasks[0].children![0];
    expect(initialTask.start).toBe('2025-08-04');
    expect(initialTask.end).toBe('2025-08-29');

    // Move task 1 day to the right
    act(() => {
      result.current.moveTaskByDays('t1.1', 1);
    });

    // Verify task moved
    const movedTask = result.current.plan!.tasks[0].children![0];
    expect(movedTask.start).toBe('2025-08-05');
    expect(movedTask.end).toBe('2025-08-30');
  });

  it('should move task multiple days to the right', () => {
    const { result } = renderHook(() => usePlannerState());
    
    act(() => {
      result.current.load(mockPlan);
    });

    // Move task 5 days to the right
    act(() => {
      result.current.moveTaskByDays('t1.1', 5);
    });

    const movedTask = result.current.plan!.tasks[0].children![0];
    expect(movedTask.start).toBe('2025-08-09');
    expect(movedTask.end).toBe('2025-09-03');
  });

  it('should move task to the left by specified days', () => {
    const { result } = renderHook(() => usePlannerState());
    
    act(() => {
      result.current.load(mockPlan);
    });

    // Move task 1 day to the left
    act(() => {
      result.current.moveTaskByDays('t1.1', -1);
    });

    const movedTask = result.current.plan!.tasks[0].children![0];
    expect(movedTask.start).toBe('2025-08-03');
    expect(movedTask.end).toBe('2025-08-28');
  });

  it('should handle multiple consecutive moves to the right', () => {
    const { result } = renderHook(() => usePlannerState());
    
    act(() => {
      result.current.load(mockPlan);
    });

    // Simulate what happens during drag: multiple consecutive 1-day moves
    act(() => {
      result.current.moveTaskByDays('t1.1', 1);
    });
    
    let task = result.current.plan!.tasks[0].children![0];
    expect(task.start).toBe('2025-08-05');
    expect(task.end).toBe('2025-08-30');

    act(() => {
      result.current.moveTaskByDays('t1.1', 1);
    });
    
    task = result.current.plan!.tasks[0].children![0];
    expect(task.start).toBe('2025-08-06');
    expect(task.end).toBe('2025-08-31');

    act(() => {
      result.current.moveTaskByDays('t1.1', 1);
    });
    
    task = result.current.plan!.tasks[0].children![0];
    expect(task.start).toBe('2025-08-07');
    expect(task.end).toBe('2025-09-01');
  });

  it('should not move task when deltaDays is 0', () => {
    const { result } = renderHook(() => usePlannerState());
    
    act(() => {
      result.current.load(mockPlan);
    });

    const initialTask = result.current.plan!.tasks[0].children![0];
    const initialStart = initialTask.start;
    const initialEnd = initialTask.end;

    act(() => {
      result.current.moveTaskByDays('t1.1', 0);
    });

    const task = result.current.plan!.tasks[0].children![0];
    expect(task.start).toBe(initialStart);
    expect(task.end).toBe(initialEnd);
  });
});