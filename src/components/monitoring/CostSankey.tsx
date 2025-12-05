'use client';

import React, { useMemo } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';

interface CostSankeyProps {
  sulfurSteam: number;
  gtaSteam: number;
  boilerSteam: number;
  totalDemand: number;
  gtaPower: number;
  mpPressure: number;
}

export const CostSankey: React.FC<CostSankeyProps> = ({
  sulfurSteam,
  gtaSteam,
  boilerSteam,
  totalDemand,
  gtaPower,
  mpPressure
}) => {
  const sankeyData = useMemo(() => {
    // Ensure no zero or negative values
    const safeSulfur = Math.max(1, sulfurSteam);
    const safeGTA = Math.max(1, gtaSteam);
    const safeBoiler = Math.max(0.1, boilerSteam);
    const safeDemand = Math.max(1, totalDemand);
    const safePower = Math.max(1, gtaPower);

    // Calculate process steam (steam that doesn't go to GTAs)
    const processSteam = Math.max(1, safeDemand - safeGTA);

    return {
      nodes: [
        // Sources
        { id: 'Sulfur Recovery', color: '#10b981' }, // Emerald - Free
        { id: 'Aux Boiler', color: '#ef4444' }, // Rose - Expensive
        
        // Central Hub
        { id: 'MP Steam Header', color: mpPressure < 8.5 ? '#ef4444' : '#3b82f6' }, // Red if low pressure, blue otherwise
        
        // Destinations
        { id: 'Process Units', color: '#64748b' }, // Slate
        { id: 'GTAs', color: '#8b5cf6' }, // Purple
        { id: 'Grid Export', color: '#f59e0b' }, // Amber
      ],
      links: [
        // Sources to MP Header
        { source: 'Sulfur Recovery', target: 'MP Steam Header', value: safeSulfur },
        { source: 'Aux Boiler', target: 'MP Steam Header', value: safeBoiler },
        
        // MP Header to Destinations
        { source: 'MP Steam Header', target: 'Process Units', value: processSteam },
        { source: 'MP Steam Header', target: 'GTAs', value: safeGTA },
        
        // GTAs to Grid
        { source: 'GTAs', target: 'Grid Export', value: safePower },
      ]
    };
  }, [sulfurSteam, gtaSteam, boilerSteam, totalDemand, gtaPower, mpPressure]);

  return (
    <div className="relative h-full w-full">
      {/* Header Info */}
      <div className="absolute top-2 left-4 z-10 space-y-1">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          MP Steam Energy Flow
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Free (Sulfur)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Expensive (Boiler)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Power Gen</span>
          </div>
        </div>
      </div>

      {/* Financial Metrics Overlay */}
      <div className="absolute top-2 right-4 z-10 text-right space-y-1">
        <div className="text-[10px] text-slate-500 uppercase">Blended Cost</div>
        <div className="text-xl font-mono font-bold text-emerald-400">
          {((sulfurSteam * 20 + boilerSteam * 284) / (sulfurSteam + boilerSteam + gtaSteam)).toFixed(1)}
          <span className="text-xs text-slate-500 ml-1">DH/T</span>
        </div>
        <div className="text-[10px] text-slate-500">
          {boilerSteam > 0 ? (
            <span className="text-rose-400">⚠ Boiler Active</span>
          ) : (
            <span className="text-emerald-400">✓ Optimal Mix</span>
          )}
        </div>
      </div>

      {/* Pressure Alert Overlay */}
      {mpPressure < 8.5 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-rose-500/20 border border-rose-500/50 rounded-lg px-4 py-2 backdrop-blur-md animate-pulse">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-rose-400 font-semibold">
                CRITICAL: MP Pressure {mpPressure.toFixed(2)} bar (Target: 8.5+)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sankey Diagram */}
      <ResponsiveSankey
        data={sankeyData}
        margin={{ top: 60, right: 160, bottom: 40, left: 160 }}
        align="justify"
        colors={{ scheme: 'category10' }}
        nodeOpacity={1}
        nodeHoverOthersOpacity={0.35}
        nodeThickness={18}
        nodeSpacing={24}
        nodeBorderWidth={0}
        nodeBorderRadius={3}
        linkOpacity={0.5}
        linkHoverOthersOpacity={0.1}
        linkContract={3}
        enableLinkGradient={true}
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={16}
        labelTextColor="#94a3b8"
        theme={{
          background: 'transparent',
          text: {
            fontSize: 11,
            fill: '#94a3b8',
            fontFamily: 'ui-monospace, monospace'
          },
          tooltip: {
            container: {
              background: '#1e293b',
              color: '#e2e8f0',
              fontSize: '12px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4)',
              border: '1px solid #334155'
            }
          }
        }}
        animate={true}
        motionConfig="gentle"
      />

      {/* Value Annotations */}
      <div className="absolute bottom-4 right-4 z-10 space-y-1 text-right text-[10px] text-slate-500">
        <div>
          <span className="text-emerald-400 font-mono">{sulfurSteam.toFixed(0)}</span> T/h Free
        </div>
        <div>
          <span className="text-rose-400 font-mono">{boilerSteam.toFixed(0)}</span> T/h Boiler
        </div>
        <div>
          <span className="text-purple-400 font-mono">{gtaPower.toFixed(1)}</span> MW Power
        </div>
      </div>
    </div>
  );
};
