'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface PressureHeartbeatProps {
  currentPressure: number;
  criticalThreshold?: number;
}

export const PressureHeartbeat: React.FC<PressureHeartbeatProps> = ({
  currentPressure,
  criticalThreshold = 8.5
}) => {
  const [history, setHistory] = useState<{ value: number; timestamp: number }[]>([]);
  const isCritical = currentPressure < criticalThreshold;

  useEffect(() => {
    setHistory(prev => {
      const newHistory = [...prev, { value: currentPressure, timestamp: Date.now() }];
      // Keep last 40 points (about 3-4 minutes at 5s refresh)
      return newHistory.slice(-40);
    });
  }, [currentPressure]);

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            MP Steam Pressure
          </span>
        </div>
        <div className={`text-xs px-2 py-0.5 rounded ${
          isCritical 
            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' 
            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
        }`}>
          {isCritical ? 'CRITICAL' : 'STABLE'}
        </div>
      </div>

      {/* Large Display */}
      <div className="mb-2">
        <div className={`text-3xl font-mono font-bold ${
          isCritical ? 'text-rose-400' : 'text-emerald-400'
        }`}>
          {currentPressure.toFixed(2)}
          <span className="text-sm text-slate-500 ml-2">bar</span>
        </div>
        <div className="text-[10px] text-slate-500">
          Target: &gt; {criticalThreshold} bar
        </div>
      </div>

      {/* Sparkline */}
      <div className="h-16 -mx-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history}>
            <YAxis 
              domain={[7.5, 10]} 
              hide={true}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={isCritical ? '#ef4444' : '#10b981'}
              strokeWidth={2}
              dot={false}
              animationDuration={300}
              className={isCritical ? 'animate-pulse' : ''}
            />
            {/* Critical threshold line */}
            <Line
              type="monotone"
              dataKey={() => criticalThreshold}
              stroke="#64748b"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="flex justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800">
        <div>
          <span className="text-slate-600">Min:</span>{' '}
          <span className="text-slate-400 font-mono">
            {history.length > 0 ? Math.min(...history.map(h => h.value)).toFixed(2) : '--'}
          </span>
        </div>
        <div>
          <span className="text-slate-600">Max:</span>{' '}
          <span className="text-slate-400 font-mono">
            {history.length > 0 ? Math.max(...history.map(h => h.value)).toFixed(2) : '--'}
          </span>
        </div>
        <div>
          <span className="text-slate-600">Avg:</span>{' '}
          <span className="text-slate-400 font-mono">
            {history.length > 0 
              ? (history.reduce((sum, h) => sum + h.value, 0) / history.length).toFixed(2)
              : '--'
            }
          </span>
        </div>
      </div>
    </div>
  );
};
