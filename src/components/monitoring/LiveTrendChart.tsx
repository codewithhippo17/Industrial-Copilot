'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TrendDataPoint {
  time: string;
  gtaTotal: number;
  gridImport: number;
  mpPressure: number;
}

interface LiveTrendChartProps {
  currentGTATotal: number;
  currentGridImport: number;
  currentMPPressure: number;
}

export const LiveTrendChart: React.FC<LiveTrendChartProps> = ({
  currentGTATotal,
  currentGridImport,
  currentMPPressure
}) => {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);

  useEffect(() => {
    // Add new data point
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTrendData(prev => {
      const newData = [
        ...prev,
        {
          time: timeStr,
          gtaTotal: currentGTATotal,
          gridImport: currentGridImport,
          mpPressure: currentMPPressure
        }
      ];

      // Keep only last 20 data points (approx 1.5 minutes at 5s refresh)
      return newData.slice(-20);
    });
  }, [currentGTATotal, currentGridImport, currentMPPressure]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Power Chart */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">Power Generation</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="gtaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10}
              tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
            />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="gtaTotal"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#gtaGradient)"
              name="GTA Total (MW)"
            />
            <Area
              type="monotone"
              dataKey="gridImport"
              stackId="1"
              stroke="#f59e0b"
              fill="url(#gridGradient)"
              name="Grid Import (MW)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pressure Chart */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wide">MP Steam Pressure</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={10}
              tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11}
              domain={[7.5, 10.0]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
            <ReferenceLine 
              y={8.5} 
              stroke="#f43f5e" 
              strokeDasharray="5 5"
              label={{ value: 'Critical Limit', position: 'right', fill: '#f43f5e', fontSize: 10 }}
            />
            <Line
              type="monotone"
              dataKey="mpPressure"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 2 }}
              name="Pressure (bar)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
