import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      <div className="w-16 h-16 bg-gradient-to-tr from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
      </div>

      <h1 className="text-5xl md:text-7xl font-title font-bold text-white tracking-tight mb-6 leading-tight">
        The True <br/>
        <span className="text-gradient">Professional Ecosystem</span>
      </h1>
      
      <p className="max-w-2xl text-lg text-gray-400 mb-10 leading-relaxed">
        SyncUp is a verified-humans-only platform built to eliminate bots, fake profiles, and fraud. Connect directly with authentic founders, host escrow-backed events, and unlock milestone rewards.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href="/verification" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 w-full sm:w-auto">
          Start Human Verification
        </Link>
        <Link href="/dashboard" className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-bold text-white transition-colors w-full sm:w-auto">
          Preview Dashboard
        </Link>
      </div>

      <div className="mt-20 flex items-center justify-center gap-8 opacity-60 flex-wrap">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-sm font-medium">100% Anti-Spoofing AI</span>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="text-sm font-medium">Escrow-Backed</span>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span className="text-sm font-medium">Verified Identity</span>
        </div>
      </div>

    </div>
  );
}
