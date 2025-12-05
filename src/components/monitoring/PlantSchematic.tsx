'use client';

import React from 'react';

interface PlantSchematicProps {
  sulfurFlow: number;
  boilerOutput: number;
  gridImport: number;
  gta1Power: number;
  gta2Power: number;
  gta3Power: number;
  totalSteam: number;
  mpPressure: number;
}

export const PlantSchematic: React.FC<PlantSchematicProps> = ({
  sulfurFlow,
  boilerOutput,
  gridImport,
  gta1Power,
  gta2Power,
  gta3Power,
  totalSteam,
  mpPressure
}) => {
  const totalGTAPower = gta1Power + gta2Power + gta3Power;
  const totalPower = totalGTAPower + gridImport;

  // Animation speeds based on flow rates
  const sulfurSpeed = Math.max(1, 5 - sulfurFlow / 20); // Faster with more flow
  const boilerSpeed = Math.max(1, 5 - boilerOutput / 50);
  const steamSpeed = Math.max(1, 5 - totalSteam / 150);

  return (
    <div className="relative w-full h-full bg-slate-900/50 rounded-xl border border-slate-700/50 p-6 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />

      <div className="relative h-full grid grid-cols-7 gap-6 items-center">
        {/* COLUMN 1: Sources */}
        <div className="col-span-2 space-y-4 h-full flex flex-col justify-around">
          {/* Sulfur Input */}
          <div className="bg-slate-800/80 border border-emerald-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase">Sulfur Plant</span>
            </div>
            <div className="text-2xl font-bold text-white">{sulfurFlow.toFixed(1)}</div>
            <div className="text-xs text-slate-400">T/hr Input</div>
            <div className="mt-2 text-xs text-emerald-400">✓ Free Steam Source</div>
          </div>

          {/* Auxiliary Boiler */}
          <div className="bg-slate-800/80 border border-rose-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="text-xs font-semibold text-rose-400 uppercase">Aux Boiler</span>
            </div>
            <div className="text-2xl font-bold text-white">{boilerOutput.toFixed(0)}</div>
            <div className="text-xs text-slate-400">T/hr Steam</div>
            <div className="mt-2 text-xs text-rose-400">⚠ Fuel Cost</div>
          </div>

          {/* Grid Import */}
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-amber-400 uppercase">Grid</span>
            </div>
            <div className="text-2xl font-bold text-white">{gridImport.toFixed(1)}</div>
            <div className="text-xs text-slate-400">MW Import</div>
            <div className="mt-2 text-xs text-amber-400">
              {new Date().getHours() >= 17 && new Date().getHours() < 22 ? '⚡ Peak Rate' : '💡 Off-Peak'}
            </div>
          </div>
        </div>

        {/* COLUMN 2-3: Flow Lines + Steam Header */}
        <div className="col-span-2 relative h-full">
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {/* Sulfur to Steam (Green) */}
            <path
              d="M 20 20 L 180 120"
              stroke="url(#greenGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="20 10"
              className="animate-flow"
              style={{ animationDuration: `${sulfurSpeed}s` }}
            />
            
            {/* Boiler to Steam (Red) */}
            <path
              d="M 20 180 L 180 180"
              stroke="url(#redGradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray="20 10"
              className="animate-flow"
              style={{ animationDuration: `${boilerSpeed}s` }}
            />

            {/* Steam to GTAs (Blue) */}
            <path
              d="M 280 100 L 380 50"
              stroke="url(#blueGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="15 8"
              className="animate-flow"
              style={{ animationDuration: `${steamSpeed}s` }}
            />
            <path
              d="M 280 150 L 380 150"
              stroke="url(#blueGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="15 8"
              className="animate-flow"
              style={{ animationDuration: `${steamSpeed}s` }}
            />
            <path
              d="M 280 200 L 380 250"
              stroke="url(#blueGradient)"
              strokeWidth="6"
              fill="none"
              strokeDasharray="15 8"
              className="animate-flow"
              style={{ animationDuration: `${steamSpeed}s` }}
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Steam Header (Center) - UPGRADED with Risk Gauge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`border-2 rounded-xl p-6 backdrop-blur-md min-w-[240px] transition-all duration-300 ${
              mpPressure >= 8.5 
                ? 'bg-blue-500/20 border-blue-400' 
                : 'bg-rose-500/20 border-rose-500 animate-pulse'
            }`}>
              <div className="text-center">
                <div className={`text-xs font-semibold uppercase mb-3 flex items-center justify-center gap-2 ${
                  mpPressure >= 8.5 ? 'text-blue-400' : 'text-rose-400'
                }`}>
                  <span>MP Steam Header</span>
                  {mpPressure < 8.5 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-rose-500/30 animate-pulse">
                      RISK
                    </span>
                  )}
                </div>
                
                {/* Steam Flow Display */}
                <div className="text-3xl font-bold text-white mb-1">{totalSteam.toFixed(0)}</div>
                <div className="text-xs text-slate-400 mb-3">T/hr Total</div>
                
                {/* Pressure Risk Gauge */}
                <div className="relative mb-3">
                  {/* Pressure Bar */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        mpPressure >= 9.0 ? 'bg-emerald-400' :
                        mpPressure >= 8.5 ? 'bg-blue-400' :
                        'bg-rose-500 animate-pulse'
                      }`}
                      style={{ 
                        width: `${Math.min(100, Math.max(0, ((mpPressure - 7.5) / (10 - 7.5)) * 100))}%` 
                      }}
                    />
                  </div>
                  
                  {/* Pressure Value */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className={`text-lg font-bold tabular-nums ${
                      mpPressure >= 8.5 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {mpPressure.toFixed(2)}
                    </div>
                    <span className="text-xs text-slate-400">bar</span>
                    {mpPressure >= 8.5 ? (
                      <span className="text-emerald-400 text-sm">✓</span>
                    ) : (
                      <span className="text-rose-400 text-sm animate-pulse">⚠</span>
                    )}
                  </div>
                </div>

                {/* Status Message */}
                {mpPressure < 8.5 && (
                  <div className="text-[10px] text-rose-300 bg-rose-500/10 rounded px-2 py-1 border border-rose-500/30">
                    ⚠️ CRITICAL: Reliability Risk - Production Impact
                  </div>
                )}
                
                {mpPressure >= 8.5 && mpPressure < 9.0 && (
                  <div className="text-[10px] text-blue-300">
                    Pressure Optimal - Operations Normal
                  </div>
                )}

                {mpPressure >= 9.0 && (
                  <div className="text-[10px] text-emerald-300">
                    ✓ Pressure Excellent - Peak Performance
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 4-5: GTAs */}
        <div className="col-span-2 space-y-3 h-full flex flex-col justify-around">
          {/* GTA 1 */}
          <div className="bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 uppercase">GTA 1</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-white">{gta1Power.toFixed(1)} MW</div>
            <div className="text-xs text-slate-400">Power Output</div>
          </div>

          {/* GTA 2 */}
          <div className="bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 uppercase">GTA 2</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-white">{gta2Power.toFixed(1)} MW</div>
            <div className="text-xs text-slate-400">Power Output</div>
          </div>

          {/* GTA 3 */}
          <div className="bg-slate-800/80 border border-blue-500/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-400 uppercase">GTA 3</span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-white">{gta3Power.toFixed(1)} MW</div>
            <div className="text-xs text-slate-400">Power Output</div>
          </div>
        </div>

        {/* COLUMN 6-7: Output */}
        <div className="col-span-1 h-full flex flex-col justify-center">
          <div className="bg-slate-800/80 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-center">
              <div className="text-xs font-semibold text-amber-400 uppercase mb-2">Total Output</div>
              <div className="text-4xl font-bold text-white mb-1">{totalPower.toFixed(1)}</div>
              <div className="text-xs text-slate-400 mb-3">MW</div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">GTAs:</span>
                  <span className="text-emerald-400 font-semibold">{totalGTAPower.toFixed(1)} MW</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Grid:</span>
                  <span className="text-amber-400 font-semibold">{gridImport.toFixed(1)} MW</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes flow {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 30;
          }
        }
        .animate-flow {
          animation: flow linear infinite;
        }
      `}</style>
    </div>
  );
};
