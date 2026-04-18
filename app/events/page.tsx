import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EventsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users (
        full_name,
        photo_url
      )
    `)
    .order('event_date', { ascending: true });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-title font-bold text-white mb-2">Escrow-Backed Events</h1>
          <p className="text-gray-400">Discover and host events with guaranteed authenticity and automated payouts.</p>
        </div>
        <button className="px-5 py-2.5 bg-white text-gray-950 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-white/10">
          + Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Event Cards */}
        {events?.map((event: any) => {
          const date = new Date(event.event_date);
          const month = date.toLocaleString('default', { month: 'short' });
          const day = date.getDate();

          return (
            <div key={event.id} className="glass-panel rounded-3xl overflow-hidden group hover:-translate-y-1 hover:border-blue-500/30 transition-all duration-300">
              <div className="h-40 bg-gradient-to-br from-indigo-900 to-blue-900 relative">
                {event.cover_image_url && (
                  <img src={event.cover_image_url} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                )}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                  Escrow Secured
                </div>
                <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur rounded-xl p-2 border border-white/20 text-center w-14">
                  <span className="block text-xs text-gray-300 uppercase">{month}</span>
                  <span className="block font-title text-xl text-white font-bold">{day}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title text-lg font-bold text-white mb-1">{event.title}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <img src={event.organizer?.photo_url || "https://i.pravatar.cc/150"} alt="Organizer" className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-800" />
                    <span className="text-xs text-gray-300">By {event.organizer?.full_name || 'Anonymous'}</span>
                  </div>
                  <button className="text-blue-400 text-sm font-semibold hover:text-blue-300 transition">
                    {event.price_cents > 0 ? `$${(event.price_cents / 100).toFixed(2)}` : 'Free'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {(!events || events.length === 0) && (
          <div className="col-span-full text-center text-gray-500 py-10">No events found.</div>
        )}

      </div>
    </div>
  );
}
