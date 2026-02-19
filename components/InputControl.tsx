
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
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  hint
}) => {
  return (
    <div className="flex flex-col gap-2 mb-6">
      <div className="flex justify-between items-center">
        <label className="text-sm font-semibold text-slate-700">{label}</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-20 px-2 py-1 text-right text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <span className="text-xs text-slate-500 font-medium">{unit}</span>
        </div>
      </div>
      {hint && <p className="text-[10px] text-slate-400 -mt-1">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};
