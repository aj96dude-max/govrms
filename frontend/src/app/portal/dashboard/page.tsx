"use client";

import React from 'react';
import { TicketDashboard } from '@/components/requisition/TicketDashboard';

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10 pb-6 border-b border-neutral-800 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-wider text-white uppercase">Ticket Management System</h1>
          <p className="text-sm text-neutral-500 mt-2 font-medium">Select an operational category to initialize a requisition ticket.</p>
        </div>
      </header>
      
      <TicketDashboard />
    </div>
  );
}
