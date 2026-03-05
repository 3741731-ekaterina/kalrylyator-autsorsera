
import React, { useState, useEffect, useRef } from 'react';

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
  const [hintOpen, setHintOpen] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  const sliderBg = `linear-gradient(to right, #5b5ef4 ${pct}%, #e2e8f0 ${pct}%)`;

  useEffect(() => {
    if (!hintOpen) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (hintRef.current && !hintRef.current.contains(e.target as Node)) setHintOpen(false);
    };
    const timer = setTimeout(() => setHintOpen(false), 4000);
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close as EventListener);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close as EventListener);
      clearTimeout(timer);
    };
  }, [hintOpen]);

  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {label}
          </label>
          {hint && (
            <div ref={hintRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setHintOpen(v => !v)}
                style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: hintOpen ? '#5b5ef4' : '#e0e7ff',
                  color: hintOpen ? '#fff' : '#5b5ef4',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, cursor: 'pointer', userSelect: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >i</div>
              {hintOpen && (
                <div style={{
                  position: 'absolute', top: 22, left: 0, zIndex: 200,
                  background: '#1e293b', color: '#e2e8f0',
                  fontSize: 12, lineHeight: 1.55, padding: '8px 12px',
                  borderRadius: 10, width: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  animation: 'hint-in 0.15s ease',
                }}>
                  {hint}
                </div>
              )}
            </div>
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
