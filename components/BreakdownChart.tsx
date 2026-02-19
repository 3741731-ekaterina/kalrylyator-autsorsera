
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalculationResult } from '../types';

interface BreakdownChartProps {
  data: CalculationResult;
}

const CHART_DATA = (d: CalculationResult) => [
  { name: 'Выплаты рабочему', value: d.breakdown.workerTotal,  color: '#4f8ef7' },
  { name: 'Налоги и офис',    value: d.breakdown.overhead,     color: '#64748b' },
  { name: 'ЗП персонала',     value: d.breakdown.staffTotal,   color: '#a78bfa' },
  { name: 'Чистая прибыль',   value: d.breakdown.netProfit,    color: '#34d399' },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: { color: string };
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayloadItem[] }) => {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: 'rgba(8,10,20,0.96)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.55)',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{item.name}</p>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: item.payload.color }}>
        {Math.round(item.value).toLocaleString('ru-RU')} ₽/ч
      </p>
    </div>
  );
};

export const BreakdownChart: React.FC<BreakdownChartProps> = ({ data }) => {
  const chartData = CHART_DATA(data);

  return (
    <div style={{ height: 220, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ filter: `drop-shadow(0 0 6px ${entry.color}70)`, cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
