export default function RewardsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-title font-bold text-white mb-2">Growth & Rewards</h1>
          <p className="text-gray-400">Invite verified professionals. Climb the leaderboard. Unlock milestone gifts.</p>
        </div>
        
        <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3">
          <span className="text-gray-400 text-sm">Your Code:</span>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-400/10 px-3 py-1 rounded">SYNC-ALEX26</span>
          <button className="text-white hover:text-emerald-300 ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Progress Tracker */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h2 className="text-xl font-bold text-white mb-6">Milestone Progress</h2>
          
          <div className="relative">
            {/* Background track */}
            <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 bg-gray-800 rounded-full"></div>
            {/* Progress fill */}
            <div className="absolute top-1/2 left-0 w-[45%] h-2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            
            <div className="relative flex justify-between">
              
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-gray-900 flex items-center justify-center text-white text-xs font-bold z-10 shadow-lg shadow-blue-500/20">10</div>
                <span className="text-white text-sm font-medium">Starter</span>
                <span className="text-gray-500 text-xs">Claimed</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-4 border-gray-900 flex items-center justify-center text-white text-xs font-bold z-10 shadow-lg shadow-blue-500/20">50</div>
                <span className="text-white text-sm font-medium">Growth</span>
                <span className="text-emerald-400 text-xs font-semibold">Current: 45</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 text-center opacity-50">
                <div className="w-8 h-8 rounded-full bg-gray-700 border-4 border-gray-900 flex items-center justify-center text-gray-300 text-xs font-bold z-10">100</div>
                <span className="text-gray-300 text-sm font-medium">Mega Gift</span>
                <span className="text-gray-500 text-xs">Locked</span>
              </div>

            </div>
          </div>
        </div>

        {/* Leaderboard snippet */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl">
          <h2 className="text-lg font-bold text-white mb-4">Top Referrers</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((rank) => (
              <div key={rank} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-md font-bold text-xs ${rank === 1 ? 'bg-yellow-500 text-yellow-900' : rank === 2 ? 'bg-gray-300 text-gray-800' : 'bg-orange-400 text-amber-900'}`}>{rank}</span>
                  <span className="text-white text-sm">User ID •••{rank * 7}</span>
                </div>
                <span className="text-emerald-400 text-sm font-medium">{420 - (rank * 50)}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors">
            View Full Leaderboard
          </button>
        </div>

      </div>
    </div>
  );
}
