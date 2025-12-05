'use client';

import React from 'react';

interface PressureGaugeProps {
  pressure: number;
  minValue?: number;
  maxValue?: number;
  criticalThreshold?: number;
  warningThreshold?: number;
  unit?: string;
}

export const PressureGauge: React.FC<PressureGaugeProps> = ({
  pressure,
  minValue = 0,
  maxValue = 15,
  criticalThreshold = 8.5,
  warningThreshold = 9.0,
  unit = 'bar'
}) => {
  // Calculate needle rotation (-90deg to +90deg for semi-circle)
  const percentage = Math.max(0, Math.min(100, ((pressure - minValue) / (maxValue - minValue)) * 100));
  const rotation = -90 + (percentage * 180 / 100);

  // Determine status color
  const getStatusColor = () => {
    if (pressure < criticalThreshold) return 'rose';
    if (pressure < warningThreshold) return 'amber';
    return 'emerald';
  };

  const statusColor = getStatusColor();

  return (
    <div className="flex flex-col items-center justify-center bg-slate-900 rounded-xl border border-slate-800 p-6 h-full">
      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-300 mb-2">MP Steam Pressure</h3>

      {/* Gauge Container */}
      <div className="relative w-48 h-24 mb-4">
        {/* Background Arc */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 100">
          {/* Background Arc (Gray) */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Critical Zone (Red) */}
          <path
            d="M 20 80 A 80 80 0 0 1 70 30"
            fill="none"
            stroke="#ef4444"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Warning Zone (Yellow) */}
          <path
            d="M 70 30 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Safe Zone (Green) */}
          <path
            d="M 100 20 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* Active Progress Arc */}
          <path
            d={`M 20 80 A 80 80 0 ${percentage > 50 ? 1 : 0} 1 ${
              100 + 80 * Math.cos((rotation * Math.PI) / 180)
            } ${80 + 80 * Math.sin((rotation * Math.PI) / 180)}`}
            fill="none"
            stroke={
              statusColor === 'rose' ? '#ef4444' :
              statusColor === 'amber' ? '#f59e0b' :
              '#10b981'
            }
            strokeWidth="16"
            strokeLinecap="round"
            className="transition-all duration-500"
          />

          {/* Center Pivot */}
          <circle cx="100" cy="80" r="6" fill="#475569" />

          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="15"
            stroke={
              statusColor === 'rose' ? '#ef4444' :
              statusColor === 'amber' ? '#f59e0b' :
              '#10b981'
            }
            strokeWidth="3"
            strokeLinecap="round"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '100px 80px',
              transition: 'transform 0.5s ease-out'
            }}
          />

          {/* Needle Tip */}
          <circle
            cx="100"
            cy="15"
            r="4"
            fill={
              statusColor === 'rose' ? '#ef4444' :
              statusColor === 'amber' ? '#f59e0b' :
              '#10b981'
            }
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: '100px 80px',
              transition: 'transform 0.5s ease-out'
            }}
          />
        </svg>

        {/* Scale Labels */}
        <div className="absolute bottom-0 left-0 text-xs text-slate-500 font-mono">{minValue}</div>
        <div className="absolute bottom-0 right-0 text-xs text-slate-500 font-mono">{maxValue}</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">
          {((minValue + maxValue) / 2).toFixed(0)}
        </div>
      </div>

      {/* Digital Display */}
      <div className={`
        text-5xl font-mono font-bold mb-2 tabular-nums
        ${statusColor === 'rose' ? 'text-rose-400' : ''}
        ${statusColor === 'amber' ? 'text-amber-400' : ''}
        ${statusColor === 'emerald' ? 'text-emerald-400' : ''}
      `}>
        {pressure.toFixed(2)}
      </div>
      <div className="text-sm text-slate-500 mb-4">{unit}</div>

      {/* Status Badge */}
      <div className={`
        px-4 py-2 rounded-lg text-sm font-semibold
        ${statusColor === 'rose' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : ''}
        ${statusColor === 'amber' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : ''}
        ${statusColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : ''}
        ${statusColor === 'rose' ? 'animate-pulse' : ''}
      `}>
        {statusColor === 'rose' && '🚨 CRITICAL: Reliability Risk'}
        {statusColor === 'amber' && '⚠️ WARNING: Below Target'}
        {statusColor === 'emerald' && '✓ OPTIMAL: Within Range'}
      </div>

      {/* Threshold Indicators */}
      <div className="mt-4 w-full space-y-1 text-xs">
        <div className="flex justify-between text-slate-500">
          <span>Critical Threshold:</span>
          <span className="font-mono text-rose-400">{criticalThreshold} {unit}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Target Threshold:</span>
          <span className="font-mono text-emerald-400">{warningThreshold} {unit}</span>
        </div>
      </div>
    </div>
  );
};
