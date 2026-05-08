import React from 'react';
import { AdminLayout } from './AdminOverview';

interface AdminPlaceholderProps {
  title: string;
  active: string;
}

export default function AdminPlaceholder({ title, active }: AdminPlaceholderProps) {
  return (
    <AdminLayout active={active}>
      <header className="mb-8">
        <h1 className="font-lexend font-bold text-3xl text-on-surface">{title}</h1>
        <p className="text-on-surface-variant mt-1">Advanced management module for {title.toLowerCase()}</p>
      </header>

      <div className="glass-1 rounded-[32px] p-20 text-center flex flex-col items-center border-2 border-dashed border-outline-variant/30">
        <div className="w-24 h-24 bg-primary/5 rounded-[32px] flex items-center justify-center text-4xl mb-6 grayscale opacity-50">
          ⚙️
        </div>
        <h2 className="font-lexend font-bold text-2xl text-on-surface opacity-60">Module Under Configuration</h2>
        <p className="text-on-surface-variant max-w-sm mt-3 text-sm font-medium">
          The {title} suite is currently being optimized for high-performance enterprise operations. 
          Expect full activation in the next deployment cycle.
        </p>
        <button className="mt-10 px-8 py-3 rounded-xl bg-surface-container border border-outline-variant font-bold text-on-surface-variant cursor-not-allowed">
          System Initializing...
        </button>
      </div>
    </AdminLayout>
  );
}
