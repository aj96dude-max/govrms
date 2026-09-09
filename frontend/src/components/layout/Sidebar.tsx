"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_MODULES } from '@/constants/navigation';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-[#0a0a0a] border-r border-neutral-800 h-screen flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800">
        <Shield className="w-6 h-6 text-white mr-3" />
        <h1 className="text-lg font-bold tracking-widest text-white uppercase">GovRMS</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider" id="sidebar-nav-label">Divisions & Systems</p>
        </div>
        <nav className="space-y-1 px-3" aria-labelledby="sidebar-nav-label" role="navigation">
          {NAVIGATION_MODULES.map((module) => {
            const isActive = pathname === module.path;
            const Icon = module.icon;
            
            return (
              <Link 
                key={module.id} 
                href={module.path}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm rounded-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
                  isActive 
                    ? "bg-neutral-800 text-white font-medium" 
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                )}
              >
                <Icon className={cn("w-4 h-4 mr-3", isActive ? "text-white" : "text-neutral-500")} aria-hidden="true" />
                {module.name}
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-neutral-800 bg-[#0f0f0f]">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-neutral-800 rounded-sm flex items-center justify-center border border-neutral-700">
            <span className="text-xs font-bold text-white">JD</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Jane Doe</p>
            <p className="text-xs text-neutral-500">Clearance L3</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
