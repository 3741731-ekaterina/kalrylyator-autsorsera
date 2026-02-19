
import React from 'react';

interface InputControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  hint?: string;
}

export const InputControl: React.FC<InputControlProps> = ({
  label, value, onChange, min, max, step = 1, unit, hint,
}) => {
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const sliderBg = `linear-gradient(to right, #5b5ef4 ${pct}%, #e2e8f0 ${pct}%)`;

  return (
    <div style={{ marginBottom: 22 }}>
      {/* Label + input row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </label>
          {hint && (
            <div
              title={hint}
              style={{
                width: 16, height: 16, borderRadius: '50%', background: '#e0e7ff',
                color: '#5b5ef4', fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, cursor: 'help',
              }}
            >i</div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            style={{ width: 72 }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', minWidth: 36 }}>{unit}</span>
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: sliderBg }}
      />
    </div>
  );
};
