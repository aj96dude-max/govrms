"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle, CheckCircle, Activity, Hash, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandCenterPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchFeed = async () => {
    try {
      const authRes = await fetch('http://localhost:3001/api/v1/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'SUPER_ADMIN' })
      });
      const authData = await authRes.json();
      
      const res = await fetch('http://localhost:3001/api/v1/admin/feed', {
        headers: { 'Authorization': `Bearer ${authData.token}` }
      });
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch feed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleAction = async (action: 'endorse' | 'clear') => {
    if (!selectedTicket) return;
    setIsProcessing(true);
    try {
      const authRes = await fetch('http://localhost:3001/api/v1/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'SUPER_ADMIN' })
      });
      const authData = await authRes.json();

      const endpoint = `http://localhost:3001/api/v1/tickets/${selectedTicket._id}/${action}`;
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`
        }
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Action failed');
      }

      await fetchFeed();
      setSelectedTicket(null);
    } catch (err) {
      console.error('Failed to process ticket:', err);
      alert(`Action failed: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3" tabIndex={0}>
            <Activity className="w-6 h-6 text-red-500" />
            Super Admin Command Center
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Global Escalation & Resolution Feed</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search Ticket / Hash..." 
              className="pl-9 pr-4 py-2 bg-[#171717] border border-neutral-800 rounded-sm text-sm text-white focus-visible:ring-2 focus-visible:ring-white outline-none"
              aria-label="Search Tickets"
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Feed List */}
        <div 
          className="w-2/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-8" 
          role="feed" 
          aria-label="Ticket Feed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-neutral-500 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex items-center justify-center h-full text-neutral-500">No tickets found in the ledger.</div>
          ) : (
            tickets.map((ticket) => (
              <Card 
                key={ticket._id} 
                className={cn(
                  "p-4 cursor-pointer transition-colors border focus-visible:ring-2 focus-visible:ring-white outline-none",
                  selectedTicket?._id === ticket._id ? "border-blue-500 bg-[#171717]" : "border-neutral-800 hover:border-neutral-700"
                )}
                onClick={() => setSelectedTicket(ticket)}
                tabIndex={0}
                role="article"
                aria-label={`Ticket ${ticket.ticketNumber}`}
                onKeyDown={(e) => { if (e.key === 'Enter') setSelectedTicket(ticket); }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-white">{ticket.ticketNumber}</span>
                    <span className="text-xs px-2 py-1 rounded-sm bg-[#171717] border border-neutral-800 text-neutral-300 font-medium">
                      {ticket.departmentId?.deptName || 'Unknown Dept'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-sm font-bold flex items-center gap-1",
                      ticket.priority === 'CRITICAL' ? "bg-red-950 text-red-400 border border-red-900" :
                      ticket.priority === 'HIGH' ? "bg-orange-950 text-orange-400 border border-orange-900" :
                      ticket.priority === 'MEDIUM' ? "bg-blue-950 text-blue-400 border border-blue-900" : "bg-[#171717] text-neutral-300 border border-neutral-800"
                    )}>
                      {ticket.priority === 'CRITICAL' && <AlertTriangle className="w-3 h-3" />}
                      {ticket.priority}
                    </span>
                    <span className="text-sm font-medium text-neutral-300">{ticket.category}</span>
                  </div>
                  
                  <span className="text-xs font-medium text-neutral-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Inspector Sidebar */}
        <div className="w-1/3 h-full">
          <AnimatePresence mode="wait">
            {selectedTicket ? (
              <motion.div
                key={selectedTicket._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full"
                role="region"
                aria-label="Ticket Inspector"
              >
                <Card className="h-full flex flex-col p-6 sticky top-0 bg-[#0a0a0a]">
                  <h3 className="text-lg font-bold text-white border-b border-neutral-800 pb-4 mb-4">
                    Inspector: {selectedTicket.ticketNumber}
                  </h3>
                  
                  <div className="space-y-6 flex-1 overflow-y-auto">
                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Cryptographic Audit Trail</p>
                      <div className="bg-[#171717] rounded-sm p-3 border border-neutral-800 space-y-3 font-mono text-xs">
                        {selectedTicket.auditTrail && selectedTicket.auditTrail.length > 0 ? (
                          selectedTicket.auditTrail.map((log: any, idx: number) => (
                            <React.Fragment key={log._id}>
                              <div className="flex items-start gap-2">
                                <Hash className={cn("w-4 h-4 shrink-0 mt-0.5", idx === 0 ? "text-emerald-500" : "text-neutral-500")} />
                                <div className="break-all">
                                  <p className={cn("font-bold mb-1", idx === 0 ? "text-emerald-400" : "text-neutral-300")}>
                                    [{log.action}]
                                  </p>
                                  <p className="text-neutral-400">Hash: {log.currentHash}</p>
                                  <p className="text-neutral-500">Prev: {log.previousHash}</p>
                                  <p className="text-neutral-600 mt-1">Date: {new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                              {idx < selectedTicket.auditTrail.length - 1 && (
                                <div className="w-px h-4 bg-neutral-700 ml-1.5" />
                              )}
                            </React.Fragment>
                          ))
                        ) : (
                          <p className="text-neutral-500">No ledger entries found.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Actions</p>
                      <div className="grid gap-3">
                        <Button 
                          className="w-full justify-center" 
                          onClick={() => handleAction('clear')}
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Approve & Fulfill'}
                        </Button>
                        <Button 
                          variant="danger" 
                          className="w-full justify-center"
                          disabled={isProcessing}
                        >
                          Reject Escalation
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-neutral-500 text-sm" aria-live="polite">Select a ticket to inspect cryptographic ledgers</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
