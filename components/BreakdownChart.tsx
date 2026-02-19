
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CalculationResult } from '../types';

interface BreakdownChartProps {
  data: CalculationResult;
  centerValue: number;
}

const SEGMENTS = (d: CalculationResult) => [
  { name: 'Выплаты рабочему', value: d.breakdown.workerTotal,  color: '#5b5ef4' },
  { name: 'Налоги и офис',    value: d.breakdown.overhead,     color: '#f59e0b' },
  { name: 'ЗП персонала',     value: d.breakdown.staffTotal,   color: '#10b981' },
  { name: 'Чистая прибыль',   value: d.breakdown.netProfit,    color: '#ec4899' },
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
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: 10, padding: '8px 12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: 12,
    }}>
      <p style={{ margin: '0 0 3px', color: '#64748b', fontWeight: 600 }}>{item.name}</p>
      <p style={{ margin: 0, fontWeight: 800, color: item.payload.color }}>
        {Math.round(item.value).toLocaleString('ru-RU')} ₽/ч
      </p>
    </div>
  );
};

export const BreakdownChart: React.FC<BreakdownChartProps> = ({ data, centerValue }) => {
  const segments = SEGMENTS(data);
  const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      {/* List */}
      <div style={{ flex: '1 1 180px', minWidth: 180 }}>
        {segments.map((seg, idx) => {
          const pct = centerValue > 0 ? (seg.value / centerValue) * 100 : 0;
          return (
            <div key={idx} className="breakdown-item">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: seg.color, flexShrink: 0, boxShadow: `0 0 6px ${seg.color}60` }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{seg.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#1e293b' }}>{fmt(seg.value)} ₽</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', minWidth: 30, textAlign: 'right' }}>{Math.round(pct)}%</span>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: seg.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Donut chart */}
      <div style={{ flex: '0 0 200px', height: 200, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              cx="50%" cy="50%"
              innerRadius={62} outerRadius={82}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: 2 }}>Итого</span>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>{fmt(centerValue)}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>₽/ЧАС</span>
        </div>
      </div>
    </div>
  );
};
