import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 text-center">
      <div className="relative flex items-center justify-center w-32 h-32 mb-8 rounded-full bg-red-950/30 border border-red-900/50">
        <div className="absolute inset-0 rounded-full animate-ping bg-red-500/10" />
        <ShieldAlert className="w-16 h-16 text-red-500" />
      </div>
      
      <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
        404 <span className="text-red-500">|</span> Clearance Not Granted
      </h1>
      
      <p className="max-w-lg mt-4 text-base text-neutral-400 mb-10 leading-relaxed font-mono">
        WARNING: The requested sector or module does not exist, or your current RBAC profile lacks sufficient operational clearance to view this directory.
      </p>

      <Link 
        href="/portal/dashboard"
        className="inline-flex items-center px-6 py-3 text-sm font-bold text-white uppercase tracking-wider transition-colors border rounded-sm border-neutral-700 bg-neutral-900 hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Command Center
      </Link>
    </div>
  );
}
