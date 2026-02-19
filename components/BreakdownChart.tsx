
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CalculationResult } from '../types';

interface BreakdownChartProps {
  data: CalculationResult;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({ data }) => {
  const chartData = [
    { name: 'Выплаты рабочему', value: data.breakdown.workerTotal, color: '#3B82F6' },
    { name: 'Налоги и офис', value: data.breakdown.overhead, color: '#94A3B8' },
    { name: 'Персонал (Упр)', value: data.breakdown.staffTotal, color: '#6366F1' },
    { name: 'Чистая прибыль', value: data.breakdown.netProfit, color: '#10B981' },
  ];

  const formatValue = (value: number) => `${Math.round(value)} руб/час`;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatValue(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
