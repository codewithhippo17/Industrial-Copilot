'use client';

import React from 'react';
import { Icon } from '@/components/ui';

/**
 * Live Sankey Diagram Component
 * 
 * Visualizes energy flows in real-time:
 * - Sulfur → Heat Recovery → MP Steam → GTAs → Electricity
 * - Fuel → Boiler → MP Steam → GTAs → Electricity
 * - MP Steam → Grid (if needed)
 */

interface LiveData {
  sulfur_flow: number;
  free_steam_equivalent: number;
  total_steam_gta: number;
  boiler_usage_estimated: number;
  total_power_generated: number;
  grid_import_estimated: number;
  gta_operations: {
    gta1: { power: number; admission: number; soutirage: number };
    gta2: { power: number; admission: number; soutirage: number };
    gta3: { power: number; admission: number; soutirage: number };
  };
}

interface LiveSankeyProps {
  data: LiveData | null;
  isLoading?: boolean;
}

export const LiveSankey: React.FC<LiveSankeyProps> = ({ data, isLoading }) => {
  if (isLoading || !data) {
    return (
      <div className="bg-[#313647] rounded-lg p-6 border border-[#435663]">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="dashboard-tab" size={20} color="primary" />
          <h3 className="text-lg font-semibold text-[#FFF8D4]">Energy Flow Diagram</h3>
        </div>
        <div className="h-[400px] flex items-center justify-center text-[#8E9098]">
          <div className="animate-pulse">Loading live data...</div>
        </div>
      </div>
    );
  }

  // Calculate flow percentages
  const totalSteam = data.free_steam_equivalent + data.boiler_usage_estimated;
  const freePercent = totalSteam > 0 ? (data.free_steam_equivalent / totalSteam) * 100 : 0;
  const boilerPercent = totalSteam > 0 ? (data.boiler_usage_estimated / totalSteam) * 100 : 0;

  const totalDemand = data.total_power_generated + data.grid_import_estimated;
  const gtaPercent = totalDemand > 0 ? (data.total_power_generated / totalDemand) * 100 : 0;
  const gridPercent = totalDemand > 0 ? (data.grid_import_estimated / totalDemand) * 100 : 0;

  return (
    <div className="bg-[#313647] rounded-lg p-6 border border-[#435663]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon name="dashboard-tab" size={20} color="primary" />
          <h3 className="text-lg font-semibold text-[#FFF8D4]">Energy Flow Diagram</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#1E2028] rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-xs text-[#8E9098]">Live</span>
        </div>
      </div>

      <div className="relative h-[400px] flex items-center">
        {/* SVG Sankey Diagram */}
        <svg width="100%" height="100%" viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="freeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A3B087" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#A3B087" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="boilerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E86C5D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#E86C5D" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="steamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7FB3D5" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7FB3D5" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="powerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFD966" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFD966" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Column 1: Sources */}
          {/* Sulfur source */}
          <g>
            <rect x="50" y="80" width="120" height={freePercent * 2} rx="8" fill="#A3B087" opacity="0.9" />
            <text x="110" y={80 + freePercent} textAnchor="middle" fill="#FFF8D4" fontSize="14" fontWeight="600">
              Sulfur
            </text>
            <text x="110" y={80 + freePercent + 18} textAnchor="middle" fill="#FFF8D4" fontSize="12">
              {data.sulfur_flow.toFixed(1)} T/hr
            </text>
          </g>

          {/* Boiler source */}
          <g>
            <rect x="50" y={220} width="120" height={boilerPercent * 2} rx="8" fill="#E86C5D" opacity="0.9" />
            <text x="110" y={220 + boilerPercent} textAnchor="middle" fill="#FFF8D4" fontSize="14" fontWeight="600">
              Boiler
            </text>
            <text x="110" y={220 + boilerPercent + 18} textAnchor="middle" fill="#FFF8D4" fontSize="12">
              {data.boiler_usage_estimated.toFixed(0)} T/hr
            </text>
          </g>

          {/* Flow lines: Sources → Steam */}
          <path
            d={`M 170,${80 + freePercent} Q 280,${80 + freePercent} 350,180`}
            fill="none"
            stroke="url(#freeGradient)"
            strokeWidth={freePercent * 0.8}
            opacity="0.6"
          />
          <path
            d={`M 170,${220 + boilerPercent} Q 280,${220 + boilerPercent} 350,220`}
            fill="none"
            stroke="url(#boilerGradient)"
            strokeWidth={boilerPercent * 0.8}
            opacity="0.6"
          />

          {/* Column 2: MP Steam */}
          <g>
            <rect x="350" y="120" width="140" height="180" rx="8" fill="#7FB3D5" opacity="0.9" />
            <text x="420" y="195" textAnchor="middle" fill="#FFF8D4" fontSize="16" fontWeight="700">
              MP Steam
            </text>
            <text x="420" y="215" textAnchor="middle" fill="#FFF8D4" fontSize="14">
              {totalSteam.toFixed(0)} T/hr
            </text>
            <text x="420" y="235" textAnchor="middle" fill="#A3B087" fontSize="11">
              {freePercent.toFixed(0)}% Free
            </text>
          </g>

          {/* Flow lines: Steam → GTAs */}
          <path
            d="M 490,150 Q 580,150 650,140"
            fill="none"
            stroke="url(#steamGradient)"
            strokeWidth="30"
            opacity="0.6"
          />
          <path
            d="M 490,210 Q 580,210 650,210"
            fill="none"
            stroke="url(#steamGradient)"
            strokeWidth="30"
            opacity="0.6"
          />
          <path
            d="M 490,270 Q 580,270 650,280"
            fill="none"
            stroke="url(#steamGradient)"
            strokeWidth="30"
            opacity="0.6"
          />

          {/* Column 3: GTAs */}
          <g>
            {/* GTA 1 */}
            <rect x="650" y="100" width="100" height="60" rx="8" fill="#7FB3D5" opacity="0.8" />
            <text x="700" y="125" textAnchor="middle" fill="#FFF8D4" fontSize="13" fontWeight="600">
              GTA 1
            </text>
            <text x="700" y="145" textAnchor="middle" fill="#FFF8D4" fontSize="11">
              {data.gta_operations.gta1.power.toFixed(1)} MW
            </text>

            {/* GTA 2 */}
            <rect x="650" y="180" width="100" height="60" rx="8" fill="#7FB3D5" opacity="0.8" />
            <text x="700" y="205" textAnchor="middle" fill="#FFF8D4" fontSize="13" fontWeight="600">
              GTA 2
            </text>
            <text x="700" y="225" textAnchor="middle" fill="#FFF8D4" fontSize="11">
              {data.gta_operations.gta2.power.toFixed(1)} MW
            </text>

            {/* GTA 3 */}
            <rect x="650" y="260" width="100" height="60" rx="8" fill="#7FB3D5" opacity="0.8" />
            <text x="700" y="285" textAnchor="middle" fill="#FFF8D4" fontSize="13" fontWeight="600">
              GTA 3
            </text>
            <text x="700" y="305" textAnchor="middle" fill="#FFF8D4" fontSize="11">
              {data.gta_operations.gta3.power.toFixed(1)} MW
            </text>
          </g>

          {/* Flow lines: GTAs → Power */}
          <path
            d="M 750,130 Q 800,130 830,200"
            fill="none"
            stroke="url(#powerGradient)"
            strokeWidth="20"
            opacity="0.6"
          />
          <path
            d="M 750,210 L 830,210"
            fill="none"
            stroke="url(#powerGradient)"
            strokeWidth="20"
            opacity="0.6"
          />
          <path
            d="M 750,290 Q 800,290 830,220"
            fill="none"
            stroke="url(#powerGradient)"
            strokeWidth="20"
            opacity="0.6"
          />

          {/* Column 4: Output */}
          <g>
            {/* Total Power */}
            <rect x="830" y="160" width="120" height="80" rx="8" fill="#FFD966" opacity="0.9" />
            <text x="890" y="190" textAnchor="middle" fill="#1E2028" fontSize="15" fontWeight="700">
              Electricity
            </text>
            <text x="890" y="210" textAnchor="middle" fill="#1E2028" fontSize="13">
              {data.total_power_generated.toFixed(1)} MW
            </text>
            <text x="890" y="228" textAnchor="middle" fill="#435663" fontSize="10">
              {gtaPercent.toFixed(0)}% GTA
            </text>
          </g>

          {/* Grid Import (if any) */}
          {data.grid_import_estimated > 0.5 && (
            <g>
              <rect x="50" y="320" width="100" height="40" rx="8" fill="#FFD966" opacity="0.7" />
              <text x="100" y="338" textAnchor="middle" fill="#1E2028" fontSize="11" fontWeight="600">
                Grid
              </text>
              <text x="100" y="353" textAnchor="middle" fill="#1E2028" fontSize="10">
                {data.grid_import_estimated.toFixed(1)} MW
              </text>
              <path
                d="M 150,340 Q 500,340 830,240"
                fill="none"
                stroke="#FFD966"
                strokeWidth="8"
                strokeDasharray="5,5"
                opacity="0.5"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#A3B087]"></div>
          <span className="text-xs text-[#8E9098]">Free Steam (Sulfur)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#E86C5D]"></div>
          <span className="text-xs text-[#8E9098]">Boiler Steam</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#7FB3D5]"></div>
          <span className="text-xs text-[#8E9098]">MP Steam / GTAs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#FFD966]"></div>
          <span className="text-xs text-[#8E9098]">Electricity</span>
        </div>
      </div>
    </div>
  );
};
