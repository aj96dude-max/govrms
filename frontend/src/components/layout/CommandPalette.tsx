"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { NAVIGATION_MODULES } from '@/constants/navigation';
import { cn } from '@/lib/utils';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredModules = NAVIGATION_MODULES.filter((mod) => 
    mod.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="w-full max-w-xl bg-[#0a0a0a] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 py-3 border-b border-neutral-800 bg-[#0f0f0f]">
              <Search className="w-5 h-5 text-neutral-500 mr-3" />
              <input 
                type="text" 
                placeholder="Jump to Sector... (Esc to close)" 
                className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-sm bg-neutral-900 border border-neutral-800 text-neutral-500">
                <Command className="w-3 h-3" /> K
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredModules.length > 0 ? (
                filteredModules.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-sm hover:bg-blue-500/10 hover:text-blue-400 text-neutral-300 group transition-colors focus-visible:outline-none focus-visible:bg-neutral-900"
                      onClick={() => handleSelect(mod.path)}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-neutral-500 group-hover:text-blue-400" />
                        <span className="font-medium">{mod.name}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                  No clearance granted for that query.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
