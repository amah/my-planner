import React from 'react';
import { usePlannerState } from '../state';
import { format } from 'date-fns';

export function TimelineHeader() {
  const { days } = usePlannerState();
  const ui = usePlannerState((s) => s.ui);
  const headerRef = React.useRef<HTMLDivElement>(null);

  // Group days by month
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
    // If too narrow, show just "MMM"
    return px < 60 ? format(dt, 'MMM') : format(dt, 'MMM yyyy');
  };

  // Scroll synchronization temporarily disabled to prevent infinite loop

  return (
    <div ref={headerRef} className="overflow-x-auto border-b">
      <div style={{ minWidth: `calc(256px + ${days.length * ui.dayWidth}px)` }}>
        <div className="flex flex-col">
          {/* Row 1: months */}
          <div className="flex border-b border-neutral-200">
            <div className="w-64 shrink-0 border-r p-2 text-sm font-medium">
              Tasks
            </div>
            <div className="flex-1 flex">
              {months.map((m) => {
                const w = m.count * ui.dayWidth;
                return (
                  <div
                    key={m.key}
                    className="text-xs text-center border-r bg-neutral-50 whitespace-nowrap overflow-hidden text-ellipsis leading-5"
                    style={{ width: w }}
                    title={monthLabel(m.startIso, w)}
                  >
                    {monthLabel(m.startIso, w)}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: days */}
          <div className="flex">
            <div className="w-64 shrink-0 border-r" />
            <div className="flex-1 flex">
              {days.map((iso) => {
                const dt = new Date(iso + 'T00:00:00');
                return (
                  <div
                    key={iso}
                    className="text-[10px] text-center text-neutral-500 border-r tabular-nums whitespace-nowrap overflow-hidden leading-5"
                    style={{ width: ui.dayWidth }}
                    title={iso}
                  >
                    {format(dt, 'dd')}
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
