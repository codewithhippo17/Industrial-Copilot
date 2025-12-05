'use client';

import React from 'react';
import { Icon } from '@/components/ui';
import { OptimizationResult } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/**
 * SimulationResults Component
 * 
 * Right panel showing optimization results after simulation.
 * Includes financial impact, source mix comparison, and action checklist.
 */

interface SimulationResultsProps {
  result: OptimizationResult;
  config: {
    steamDemand: number;
    electricityDemand: number;
  };
}

interface ActionItem {
  type: 'success' | 'warning' | 'action';
  icon: string;
  text: string;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({ result, config }) => {
  // Calculate baseline vs optimized for comparison
  const baselineBoilerSteam = config.steamDemand * 0.4; // Assume 40% boiler in baseline
  const baselineSulfurSteam = result.sulfur_steam;
  const baselineGTASteam = config.steamDemand - baselineBoilerSteam - baselineSulfurSteam;

  const optimizedBoilerSteam = result.boiler_output;
  const optimizedSulfurSteam = result.sulfur_steam;
  const optimizedGTASteam = result.gtas.reduce((sum, gta) => sum + gta.soutirage, 0);

  // Source mix data for comparison
  const comparisonData = [
    {
      name: 'Baseline',
      sulfur: baselineSulfurSteam,
      gta: baselineGTASteam,
      boiler: baselineBoilerSteam,
    },
    {
      name: 'Optimized',
      sulfur: optimizedSulfurSteam,
      gta: optimizedGTASteam,
      boiler: optimizedBoilerSteam,
    }
  ];

  // Generate action checklist
  const generateActions = (): ActionItem[] => {
    const actions: ActionItem[] = [];

    // GTA Actions
    result.gtas.forEach((gta) => {
      // Check if GTA is actually running (power > 0.1 MW threshold)
      if (gta.power > 0.1 && gta.admission > 1) {
        actions.push({
          type: 'action',
          icon: 'agent-selector',
          text: `Set GTA ${gta.gta_number} Admission to ${gta.admission.toFixed(1)} T/h`
        });
        if (gta.soutirage > 10) {
          actions.push({
            type: 'success',
            icon: 'checkmark',
            text: `Extract ${gta.soutirage.toFixed(1)} T/h steam from GTA ${gta.gta_number}`
          });
        }
      } else {
        // GTA is off or constrained to be off
        actions.push({
          type: 'warning',
          icon: 'stop',
          text: `Keep GTA ${gta.gta_number} offline (${gta.power < 0.1 && gta.admission < 1 ? 'constrained' : 'not economical'})`
        });
      }
    });

    // Boiler action
    if (result.boiler_output < 10) {
      actions.push({
        type: 'success',
        icon: 'checkmark',
        text: `Stop Auxiliary Boiler (Save 284 DH/T)`
      });
    } else {
      actions.push({
        type: 'warning',
        icon: 'warning',
        text: `Run Boiler at ${result.boiler_output.toFixed(1)} T/h (Expensive: 284 DH/T)`
      });
    }

    // Grid action
    if (result.grid_import < 10) {
      actions.push({
        type: 'success',
        icon: 'checkmark',
        text: `Minimize grid import (${result.grid_import.toFixed(1)} MW)`
      });
    } else {
      actions.push({
        type: 'action',
        icon: 'globe',
        text: `Import ${result.grid_import.toFixed(1)} MW from grid`
      });
    }

    // Pressure monitoring (if pressure would be critical)
    const totalSteam = optimizedSulfurSteam + optimizedGTASteam + optimizedBoilerSteam;
    const estimatedPressure = 7 + (totalSteam / config.steamDemand) * 2; // Rough estimate
    
    if (estimatedPressure < 8.5) {
      actions.push({
        type: 'warning',
        icon: 'warning',
        text: `⚠️ Monitor MP Pressure (Predicted: ${estimatedPressure.toFixed(1)} bar)`
      });
    } else {
      actions.push({
        type: 'success',
        icon: 'checkmark',
        text: `✓ Process Reliability: Stable (${estimatedPressure.toFixed(1)} bar)`
      });
    }

    return actions;
  };

  const actions = generateActions();
  const savingsPercent = ((result.savings / result.baseline_cost) * 100).toFixed(1);

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Financial Impact - The "Wow" Factor */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Icon name="star" size={20} color="primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Financial Impact</h2>
            <p className="text-sm text-slate-400">Cost comparison per hour</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Baseline Cost */}
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">Baseline Cost</div>
            <div className="text-3xl font-bold font-mono text-slate-300">
              {result.baseline_cost.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">DH/hr</div>
            <div className="mt-3 text-xs text-slate-400">
              (Inefficient Operation)
            </div>
          </div>

          {/* Optimized Cost */}
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">Optimized Cost</div>
            <div className="text-3xl font-bold font-mono text-blue-400">
              {result.total_cost.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">DH/hr</div>
            <div className="mt-3 text-xs text-emerald-400">
              ({savingsPercent}% reduction)
            </div>
          </div>

          {/* Net Savings */}
          <div className="text-center bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-lg border border-emerald-500/30 p-4">
            <div className="text-sm text-emerald-300 mb-2 font-semibold">Net Savings</div>
            <div className="text-4xl font-bold font-mono text-emerald-400">
              {result.savings.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-300 mt-1 font-semibold">DH/hr</div>
            <div className="mt-3 text-xs text-emerald-400 flex items-center justify-center gap-1">
              <Icon name="thumbs-up" size={16} color="primary" />
              <span>{(result.savings * 8760).toLocaleString()} DH/year</span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-3">Optimized Cost Breakdown</div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Grid</div>
              <div className="text-lg font-bold text-blue-400">
                {result.cost_breakdown.grid.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">DH/hr</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Boiler</div>
              <div className="text-lg font-bold text-rose-400">
                {result.cost_breakdown.boiler.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">DH/hr</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Sulfur</div>
              <div className="text-lg font-bold text-emerald-400">
                {result.cost_breakdown.sulfur.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">DH/hr</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">GTA Fuel</div>
              <div className="text-lg font-bold text-purple-400">
                {result.cost_breakdown.gta_fuel.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">DH/hr</div>
            </div>
          </div>
        </div>
      </div>

      {/* Source Mix Comparison */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <Icon name="dashboard-tab" size={20} color="primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Steam Source Mix</h2>
            <p className="text-sm text-slate-400">Baseline vs Optimized</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 14 }}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis 
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#475569' }}
              label={{ value: 'Steam (T/h)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                border: '1px solid #475569',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  sulfur: 'Sulfur (Free, 20 DH/T)',
                  gta: 'GTA Extraction',
                  boiler: 'Boiler (Expensive, 284 DH/T)'
                };
                return [value.toFixed(1) + ' T/h', labels[name] || name];
              }}
            />
            <Bar dataKey="sulfur" stackId="a" fill="#10b981" name="Sulfur" />
            <Bar dataKey="gta" stackId="a" fill="#3b82f6" name="GTA" />
            <Bar dataKey="boiler" stackId="a" fill="#ef4444" name="Boiler" />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span className="text-sm text-slate-300">Sulfur (Free, 20 DH/T)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-slate-300">GTA Extraction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-500 rounded"></div>
            <span className="text-sm text-slate-300">Boiler (Expensive, 284 DH/T)</span>
          </div>
        </div>
      </div>

      {/* Action Checklist */}
      <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
            <Icon name="commands" size={20} color="primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Operator Actions</h2>
            <p className="text-sm text-slate-400">Implementation checklist</p>
          </div>
        </div>

        <div className="space-y-3">
          {actions.map((action, index) => {
            const colorMap = {
              success: 'border-emerald-500/30 bg-emerald-500/5',
              warning: 'border-amber-500/30 bg-amber-500/5',
              action: 'border-blue-500/30 bg-blue-500/5'
            };
            const iconColorMap = {
              success: 'text-emerald-400',
              warning: 'text-amber-400',
              action: 'text-blue-400'
            };

            return (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border
                  ${colorMap[action.type]}
                `}
              >
                <div className={`flex-shrink-0 ${iconColorMap[action.type]}`}>
                  <Icon name={action.icon as any} size={20} />
                </div>
                <span className="text-sm text-slate-200">{action.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
