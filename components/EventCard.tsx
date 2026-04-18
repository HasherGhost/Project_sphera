import React from 'react';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import { TrustBadge } from './TrustBadge';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    event_date: string;
    price_cents: number;
    trust_score: number;
    organizer_verified_at: string | null;
  };
  onRegister?: (id: string) => void;
}

export function EventCard({ event, onRegister }: EventCardProps) {
  const dateStr = new Date(event.event_date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });
  const priceStr = event.price_cents === 0 ? 'Free' : `$${(event.price_cents / 100).toFixed(2)}`;

  return (
    <article className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col h-full">
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-2">{event.title}</h3>
          <TrustBadge score={event.trust_score} />
        </div>
        
        <p className="text-slate-400 text-sm mb-4 line-clamp-3">{event.description}</p>
        
        <div className="space-y-2 text-sm text-slate-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>{dateStr}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-emerald-400">{priceStr}</span>
            {event.price_cents > 0 && <span className="text-xs text-slate-500 ml-1">(Escrow Protected)</span>}
          </div>
        </div>
      </div>
      
      <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/50 mt-auto">
        <button 
          onClick={() => onRegister && onRegister(event.id)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          {event.price_cents > 0 ? 'Secure Registration' : 'Register Now'}
        </button>
      </div>
    </article>
  );
}
