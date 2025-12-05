'use client';

import React, { useEffect, useState } from 'react';

interface ActionEvent {
  id: string;
  timestamp: Date;
  type: 'INFO' | 'WARN' | 'CRITICAL' | 'AI' | 'SUCCESS';
  message: string;
}

interface ActionFeedProps {
  mpPressure: number;
  boilerActive: boolean;
  gridImport: number;
  efficiency: number;
  blendedCost: number;
}

export const ActionFeed: React.FC<ActionFeedProps> = ({
  mpPressure,
  boilerActive,
  gridImport,
  efficiency,
  blendedCost
}) => {
  const [events, setEvents] = useState<ActionEvent[]>([]);

  useEffect(() => {
    // Generate contextual events based on real data
    const newEvents: ActionEvent[] = [];
    const now = new Date();

    // Pressure monitoring
    if (mpPressure < 8.5) {
      newEvents.push({
        id: `pressure-${Date.now()}`,
        timestamp: now,
        type: 'CRITICAL',
        message: `MP Pressure ${mpPressure.toFixed(2)} bar - Below critical threshold`
      });
    } else if (mpPressure < 9.0) {
      newEvents.push({
        id: `pressure-${Date.now()}`,
        timestamp: now,
        type: 'WARN',
        message: `MP Pressure ${mpPressure.toFixed(2)} bar - Below optimal range`
      });
    }

    // Boiler status
    if (boilerActive) {
      newEvents.push({
        id: `boiler-${Date.now()}`,
        timestamp: now,
        type: 'WARN',
        message: `Aux Boiler active - Cost impact +284 DH/T`
      });
      newEvents.push({
        id: `ai-boiler-${Date.now()}`,
        timestamp: now,
        type: 'AI',
        message: `Recommendation: Reduce steam demand or increase GTA extraction`
      });
    }

    // Grid status
    const hour = now.getHours();
    const isPeakHour = hour >= 17 && hour < 22;
    if (isPeakHour && gridImport > 10) {
      newEvents.push({
        id: `grid-${Date.now()}`,
        timestamp: now,
        type: 'WARN',
        message: `Peak tariff active - Grid cost 1.27 DH/kWh (${gridImport.toFixed(1)} MW)`
      });
      newEvents.push({
        id: `ai-grid-${Date.now()}`,
        timestamp: now,
        type: 'AI',
        message: `Optimization opportunity: Increase GTA output to reduce grid import`
      });
    } else {
      newEvents.push({
        id: `grid-${Date.now()}`,
        timestamp: now,
        type: 'INFO',
        message: `Grid tariff: ${isPeakHour ? 'Peak' : 'Off-Peak'} (${gridImport.toFixed(1)} MW import)`
      });
    }

    // Efficiency monitoring
    if (efficiency > 85) {
      newEvents.push({
        id: `efficiency-${Date.now()}`,
        timestamp: now,
        type: 'SUCCESS',
        message: `Plant efficiency ${efficiency.toFixed(1)}% - Optimal performance`
      });
    } else if (efficiency < 75) {
      newEvents.push({
        id: `efficiency-${Date.now()}`,
        timestamp: now,
        type: 'WARN',
        message: `Plant efficiency ${efficiency.toFixed(1)}% - Below target`
      });
    }

    // Cost optimization insights
    if (blendedCost < 100) {
      newEvents.push({
        id: `cost-${Date.now()}`,
        timestamp: now,
        type: 'SUCCESS',
        message: `Excellent steam cost mix: ${blendedCost.toFixed(1)} DH/T (vs 284 boiler-only)`
      });
    }

    // Add to event stream (keep last 20)
    setEvents(prev => [...newEvents, ...prev].slice(0, 20));
  }, [mpPressure, boilerActive, gridImport, efficiency, blendedCost]);

  const getEventStyle = (type: ActionEvent['type']) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-l-rose-500 bg-rose-500/5 text-rose-400';
      case 'WARN':
        return 'border-l-amber-500 bg-amber-500/5 text-amber-400';
      case 'SUCCESS':
        return 'border-l-emerald-500 bg-emerald-500/5 text-emerald-400';
      case 'AI':
        return 'border-l-purple-500 bg-purple-500/5 text-purple-400';
      default:
        return 'border-l-blue-500 bg-blue-500/5 text-blue-400';
    }
  };

  const getEventIcon = (type: ActionEvent['type']) => {
    switch (type) {
      case 'CRITICAL':
        return '🚨';
      case 'WARN':
        return '⚠️';
      case 'SUCCESS':
        return '✓';
      case 'AI':
        return '🤖';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-3 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
            Live Event Feed
          </span>
        </div>
        <div className="text-[10px] text-slate-600">
          {events.length} events
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-600 text-xs">
            Monitoring system events...
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className={`border-l-2 pl-3 pr-2 py-2 rounded-r text-xs transition-all duration-300 ${getEventStyle(event.type)}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{getEventIcon(event.type)}</span>
                  <span className="font-semibold text-[10px] uppercase tracking-wide opacity-80">
                    {event.type}
                  </span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono">
                  {event.timestamp.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit' 
                  })}
                </span>
              </div>
              <div className="text-[11px] leading-tight opacity-90">
                {event.message}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-600 text-center">
        Auto-refresh every 5s
      </div>
    </div>
  );
};
