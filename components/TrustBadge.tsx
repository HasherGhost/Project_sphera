import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface TrustBadgeProps {
  score: number; // 0 to 100
  className?: string;
}

export function TrustBadge({ score, className = '' }: TrustBadgeProps) {
  let colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
  let Icon = ShieldAlert;
  let label = 'Low Trust';

  if (score >= 80) {
    colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    Icon = ShieldCheck;
    label = 'High Trust';
  } else if (score >= 40) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    Icon = Shield;
    label = 'Moderate Trust';
  }

  return (
    <div 
      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
      title={`Trust Score: ${score}/100. Based on past events, refunds, and corporate verification.`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label} ({score})</span>
    </div>
  );
}
