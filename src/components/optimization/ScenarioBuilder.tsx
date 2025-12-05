'use client';

import React, { useState } from 'react';
import { Icon } from '@/components/ui';

/**
 * ScenarioBuilder Component
 * 
 * Left sidebar for configuring simulation parameters.
 * Includes presets, demand sliders, context toggles, and machine availability.
 */

interface ScenarioConfig {
  steamDemand: number;
  electricityDemand: number;
  gridPeriod: 'off-peak' | 'peak';
  sulfurSupply: 100 | 50 | 0;
  gta1Available: boolean;
  gta2Available: boolean;
  gta3Available: boolean;
}

interface Preset {
  name: string;
  icon: string;
  config: ScenarioConfig;
}

interface ScenarioBuilderProps {
  onRunSimulation: (config: ScenarioConfig) => void;
  isSimulating: boolean;
}

const PRESETS: Preset[] = [
  {
    name: 'Standard Run',
    icon: 'dashboard-tab',
    config: {
      steamDemand: 250,
      electricityDemand: 60,
      gridPeriod: 'off-peak',
      sulfurSupply: 100,
      gta1Available: true,
      gta2Available: true,
      gta3Available: true,
    }
  },
  {
    name: 'Sulfur Drop',
    icon: 'warning',
    config: {
      steamDemand: 250,
      electricityDemand: 60,
      gridPeriod: 'off-peak',
      sulfurSupply: 50,
      gta1Available: true,
      gta2Available: true,
      gta3Available: true,
    }
  },
  {
    name: 'GTA Failure',
    icon: 'error',
    config: {
      steamDemand: 250,
      electricityDemand: 60,
      gridPeriod: 'peak',
      sulfurSupply: 100,
      gta1Available: false,
      gta2Available: true,
      gta3Available: true,
    }
  },
  {
    name: 'Max Production',
    icon: 'dashboard-tab',
    config: {
      steamDemand: 380,
      electricityDemand: 95,
      gridPeriod: 'off-peak',
      sulfurSupply: 100,
      gta1Available: true,
      gta2Available: true,
      gta3Available: true,
    }
  }
];

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ 
  onRunSimulation, 
  isSimulating 
}) => {
  const [config, setConfig] = useState<ScenarioConfig>(PRESETS[0].config);
  const [activePreset, setActivePreset] = useState(0);

  const handlePresetClick = (index: number) => {
    setActivePreset(index);
    setConfig(PRESETS[index].config);
  };

  const updateConfig = (updates: Partial<ScenarioConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
    setActivePreset(-1); // Clear preset selection when manually editing
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-800">
      {/* Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Icon name="settings" size={20} color="primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Scenario Configuration</h2>
            <p className="text-sm text-slate-400">Define the problem</p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Presets */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">
            Quick Presets
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PRESETS.map((preset, index) => (
              <button
                key={preset.name}
                onClick={() => handlePresetClick(index)}
                className={`
                  p-3 rounded-lg border transition-all
                  ${activePreset === index 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={preset.icon as any} size={16} />
                  <span className="text-sm font-medium">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Factory Demand */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide flex items-center gap-2">
            <Icon name="dashboard-tab" size={16} color="primary" />
            Factory Demand
          </h3>
          
          {/* Steam Demand Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Target Steam (MP)
              </label>
              <span className="text-2xl font-bold font-mono text-purple-400">
                {config.steamDemand}
                <span className="text-sm text-slate-500 ml-1">T/h</span>
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={400}
              step={10}
              value={config.steamDemand}
              onChange={(e) => updateConfig({ steamDemand: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>100</span>
              <span>400 T/h</span>
            </div>
          </div>

          {/* Electricity Demand Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">
                Target Electricity
              </label>
              <span className="text-2xl font-bold font-mono text-blue-400">
                {config.electricityDemand}
                <span className="text-sm text-slate-500 ml-1">MW</span>
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={5}
              value={config.electricityDemand}
              onChange={(e) => updateConfig({ electricityDemand: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>20</span>
              <span>100 MW</span>
            </div>
          </div>
        </div>

        {/* External Conditions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide flex items-center gap-2">
            <Icon name="workspace" size={16} color="primary" />
            External Conditions
          </h3>

          {/* Grid Period Toggle */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Grid Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateConfig({ gridPeriod: 'off-peak' })}
                className={`
                  px-4 py-3 rounded-lg border transition-all text-sm font-medium
                  ${config.gridPeriod === 'off-peak'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>💡</span>
                  <div className="text-left">
                    <div>Off-Peak</div>
                    <div className="text-xs opacity-70">0.55 DH/kWh</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => updateConfig({ gridPeriod: 'peak' })}
                className={`
                  px-4 py-3 rounded-lg border transition-all text-sm font-medium
                  ${config.gridPeriod === 'peak'
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⚡</span>
                  <div className="text-left">
                    <div>Peak</div>
                    <div className="text-xs opacity-70">1.27 DH/kWh</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Sulfur Supply Toggle */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Sulfur Supply (Free Steam Source)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[100, 50, 0].map((level) => (
                <button
                  key={level}
                  onClick={() => updateConfig({ sulfurSupply: level as 100 | 50 | 0 })}
                  className={`
                    px-3 py-2 rounded-lg border transition-all text-sm font-medium
                    ${config.sulfurSupply === level
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }
                  `}
                >
                  {level}%
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {config.sulfurSupply === 100 && '✅ Normal (100 T/h max)'}
              {config.sulfurSupply === 50 && '⚠️ Low Supply (50 T/h max)'}
              {config.sulfurSupply === 0 && '🔴 Sulfur Offline (0 T/h)'}
            </div>
          </div>
        </div>

        {/* Machine Availability */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wide flex items-center gap-2">
            <Icon name="agent-selector" size={16} color="primary" />
            Machine Availability
          </h3>
          
          <div className="space-y-3">
            {[1, 2, 3].map((num) => {
              const key = `gta${num}Available` as keyof ScenarioConfig;
              const isAvailable = config[key] as boolean;
              
              return (
                <div
                  key={num}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border transition-all
                    ${isAvailable 
                      ? 'bg-slate-800/50 border-slate-700' 
                      : 'bg-rose-500/5 border-rose-500/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon name="agent-selector" size={20} color={isAvailable ? 'primary' : 'secondary'} />
                    <div>
                      <div className="text-sm font-medium text-slate-200">GTA {num}</div>
                      <div className="text-xs text-slate-500">
                        {isAvailable ? 'Available' : 'Maintenance Mode'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => updateConfig({ [key]: !isAvailable })}
                    className={`
                      relative w-12 h-6 rounded-full transition-colors
                      ${isAvailable ? 'bg-emerald-500' : 'bg-slate-600'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${isAvailable ? 'translate-x-7' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer: Run Button */}
      <div className="p-6 border-t border-slate-800">
        <button
          onClick={() => onRunSimulation(config)}
          disabled={isSimulating}
          className={`
            w-full py-4 rounded-lg font-bold text-lg transition-all
            ${isSimulating
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 shadow-lg hover:shadow-emerald-500/50'
            }
          `}
        >
          {isSimulating ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              Running Simulation...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Icon name="send" size={20} />
              RUN SIMULATION
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
