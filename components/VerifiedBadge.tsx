import React from 'react';
import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  type: 'user' | 'company';
  text?: string;
  className?: string;
}

export function VerifiedBadge({ type, text, className = '' }: VerifiedBadgeProps) {
  const defaultText = type === 'user' ? 'Identity Verified' : 'Verified Owner';
  return (
    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 ${className}`}>
      <CheckCircle className="w-3.5 h-3.5" />
      <span>{text || defaultText}</span>
    </div>
  );
}
