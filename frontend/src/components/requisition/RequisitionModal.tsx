"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, File, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface RequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

export function RequisitionModal({ isOpen, onClose, category }: RequisitionModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'attachments'>('details');
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isHashing, setIsHashing] = useState(false);

  // Dynamic form state
  const [subCategory, setSubCategory] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [justification, setJustification] = useState('');
  
  // API State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsHashing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hashHex);
    } catch (err) {
      console.error('Failed to hash file', err);
    } finally {
      setIsHashing(false);
    }
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 1. Get dev token for BRANCH_OFFICER
      const authRes = await fetch('http://localhost:3001/api/v1/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'BRANCH_OFFICER' })
      });
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.error || 'Auth failed');

      // 2. Submit ticket
      const payload = {
        category,
        subCategory: subCategory || 'General Request',
        priority,
        details: {
          justification,
          fileSha256: fileHash || 'NO_ATTACHMENT'
        }
      };

      const res = await fetch('http://localhost:3001/api/v1/tickets/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <Card className="overflow-hidden border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626] bg-[#0f0f0f]">
              <h2 id="modal-title" className="text-xl font-semibold text-white">New Requisition: {category}</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose} 
                className="w-8 h-8 p-0 rounded-full"
                aria-label="Close Requisition Modal"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex border-b border-[#262626] bg-[#0a0a0a]">
              <button
                className={cn("flex-1 py-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", activeTab === 'details' ? "border-blue-500 text-blue-400" : "border-transparent text-neutral-400 hover:text-white")}
                onClick={() => setActiveTab('details')}
                aria-selected={activeTab === 'details'}
                role="tab"
              >
                1. Request Details
              </button>
              <button
                className={cn("flex-1 py-3 text-sm font-medium transition-colors border-b-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white", activeTab === 'attachments' ? "border-blue-500 text-blue-400" : "border-transparent text-neutral-400 hover:text-white")}
                onClick={() => setActiveTab('attachments')}
                aria-selected={activeTab === 'attachments'}
                role="tab"
              >
                2. Secure Attachments
              </button>
            </div>

            <div className="p-6 bg-[#0a0a0a]">
              {activeTab === 'details' && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div>
                    <label htmlFor="subCategory" className="block mb-2 text-sm font-medium text-neutral-300">Request Type</label>
                    <select 
                      id="subCategory"
                      className="w-full px-3 py-2 border rounded-sm bg-[#171717] border-neutral-800 text-neutral-200 focus-visible:ring-2 focus-visible:ring-white outline-none"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      aria-label="Select request type"
                    >
                      <option value="">Select Type...</option>
                      <option value="Repair Service">Repair Service</option>
                      <option value="New Asset">New Asset Allocation</option>
                      <option value="Replacement">Emergency Replacement</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-neutral-300" id="priority-label">Priority Level</label>
                    <div className="flex gap-3" role="radiogroup" aria-labelledby="priority-label">
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                        <button
                          key={p}
                          role="radio"
                          aria-checked={priority === p}
                          tabIndex={0}
                          onClick={() => setPriority(p)}
                          className={cn(
                            "flex-1 py-2 text-xs font-semibold rounded-sm border transition-all focus-visible:ring-2 focus-visible:ring-white outline-none",
                            priority === p 
                              ? p === 'CRITICAL' ? "bg-red-950 border-red-800 text-red-400" : "bg-neutral-800 border-neutral-500 text-white"
                              : "border-neutral-800 text-neutral-500 hover:bg-[#171717]"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="justification" className="block mb-2 text-sm font-medium text-neutral-300">Justification / Details</label>
                    <textarea 
                      id="justification"
                      className="w-full h-24 px-3 py-2 border rounded-sm resize-none bg-[#171717] border-neutral-800 text-neutral-200 focus-visible:ring-2 focus-visible:ring-white outline-none"
                      placeholder="Enter detailed operational justification..."
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      aria-label="Detailed justification"
                    />
                  </div>
                </motion.div>
              )}

              {activeTab === 'attachments' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <div className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-sm border-neutral-700 bg-neutral-900 hover:bg-neutral-800 transition-colors">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                      aria-label="Upload compliance document"
                    />
                    <UploadCloud className="w-10 h-10 mb-3 text-neutral-400" />
                    <p className="text-sm text-neutral-300">Drag & drop compliance documents here</p>
                    <p className="mt-1 text-xs text-neutral-500">Supports PDF, DOCX (Max 10MB)</p>
                  </div>

                  {fileName && (
                    <div className="flex items-center gap-3 p-3 border rounded-sm bg-[#171717] border-neutral-800">
                      <File className="w-5 h-5 text-neutral-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-neutral-200">{fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {isHashing ? (
                            <div className="w-3 h-3 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          )}
                          <p className="text-xs font-mono text-neutral-500 truncate" aria-live="polite">
                            {isHashing ? 'Computing SHA-256 checksum...' : `SHA256: ${fileHash}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              
              {submitStatus === 'error' && (
                <p className="mt-4 text-xs text-red-500 font-medium" role="alert">{errorMessage}</p>
              )}
              {submitStatus === 'success' && (
                <p className="mt-4 text-xs text-emerald-500 font-medium flex items-center gap-2" role="alert">
                  <CheckCircle2 className="w-4 h-4" /> Requisition securely injected into ledger.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#262626] bg-[#0f0f0f]">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || submitStatus === 'success'}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Secure Submit'}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
