import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/layout/CommandPalette';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <CommandPalette />
      <main className="pl-72 flex-1 min-h-screen">
        {children}
      </main>
    </div>
  );
}
