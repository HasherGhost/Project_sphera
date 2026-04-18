import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function NetworkPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch users for networking
  const { data: networkUsers } = await supabase
    .from('users')
    .select('*')
    .neq('id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-title font-bold text-white mb-2">Verified Network</h1>
          <p className="text-gray-400">Connect with authentic, verified professionals and founders.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {networkUsers?.map((networkUser: any) => (
          <div key={networkUser.id} className="glass-panel p-6 rounded-3xl text-center space-y-4 hover:-translate-y-1 transition-transform duration-300">
            <div className="w-20 h-20 mx-auto rounded-full bg-gray-800 border-2 border-white/10 overflow-hidden">
              <img src={networkUser.photo_url || "https://i.pravatar.cc/150"} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-title font-bold text-white text-lg">{networkUser.full_name || 'Anonymous User'}</h3>
              <p className="text-sm text-gray-400">{networkUser.headline || 'Professional'}</p>
            </div>
            {networkUser.verified_at && (
              <div className="inline-flex px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
              </div>
            )}
            <button className="w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-medium text-white transition-colors text-sm">
              Connect
            </button>
          </div>
        ))}

        {(!networkUsers || networkUsers.length === 0) && (
          <div className="col-span-full text-center text-gray-500 py-10">No users found to connect with.</div>
        )}
      </div>
    </div>
  );
}
