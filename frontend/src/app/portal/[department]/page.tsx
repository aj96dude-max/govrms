"use client";

import React, { use } from 'react';
import { notFound } from 'next/navigation';
import { NAVIGATION_MODULES } from '@/constants/navigation';
import { EmptyState } from '@/components/ui/EmptyState';

export default function DepartmentPage({ params }: { params: Promise<{ department: string }> }) {
  const resolvedParams = use(params);
  const departmentSlug = resolvedParams.department;
  
  // Find the matching module from our navigation config
  // We match against `/portal/${departmentSlug}` since the paths in navigation.ts are like `/portal/fleet`
  const currentModule = NAVIGATION_MODULES.find(mod => mod.path === `/portal/${departmentSlug}`);

  // If the user typed an invalid department in the URL, trigger the strict 404
  if (!currentModule) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full min-h-screen p-6 bg-[#050505]">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <currentModule.icon className="w-6 h-6 text-blue-500" />
            {currentModule.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Sector specific records and controls</p>
        </div>
      </header>
      
      <div className="flex-1">
        <EmptyState 
          title={`No Records Found for ${currentModule.name}`}
          description={`The ${currentModule.name} module currently has no active requisitions, assets, or data streams mapped to your profile.`}
          onAction={() => alert('New Requisition Initialized (Demo)')}
        />
      </div>
    </div>
  );
}
