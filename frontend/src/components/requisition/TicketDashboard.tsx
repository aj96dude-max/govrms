"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Car, Plane, Paperclip, Phone, Zap, Wrench, Shield, ArrowLeft, FileWarning, Clock, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { RequisitionModal } from '@/components/requisition/RequisitionModal';

const CATEGORIES = [
  { id: 'property', name: 'Property & Premises', icon: Building, hasSub: true },
  { id: 'vehicle', name: 'Vehicle', icon: Car, hasSub: false },
  { id: 'travel', name: 'Travel Desk', icon: Plane, hasSub: false },
  { id: 'stationary', name: 'Stationary & Stores', icon: Paperclip, hasSub: false },
  { id: 'communications', name: 'Communications', icon: Phone, hasSub: false },
  { id: 'electro', name: 'Electromechanical', icon: Zap, hasSub: true },
  { id: 'engineering', name: 'Engineering', icon: Wrench, hasSub: false },
  { id: 'security', name: 'Security', icon: Shield, hasSub: false },
];

const SUB_CATEGORIES: Record<string, string[]> = {
  'property': [
    'Owned Properties',
    'Rented Properties',
    'Lease Properties'
  ],
  'electro': [
    'Air Conditioner',
    'ATM Machines',
    'Fire Alarm Systems',
    'Generator',
    'Microwave',
    'Refrigerator',
    'Sign Boards',
    'Smoke Detector'
  ]
};

export function TicketDashboard() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [modalCategory, setModalCategory] = useState<string | null>(null);

  const handleCategoryClick = (catId: string, catName: string, hasSub: boolean) => {
    if (hasSub) {
      setActiveCategory(catId);
    } else {
      setModalCategory(catName);
    }
  };

  return (
    <div className="w-full">
      {/* Analytics HUD */}
      {!activeCategory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#0f0f0f] border-neutral-800 p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Active Requisitions</p>
              <h3 className="text-3xl font-black text-white">1,482</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <FileWarning className="w-6 h-6 text-blue-400" />
            </div>
          </Card>
          <Card className="bg-[#0f0f0f] border-neutral-800 p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Pending Approvals</p>
              <h3 className="text-3xl font-black text-white">43</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </Card>
          <Card className="bg-[#0f0f0f] border-neutral-800 p-6 flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full" />
            <div className="relative z-10">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Ledger Integrity</p>
              <h3 className="text-3xl font-black text-emerald-400">100%</h3>
            </div>
            <div className="relative z-10 w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Grid Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {!activeCategory ? (
            <motion.div
              key="primary-grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {CATEGORIES.map((category) => (
                <Card 
                  key={category.id} 
                  className="cursor-pointer hover:bg-neutral-900 group focus-visible:ring-2 focus-visible:ring-white outline-none"
                  onClick={() => handleCategoryClick(category.id, category.name, category.hasSub)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCategoryClick(category.id, category.name, category.hasSub); }}
                  aria-label={category.name}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                    <category.icon className="w-8 h-8 text-neutral-400 mb-3 group-hover:text-white transition-colors" />
                    <h3 className="text-sm font-bold tracking-wide text-neutral-300 group-hover:text-white uppercase">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="sub-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-6 flex items-center">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className="flex items-center text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-white outline-none rounded-sm"
                  aria-label="Back to Categories"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Categories
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {SUB_CATEGORIES[activeCategory].map((subName, idx) => (
                  <Card 
                    key={idx} 
                    className="cursor-pointer hover:bg-neutral-900 group focus-visible:ring-2 focus-visible:ring-white outline-none"
                    onClick={() => setModalCategory(subName)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setModalCategory(subName); }}
                    aria-label={`Select ${subName}`}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-neutral-300 group-hover:text-white">
                        {subName}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RequisitionModal 
        isOpen={!!modalCategory} 
        onClose={() => setModalCategory(null)} 
        category={modalCategory || ''} 
      />
    </div>
  );
}
