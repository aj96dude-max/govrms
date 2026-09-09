import React from 'react';
import { FileX, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ 
  title, 
  description = "There are currently no active records or requisitions in this sector.",
  onAction,
  actionLabel = "Initiate New Request"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 border border-dashed border-neutral-800 rounded-lg bg-[#0a0a0a]">
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-neutral-900 border border-neutral-800">
        <FileX className="w-10 h-10 text-neutral-600" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white tracking-tight">{title}</h3>
      <p className="max-w-md text-sm text-center text-neutral-500 mb-8 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction} className="gap-2">
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
