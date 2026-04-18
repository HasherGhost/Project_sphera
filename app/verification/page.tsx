export default function VerificationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      <div className="text-center">
        <h1 className="text-3xl font-title font-bold text-white mb-2">Identity Verification</h1>
        <p className="text-gray-400">SyncUp ensures absolute authenticity across the platform. Verify your identity or claim your business.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Face ID Verification */}
        <div className="glass-panel p-8 rounded-3xl text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Human Liveness Check</h2>
            <p className="text-sm text-gray-400">Using AI, we confirm you are a real human in real-time. No 2D photos or masks allowed.</p>
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl font-medium text-white shadow-lg transition-transform hover:-translate-y-1">
            Start Camera Verification
          </button>
        </div>

        {/* Business Claim Verification */}
        <div className="glass-panel p-8 rounded-3xl text-center space-y-6 bg-gradient-to-br from-green-500/5 to-transparent border-green-500/20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Business Ownership</h2>
            <p className="text-sm text-gray-400">Claim your company officially by routing documents and domain email validations.</p>
          </div>
          <button className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-medium text-white transition-colors">
            Upload Documents
          </button>
        </div>

      </div>

    </div>
  );
}
