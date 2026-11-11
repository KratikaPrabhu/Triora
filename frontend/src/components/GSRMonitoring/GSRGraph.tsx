import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { VitalsReading, PhysiologicalParam } from '../../types/gsr';

interface GSRGraphProps {
  readings: VitalsReading[];
  selectedParam: PhysiologicalParam;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      timeLabel: string;
      value: number;
    };
  }>;
  unit: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, unit }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="gsr-graph-tooltip">
        <span className="gsr-tooltip-val">
          <strong>{data.value}</strong> {unit}
        </span>
      </div>
    );
  }
  return null;
};

export const GSRGraph: React.FC<GSRGraphProps> = ({ readings, selectedParam }) => {
  const formatSeconds = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine configuration based on parameter selected
  const paramConfig = React.useMemo(() => {
    switch (selectedParam) {
      case 'conductance':
        return {
          title: 'Galvanic Skin Response (GSR)',
          yLabel: 'µS',
          unit: 'µS',
          domain: [0, 20] as [number, number],
          ticks: [0, 5, 10, 15, 20],
          getValue: (r: VitalsReading) => r.conductance,
          defaultValues: [3.2, 4.1, 3.5, 4.6, 3.9, 7.8, 5.8, 6.2],
        };
      case 'resistance':
        return {
          title: 'Skin Resistance',
          yLabel: 'kΩ',
          unit: 'kΩ',
          domain: [0, 400] as [number, number],
          ticks: [0, 100, 200, 300, 400],
          getValue: (r: VitalsReading) => r.resistance,
          defaultValues: [310, 244, 285, 217, 256, 128, 172, 161],
        };
      case 'heartRate':
        return {
          title: 'Heart Rate (Pulse)',
          yLabel: 'BPM',
          unit: 'BPM',
          domain: [40, 120] as [number, number],
          ticks: [40, 60, 80, 100, 120],
          getValue: (r: VitalsReading) => r.heartRate,
          defaultValues: [68, 70, 72, 71, 74, 82, 76, 73],
        };
      case 'hrv':
        return {
          title: 'Heart Rate Variability (HRV)',
          yLabel: 'ms',
          unit: 'ms',
          domain: [0, 100] as [number, number],
          ticks: [0, 25, 50, 75, 100],
          getValue: (r: VitalsReading) => r.hrv,
          defaultValues: [48, 52, 49, 46, 50, 38, 44, 48],
        };
    }
  }, [selectedParam]);

  // Transform readings
  const chartData = React.useMemo(() => {
    if (readings.length === 0) {
      // Seed nice initial baseline wave matching the screenshot curve
      const times = [0, 20, 40, 60, 80, 100, 120, 140];
      return times.map((t, idx) => ({
        timeSec: t,
        timeLabel: formatSeconds(t),
        value: paramConfig.defaultValues[idx],
      }));
    }

    return readings.map((r) => ({
      timeSec: r.sessionElapsedSeconds,
      timeLabel: formatSeconds(r.sessionElapsedSeconds),
      value: paramConfig.getValue(r),
    }));
  }, [readings, paramConfig]);

  return (
    <div className="physio-graph-block">
      <div className="physio-graph-header">
        <h4 className="physio-graph-title">{paramConfig.title}</h4>
      </div>

      <div className="gsr-graph-container" role="region" aria-label="Physiological parameter graph">
        {/* Y-axis top unit label as seen in screenshot */}
        <div className="physio-yaxis-unit">{paramConfig.yLabel}</div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={chartData}
            margin={{ top: 14, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="physioAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1b6ca8" stopOpacity={0.28} />
                <stop offset="60%" stopColor="#1b6ca8" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#1b6ca8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="2 2"
              stroke="#e8eff5"
              vertical={false}
            />

            <XAxis
              tick={false}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              height={2}
            />

            <YAxis
              domain={paramConfig.domain}
              ticks={paramConfig.ticks}
              stroke="#94a3b8"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />

            <Tooltip content={<CustomTooltip unit={paramConfig.unit} />} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="#1b6ca8"
              strokeWidth={2.3}
              fill="url(#physioAreaGradient)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
