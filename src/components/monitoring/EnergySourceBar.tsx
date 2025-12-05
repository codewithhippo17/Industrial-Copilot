'use client';

import React from 'react';

interface EnergySourceBarProps {
  sulfurSteam: number;
  gtaSteam: number;
  boilerSteam: number;
}

export const EnergySourceBar: React.FC<EnergySourceBarProps> = ({
  sulfurSteam,
  gtaSteam,
  boilerSteam
}) => {
  const totalSteam = sulfurSteam + gtaSteam + boilerSteam;
  
  const sulfurPercent = totalSteam > 0 ? (sulfurSteam / totalSteam) * 100 : 0;
  const gtaPercent = totalSteam > 0 ? (gtaSteam / totalSteam) * 100 : 0;
  const boilerPercent = totalSteam > 0 ? (boilerSteam / totalSteam) * 100 : 0;

  const freeEnergyPercent = sulfurPercent; // Sulfur is free
  const isFreeEnergyDominant = freeEnergyPercent > 50;
  const isBoilerActive = boilerPercent > 0;

  const getFinancialState = () => {
    if (freeEnergyPercent > 80) return 'Excellent';
    if (freeEnergyPercent > 50) return 'Good';
    if (freeEnergyPercent > 20) return 'Fair';
    return 'Poor';
  };

  const getStateColor = () => {
    if (freeEnergyPercent > 80) return 'text-emerald-400';
    if (freeEnergyPercent > 50) return 'text-blue-400';
    if (freeEnergyPercent > 20) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Energy Source Mix
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Total Steam Production: <span className="text-slate-400 font-mono font-bold">{totalSteam.toFixed(0)} T/h</span>
          </p>
        </div>
        <div className={`px-3 py-1 rounded ${
          isFreeEnergyDominant 
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
        }`}>
          <span className="text-xs font-bold">
            {getFinancialState()} Energy Mix
          </span>
        </div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div className="relative h-16 bg-slate-800/50 rounded-lg overflow-hidden mb-3">
        <div className="absolute inset-0 flex">
          {/* Sulfur Segment (Green - Free) */}
          <div 
            className="relative bg-gradient-to-r from-emerald-600 to-emerald-500 transition-all duration-1000"
            style={{ width: `${sulfurPercent}%` }}
          >
            {sulfurPercent > 10 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-xs font-bold drop-shadow-lg">{sulfurPercent.toFixed(0)}%</div>
                <div className="text-[9px] font-semibold drop-shadow-lg">Sulfur</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-400/30 to-transparent" />
          </div>

          {/* GTA Segment (Blue - Extracted) */}
          <div 
            className="relative bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-1000"
            style={{ width: `${gtaPercent}%` }}
          >
            {gtaPercent > 10 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-xs font-bold drop-shadow-lg">{gtaPercent.toFixed(0)}%</div>
                <div className="text-[9px] font-semibold drop-shadow-lg">GTA</div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-400/30 to-transparent" />
          </div>

          {/* Boiler Segment (Red - Expensive) */}
          <div 
            className="relative bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-1000"
            style={{ width: `${boilerPercent}%` }}
          >
            {boilerPercent > 5 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <div className="text-xs font-bold drop-shadow-lg">{boilerPercent.toFixed(0)}%</div>
                <div className="text-[9px] font-semibold drop-shadow-lg">Boiler</div>
              </div>
            )}
            {boilerPercent > 0 && (
              <div className="absolute inset-0 bg-gradient-to-t from-rose-400/30 to-transparent animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Financial State Overlay */}
      <div className="flex items-center justify-between text-sm">
        <div className={`font-bold ${getStateColor()}`}>
          Running on <span className="text-2xl">{freeEnergyPercent.toFixed(0)}%</span> Free Energy
        </div>
        {isBoilerActive && (
          <div className="flex items-center gap-2 px-2 py-1 bg-rose-500/20 border border-rose-500/50 rounded text-xs text-rose-400">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Boiler Active (+284 DH/T)</span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-400">
              Sulfur Recovery: <span className="text-emerald-400 font-mono font-bold">{sulfurSteam.toFixed(0)} T/h</span>
              <span className="text-slate-600 ml-1">(20 DH/T)</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-slate-400">
              GTA Extraction: <span className="text-blue-400 font-mono font-bold">{gtaSteam.toFixed(0)} T/h</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span className="text-slate-400">
              Aux Boiler: <span className="text-rose-400 font-mono font-bold">{boilerSteam.toFixed(0)} T/h</span>
              <span className="text-slate-600 ml-1">(284 DH/T)</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
