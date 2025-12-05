'use client';

import React from 'react';
import { Icon } from '@/components/ui';

interface StatCardProps {
  title: string;
  value: string | number;
  unit: string;
  status: 'good' | 'warning' | 'critical' | 'neutral';
  icon: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
  subtitle,
  trend
}) => {
  const statusColors = {
    good: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    warning: 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    critical: 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
    neutral: 'from-slate-500/20 to-slate-500/5 border-slate-500/30'
  };

  const textColors = {
    good: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-rose-400',
    neutral: 'text-slate-400'
  };

  const iconColors = {
    good: 'bg-emerald-500/10 text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-400',
    critical: 'bg-rose-500/10 text-rose-400',
    neutral: 'bg-slate-500/10 text-slate-400'
  };

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${statusColors[status]} border rounded-xl p-4 backdrop-blur-sm h-full`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg ${iconColors[status]}`}>
          <Icon name={icon as any} size={20} color="primary" />
        </div>
        {trend && (
          <span className={`text-xs ${textColors[status]}`}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tabular-nums ${textColors[status]}`}>
            {value}
          </span>
          <span className="text-sm text-slate-500 font-medium">{unit}</span>
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Glow effect */}
      <div className={`absolute inset-0 ${statusColors[status]} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
};
