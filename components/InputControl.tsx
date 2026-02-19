
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

  return (
    <div style={{ marginBottom: 26 }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: hint ? 2 : 10, gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.72)', display: 'block' }}>
            {label}
          </label>
          {hint && (
            <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{hint}</p>
          )}
        </div>
        {/* Number input + unit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
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
            style={{ width: 76 }}
          />
          <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', minWidth: 32 }}>{unit}</span>
        </div>
      </div>

      {/* Slider with gold fill track */}
      <div style={{ position: 'relative', paddingTop: hint ? 10 : 0 }}>
        {/* Filled track background */}
        <div style={{
          position: 'absolute',
          top: hint ? 'calc(50% + 5px)' : '50%',
          left: 0,
          height: 3,
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #c9963b, #f0c458)',
          borderRadius: 2,
          pointerEvents: 'none',
          transform: 'translateY(-50%)',
          zIndex: 1,
        }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: 'relative', zIndex: 2, width: '100%' }}
        />
      </div>
    </div>
  );
};
