'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Icon } from '@/components/ui';

interface SteamEconomicsProps {
  blendedCost: number;
  totalSteamCost: number;
  sourceBreakdown: {
    sulfur_percent: number;
    gta_percent: number;
    boiler_percent: number;
    sulfur_tons: number;
    gta_tons: number;
    boiler_tons: number;
  };
  isLoading?: boolean;
}

export const SteamEconomics: React.FC<SteamEconomicsProps> = ({
  blendedCost,
  totalSteamCost,
  sourceBreakdown,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm h-full animate-pulse">
        <div className="h-full flex items-center justify-center">
          <div className="text-slate-500">Loading steam economics...</div>
        </div>
      </div>
    );
  }

  // Prepare data for donut chart
  const chartData = [
    { 
      name: 'Sulfur Recovery', 
      value: sourceBreakdown.sulfur_percent,
      tons: sourceBreakdown.sulfur_tons,
      color: '#10b981' // Emerald
    },
    { 
      name: 'GTA Extraction', 
      value: sourceBreakdown.gta_percent,
      tons: sourceBreakdown.gta_tons,
      color: '#3b82f6' // Blue
    },
    { 
      name: 'Aux Boiler', 
      value: sourceBreakdown.boiler_percent,
      tons: sourceBreakdown.boiler_tons,
      color: '#f43f5e' // Rose
    }
  ].filter(item => item.value > 0); // Only show non-zero sources

  const COLORS = chartData.map(item => item.color);

  // Determine cost status
  const getCostStatus = () => {
    if (blendedCost < 100) return { color: 'emerald', text: 'Excellent' };
    if (blendedCost < 150) return { color: 'blue', text: 'Good' };
    if (blendedCost < 200) return { color: 'amber', text: 'Fair' };
    return { color: 'rose', text: 'High' };
  };

  const costStatus = getCostStatus();

  // Calculate cost efficiency (lower is better)
  const costEfficiency = ((284 - blendedCost) / 284 * 100).toFixed(0);

  return (
    <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center border border-emerald-500/30">
            <Icon name="settings" size={20} color="primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-200">Steam Economics</h3>
            <p className="text-xs text-slate-500">Blended Cost Analysis</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-lg bg-${costStatus.color}-500/10 border border-${costStatus.color}-500/30`}>
          <span className={`text-xs font-semibold text-${costStatus.color}-400`}>{costStatus.text}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Key Metrics */}
        <div className="space-y-4">
          {/* Blended Cost - Main Metric */}
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Avg Steam Cost</div>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold tabular-nums text-${costStatus.color}-400`}>
                {blendedCost.toFixed(0)}
              </span>
              <span className="text-lg text-slate-500 font-medium">DH/Ton</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-emerald-500 to-${costStatus.color}-500 transition-all duration-500`}
                  style={{ width: `${Math.min(100, parseFloat(costEfficiency))}%` }}
                />
              </div>
              <span className="text-xs text-slate-400">{costEfficiency}% vs Boiler</span>
            </div>
          </div>

          {/* Total Cost per Hour */}
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 uppercase tracking-wide">Total Steam Cost</span>
              <Icon name="settings" size={16} color="primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-200 tabular-nums">
                {(totalSteamCost / 1000).toFixed(1)}k
              </span>
              <span className="text-sm text-slate-500">DH/h</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {((totalSteamCost / 1000) * 24).toFixed(0)}k DH/day
            </div>
          </div>

          {/* Source Breakdown Details */}
          <div className="space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">Source Breakdown</div>
            
            {chartData.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-xs text-slate-300">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{source.tons.toFixed(0)} T/h</span>
                  <span className="text-sm font-semibold text-slate-200 tabular-nums min-w-[45px] text-right">
                    {source.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alert if using boiler */}
          {sourceBreakdown.boiler_percent > 0 && (
            <div className="flex items-start gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg">
              <Icon name="settings" size={16} color="secondary" />
              <div className="text-xs">
                <div className="text-rose-400 font-semibold">Boiler Active</div>
                <div className="text-rose-300/80 mt-0.5">
                  High cost source - {sourceBreakdown.boiler_percent.toFixed(0)}% of steam
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Donut Chart */}
        <div className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)}% (${props.payload.tons.toFixed(0)} T/h)`,
                  name
                ]}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center text in donut */}
          <div className="text-center -mt-48 pointer-events-none">
            <div className="text-xs text-slate-400 uppercase tracking-wide">Sources</div>
            <div className="text-2xl font-bold text-slate-200">{chartData.length}</div>
          </div>
        </div>
      </div>

      {/* Cost Breakdown Footer */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-slate-500 mb-1">Free Steam Value</div>
            <div className="text-lg font-semibold text-emerald-400">
              {((sourceBreakdown.sulfur_tons * 284) / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-600">DH/h saved</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Extraction Value</div>
            <div className="text-lg font-semibold text-blue-400">
              {((sourceBreakdown.gta_tons * 284) / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-600">DH/h saved</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Boiler Cost</div>
            <div className="text-lg font-semibold text-rose-400">
              {((sourceBreakdown.boiler_tons * 284) / 1000).toFixed(1)}k
            </div>
            <div className="text-xs text-slate-600">DH/h actual</div>
          </div>
        </div>
      </div>
    </div>
  );
};
