

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Left Sidebar - Profile & Stats */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600/40 to-purple-600/40 opacity-50 z-0"></div>
          <div className="relative z-10 flex flex-col items-center mt-8">
            <div className="w-24 h-24 rounded-2xl bg-gray-800 border-2 border-white/20 shadow-xl overflow-hidden mb-4">
              <img src="/avatars/ned-ramirez.png" alt="Profile" className="rounded-full object-cover border border-slate-700 bg-slate-800 w-full h-full" />
            </div>
            <h2 className="font-title font-semibold text-xl text-white">Alex Morgan</h2>
            <p className="text-gray-400 text-sm">Founder @ TechVentures</p>
            <div className="mt-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified Human
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between text-sm">
            <span className="text-gray-400">Network Connections</span>
            <span className="text-white font-medium">1,204</span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span className="text-gray-400">Profile Views</span>
            <span className="text-white font-medium">843</span>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel p-4 rounded-3xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0">
            <img src="/avatars/maggot.png" alt="User" className="rounded-full object-cover border border-slate-700 bg-slate-800 w-full h-full" />
          </div>
          <input 
            type="text" 
            placeholder="Share an opportunity, idea, or connection..."
            className="flex-1 bg-transparent border-none text-white outline-none placeholder:text-gray-500 text-sm"
          />
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
            Post
          </button>
        </div>

        {/* Feed Item */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
                <img src="/avatars/mozart.png" alt="User" className="rounded-full object-cover border border-slate-700 bg-slate-800 w-full h-full" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Sarah Jenkins</h3>
                <p className="text-gray-400 text-xs">Investor | Verified Partner</p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-white transition">•••</button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            We are actively looking to fund early-stage startups building in the decentralized identity space. If you are a founder addressing real compliance and fraud issues, let's connect directly. #Escrow #FinTech
          </p>
          <div className="h-48 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-900 border border-white/5 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Rich Media Placeholder</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Suggestions / AI */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-gradient-to-b from-blue-900/20 to-transparent p-5 rounded-3xl border border-blue-500/20">
          <h3 className="font-title font-medium text-white mb-4 flex items-center gap-2">
            <span>✨</span> AI Smart Matches
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                <img src="/avatars/bounty-hunter.png" alt="Match" className="rounded-full object-cover border border-slate-700 bg-slate-800 w-full h-full" />
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Nexus Corp</p>
                <p className="text-gray-400 text-xs text-ellipsis overflow-hidden">Seeking Devs</p>
              </div>
              <button className="text-blue-400 text-xs font-semibold hover:text-blue-300">Connect</button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <h3 className="font-title font-medium text-white mb-4">Milestone Rewards</h3>
          <div className="mb-2 flex justify-between text-xs text-gray-300">
            <span>Verified Invites</span>
            <span>45 / 100</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[45%]"></div>
          </div>
          <p className="text-gray-400 text-xs mt-3">55 more to unlock VIP Tier.</p>
        </div>
      </div>

    </div>
  );
}
