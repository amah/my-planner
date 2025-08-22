import React from 'react';
import { DemoPlanner } from './demo/DemoPlanner';

export default function App() {
  return (
    <div className="min-h-screen text-neutral-800">
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="mx-auto max-w-[1300px] px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Capacity Gantt — Nx Demo</h1>
          <a
            className="text-sm underline text-blue-600"
            href="https://nx.dev"
            target="_blank" rel="noreferrer"
          >Powered by Nx + Vite</a>
        </div>
      </header>
      <main className="mx-auto max-w-[1300px] px-4 py-6">
        <DemoPlanner />
      </main>
    </div>
  );
}
