'use client';

import React from 'react';

interface GTAData {
  name: string;
  power: number;
  steam: number;
  admission: number;
  status: 'ON' | 'OFF';
  load?: number;
}

interface GTAFleetProps {
  gta1: GTAData;
  gta2: GTAData;
  gta3: GTAData;
}

const GTACard: React.FC<{ gta: GTAData }> = ({ gta }) => {
  const isRunning = gta.status === 'ON';
  const efficiency = gta.steam > 0 ? gta.power / gta.steam : 0;
  const maxPower = 40; // MW
  const maxSteam = 200; // T/h
  
  const powerPercent = Math.min(100, (gta.power / maxPower) * 100);
  const steamPercent = Math.min(100, (gta.steam / maxSteam) * 100);

  return (
    <div className={`
      bg-slate-900/50 backdrop-blur-md border rounded-lg p-4 
      transition-all duration-300
      ${isRunning ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-slate-700'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {/* Turbine Icon */}
          <div className={`w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center ${
            isRunning ? 'animate-pulse' : ''
          }`}>
            <svg 
              className={`w-5 h-5 ${isRunning ? 'text-blue-400' : 'text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L8 6h3v5H8l4 4 4-4h-3V6h3l-4-4zm0 20l4-4h-3v-5h3l-4-4-4 4h3v5H8l4 4z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-200">{gta.name}</h4>
            <p className="text-[10px] text-slate-500">Turbo-Alternator</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${
          isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
        }`} />
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Power Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Power</span>
            <span className="text-xs font-mono font-bold text-blue-400">{gta.power.toFixed(1)}</span>
          </div>
          <div className="h-24 bg-slate-800/50 rounded-lg overflow-hidden relative">
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 transition-all duration-500"
              style={{ height: `${powerPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-400/50 to-transparent animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-[10px] font-mono font-bold text-white drop-shadow-lg">
                {powerPercent.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-600 mt-1">MW</div>
        </div>

        {/* Steam Bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-slate-500 uppercase">Steam Out</span>
            <span className="text-xs font-mono font-bold text-purple-400">{gta.steam.toFixed(1)}</span>
          </div>
          <div className="h-24 bg-slate-800/50 rounded-lg overflow-hidden relative">
            <div 
              className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-400 transition-all duration-500"
              style={{ height: `${steamPercent}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-purple-400/50 to-transparent animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <span className="text-[10px] font-mono font-bold text-white drop-shadow-lg">
                {steamPercent.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="text-center text-[10px] text-slate-600 mt-1">T/h</div>
        </div>
      </div>

      {/* Footer - Efficiency KPI */}
      <div className="pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase">Efficiency</span>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${
              efficiency > 0.2 ? 'text-emerald-400' : 'text-slate-600'
            }`}>
              {efficiency.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-600">MW/T</span>
          </div>
        </div>
        <div className="mt-1 text-[10px] text-slate-600">
          Admission: <span className="text-slate-400 font-mono">{gta.admission.toFixed(0)} T/h</span>
        </div>
      </div>
    </div>
  );
};

export const GTAFleet: React.FC<GTAFleetProps> = ({ gta1, gta2, gta3 }) => {
  const totalPower = gta1.power + gta2.power + gta3.power;
  const activeCount = [gta1, gta2, gta3].filter(g => g.status === 'ON').length;

  return (
    <div className="h-full flex flex-col">
      {/* Fleet Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            GTA Fleet Status
          </h3>
          <p className="text-[10px] text-slate-500">
            {activeCount}/3 Active • Total Output: <span className="text-emerald-400 font-mono font-bold">{totalPower.toFixed(1)} MW</span>
          </p>
        </div>
      </div>

      {/* GTA Grid */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        <GTACard gta={gta1} />
        <GTACard gta={gta2} />
        <GTACard gta={gta3} />
      </div>
    </div>
  );
};
