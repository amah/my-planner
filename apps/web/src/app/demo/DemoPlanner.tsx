import React from 'react';
import { demoPlan } from './mockData';
import { Gantt, usePlannerState } from '@capacity/react';

export function DemoPlanner() {
  const store = usePlannerState((s) => s);
  React.useEffect(() => {
    store.load(demoPlan);
  }, [store.load]);

  return (
    <div className="border rounded-2xl shadow-sm overflow-hidden bg-white">
      <div className="p-3 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Demo Plan</h2>
          <p className="text-sm text-neutral-500">Drag bars to move, drag edges to resize. Snaps to days.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">dayWidth: {store.ui.dayWidth}px</span>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 border rounded" onClick={() => store.uiSetDayWidth(Math.max(12, store.ui.dayWidth - 2))}>-</button>
            <button className="px-2 py-1 border rounded" onClick={() => store.uiSetDayWidth(Math.min(48, store.ui.dayWidth + 2))}>+</button>
          </div>
        </div>
      </div>
      <Gantt />
    </div>
  );
}
