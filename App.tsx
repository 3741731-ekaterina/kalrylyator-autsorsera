
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CalculatorInputs, SavedCalculation } from './types';
import { calculateOutsourcingRate } from './utils/calculations';
import { InputControl } from './components/InputControl';
import { BreakdownChart } from './components/BreakdownChart';

const INITIAL_INPUTS: CalculatorInputs = {
  workerSalary: 450,
  smzTaxEnabled: true,
  overheadPercent: 11,
  managerPercent: 10,
  deptHeadSalary: 25,
  profitPercent: 20,
  shiftHours: 8,
  workersCount: 1,
  workDaysPerMonth: 21,
};

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

const fmtDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// ── Icons ──
const TgIcon = ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} fill={color} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.35-1.77 4.84-1.78.11 0 .35.03.5.16.13.1.17.24.18.34.01.06.02.18.01.23z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const WarnIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

const PrintIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
    <path d="M6 14h12v8H6z"/>
  </svg>
);

// ── Save Modal ──
interface SaveModalProps { onSave: (name: string) => void; onClose: () => void; }
const SaveModal: React.FC<SaveModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80); }, []);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (name.trim()) onSave(name.trim()); };
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>Сохранить расчёт</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Дайте название, чтобы легко найти потом</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input ref={inputRef} className="modal-input" type="text" placeholder='Например: «Склад А», «Ритейл», «Офис 2024»' value={name} onChange={e => setName(e.target.value)} maxLength={60} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: -8, marginBottom: 20 }}>
            {['Склад А', 'Ритейл', 'Производство', 'Клининг'].map(ex => (
              <button key={ex} type="button" onClick={() => setName(ex)}
                style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #e2e8f0', background: name === ex ? '#5b5ef4' : '#f8faff', color: name === ex ? '#fff' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                {ex}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>Отмена</button>
            <button type="submit" className="btn-primary" disabled={!name.trim()} style={{ flex: 2, padding: '12px', fontSize: 14, opacity: name.trim() ? 1 : 0.5 }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Expert avatar card ──
const ExpertCard = ({ photo, name, role, tg, accentColor }: { photo: string; name: string; role: string; tg: string; accentColor: string }) => (
  <a href={tg} target="_blank" rel="noopener noreferrer"
    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', textDecoration: 'none', color: 'inherit', transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'pointer', boxShadow: '0 2px 12px rgba(91,94,244,0.06)' }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 24px ${accentColor}20`; }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '0 2px 12px rgba(91,94,244,0.06)'; }}
  >
    <img src={photo} alt={name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: `2.5px solid ${accentColor}`, flexShrink: 0, boxShadow: `0 0 0 3px ${accentColor}25` }} />
    <div style={{ minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap' }}>{name}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
        <TgIcon size={12} color={accentColor} />
        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{role}</p>
      </div>
    </div>
  </a>
);

// ── Lead magnet card ──
const LeadMagnet = () => (
  <div className="no-print" style={{
    borderRadius: 20, padding: '1.5rem 1.75rem',
    background: 'linear-gradient(135deg, #f0f1ff 0%, #faf5ff 50%, #f0fdf4 100%)',
    border: '1.5px solid rgba(91,94,244,0.14)',
    boxShadow: '0 4px 20px rgba(91,94,244,0.07)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
      <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>🎯</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#5b5ef4', padding: '2px 8px', borderRadius: 999, background: 'rgba(91,94,244,0.1)', border: '1px solid rgba(91,94,244,0.15)' }}>Бесплатно</span>
        </div>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1e293b', lineHeight: 1.3 }}>
          Нужна помощь с ценообразованием?
        </h4>
      </div>
    </div>
    <p style={{ margin: '0 0 16px', fontSize: 13, color: '#475569', lineHeight: 1.65 }}>
      Разберём вашу модель, найдём точки роста маржи и поможем выстроить цену, которая работает. <strong style={{ color: '#1e293b' }}>Бесплатная экспресс-консультация</strong> — ответим в Telegram в течение 24 часов.
    </p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
      <a href="https://t.me/yahontova_finance" target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: '#5b5ef4', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700, transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 4px 14px rgba(91,94,244,0.35)' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 6px 20px rgba(91,94,244,0.45)'; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '0 4px 14px rgba(91,94,244,0.35)'; }}>
        <TgIcon size={15} color="#fff" />
        Екатерина Яхонтова
      </a>
      <a href="https://t.me/elenademina_findoctor" target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 12, background: '#fff', color: '#5b5ef4', textDecoration: 'none', fontSize: 13, fontWeight: 700, border: '1.5px solid rgba(91,94,244,0.25)', transition: 'transform 0.15s, box-shadow 0.15s' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-1px)'; el.style.boxShadow = '0 6px 20px rgba(91,94,244,0.12)'; }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; }}>
        <TgIcon size={15} color="#5b5ef4" />
        Елена Демина
      </a>
    </div>
  </div>
);

// ── Animated number ──
const AnimatedNum: React.FC<{ value: number }> = ({ value }) => {
  const [displayed, setDisplayed] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    const diff = value - from;
    if (Math.abs(diff) < 1) { setDisplayed(value); fromRef.current = value; return; }
    const t0 = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - t0) / 380, 1);
      setDisplayed(Math.round(from + diff * (1 - Math.pow(1 - t, 3))));
      if (t < 1) rafRef.current = requestAnimationFrame(run);
      else fromRef.current = value;
    };
    rafRef.current = requestAnimationFrame(run);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value]);

  return <>{fmt(displayed)}</>;
};

// ── Compare modal (N расчётов) ──
interface CompareModalProps { calcs: SavedCalculation[]; onClose: () => void; }
const CompareModal: React.FC<CompareModalProps> = ({ calcs, onClose }) => {
  type Row = { label: string; values: string[] };
  const v = (c: SavedCalculation) => ({
    r: c.result,
    i: c.inputs,
  });

  const rows: Row[] = [
    { label: 'Цена для заказчика', values: calcs.map(c => `${fmt(v(c).r.pricePerHour)} ₽/ч`) },
    { label: 'Себестоимость',       values: calcs.map(c => `${fmt(v(c).r.costPrice)} ₽/ч`) },
    { label: 'Стоимость смены',     values: calcs.map(c => `${fmt(v(c).r.pricePerShift)} ₽`) },
    { label: 'Прибыль со смены',    values: calcs.map(c => `${fmt(v(c).r.grossProfitPerShift)} ₽`) },
    { label: 'Выручка / месяц',     values: calcs.map(c => `${fmt(v(c).r.pricePerMonth)} ₽`) },
    { label: 'Прибыль / месяц',     values: calcs.map(c => `${fmt(v(c).r.profitPerMonth)} ₽`) },
    { label: '__div__',             values: [] },
    { label: 'ЗП рабочего',        values: calcs.map(c => `${v(c).i.workerSalary} ₽/ч`) },
    { label: 'Прибыль %',          values: calcs.map(c => `${v(c).i.profitPercent}%`) },
    { label: 'Накладные %',        values: calcs.map(c => `${v(c).i.overheadPercent}%`) },
    { label: 'Рабочих',            values: calcs.map(c => `${v(c).i.workersCount} чел`) },
    { label: 'Дней / мес',         values: calcs.map(c => `${v(c).i.workDaysPerMonth}`) },
  ];

  // Подсвечиваем максимальное значение в строке (только если не все одинаковые)
  const isMax = (values: string[]): boolean[] => {
    const nums = values.map(s => parseFloat(s.replace(/[^\d.]/g, '')));
    if (nums.some(isNaN)) return values.map(() => false);
    const max = Math.max(...nums);
    const allSame = nums.every(n => n === max);
    return nums.map(n => !allSame && n === max);
  };

  const cols = calcs.length;
  const colTemplate = `1.4fr repeat(${cols}, 1fr)`;
  const modalWidth = Math.min(320 + cols * 160, 940);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: modalWidth, padding: '1.5rem', width: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>
            Сравнение расчётов · {cols}
          </h3>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 8, marginBottom: 8, minWidth: 320 + cols * 130 }}>
            <div />
            {calcs.map(c => (
              <div key={c.id} style={{ background: 'rgba(91,94,244,0.07)', borderRadius: 10, padding: '8px 10px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</p>
                <p style={{ margin: 0, fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{fmtDate(c.timestamp)}</p>
              </div>
            ))}
          </div>
          {/* Table rows */}
          <div style={{ maxHeight: '55vh', overflowY: 'auto', minWidth: 320 + cols * 130 }}>
            {rows.map((row, i) => {
              if (row.label === '__div__') return <div key={i} style={{ borderTop: '1px solid #f1f5f9', margin: '6px 0' }} />;
              const highlights = isMax(row.values);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 8, padding: '7px 0', borderBottom: '1px solid #f8faff', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b', fontWeight: 500 }}>{row.label}</p>
                  {row.values.map((val, j) => (
                    <p key={j} style={{ margin: 0, fontSize: 13, fontWeight: 700, color: highlights[j] ? '#10b981' : '#1e293b', textAlign: 'center' }}>{val}</p>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <p style={{ margin: '10px 0 14px', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
          Зелёным отмечены наибольшие значения в строке
        </p>
        <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '11px', fontSize: 14 }}>Закрыть</button>
      </div>
    </div>
  );
};

// ── Main App ──
const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showVat, setShowVat] = useState(false);
  const [vatRate, setVatRate] = useState(0);
  const [vatRateStr, setVatRateStr] = useState<string | null>(null);

  // Load saved calculations
  useEffect(() => {
    const stored = localStorage.getItem('outsourcer_calcs');
    if (stored) setSavedCalculations(JSON.parse(stored));
  }, []);

  // Load inputs from URL (share link)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.has('w')) {
      setInputs({
        workerSalary: Math.max(100, Math.min(10000, Number(p.get('w')) || 450)),
        smzTaxEnabled: p.get('smz') !== '0',
        overheadPercent: Math.max(0, Math.min(50, Number(p.get('oh')) || 11)),
        managerPercent: Math.max(0, Math.min(100, Number(p.get('mgr')) || 10)),
        deptHeadSalary: Math.max(0, Math.min(500, Number(p.get('dh')) || 25)),
        profitPercent: Math.max(0, Math.min(50, Number(p.get('prf')) || 20)),
        shiftHours: Math.max(1, Math.min(24, Number(p.get('sh')) || 8)),
        workersCount: Math.max(1, Math.min(500, Number(p.get('wc')) || 1)),
        workDaysPerMonth: Math.max(1, Math.min(31, Number(p.get('wd')) || 21)),
      });
    }
  }, []);

  const result = useMemo(() => calculateOutsourcingRate(inputs), [inputs]);

  const totalPercent = inputs.overheadPercent + inputs.profitPercent;
  const isInvalid = totalPercent >= 100;
  const isWarning = totalPercent >= 70 && !isInvalid;

  const set = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const handleReset = () => setInputs(INITIAL_INPUTS);

  const handleSaveConfirm = (name: string) => {
    const newCalc: SavedCalculation = { id: crypto.randomUUID(), name, inputs, result, timestamp: Date.now() };
    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
    setShowSaveModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = savedCalculations.filter(c => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
    setCompareIds(prev => prev.filter(x => x !== id));
  };

  const startRename = (calc: SavedCalculation, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(calc.id);
    setRenameValue(calc.name);
  };

  const commitRename = () => {
    if (!renamingId || !renameValue.trim()) { setRenamingId(null); return; }
    const updated = savedCalculations.map(c => c.id === renamingId ? { ...c, name: renameValue.trim() } : c);
    setSavedCalculations(updated);
    localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
    setRenamingId(null);
  };

  const loadCalculation = (saved: SavedCalculation) => {
    setInputs(saved.inputs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompareToggle = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleShare = () => {
    const p = new URLSearchParams({
      w: String(inputs.workerSalary),
      smz: inputs.smzTaxEnabled ? '1' : '0',
      oh: String(inputs.overheadPercent),
      mgr: String(inputs.managerPercent),
      dh: String(inputs.deptHeadSalary),
      prf: String(inputs.profitPercent),
      sh: String(inputs.shiftHours),
      wc: String(inputs.workersCount),
      wd: String(inputs.workDaysPerMonth),
    });
    const url = `${window.location.origin}${window.location.pathname}?${p}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const compareCalcs = compareIds.length >= 2
    ? compareIds.map(id => savedCalculations.find(c => c.id === id)!).filter(Boolean)
    : null;

  return (
    <>
      <style>{`
        .main-layout { display: flex; flex-direction: column; gap: 20px; }
        .inputs-col  { flex: none; width: 100%; }
        .results-col { flex: 1 1 0; min-width: 0; }
        @media (min-width: 900px) {
          .main-layout { flex-direction: row; align-items: flex-start; }
          .inputs-col  { width: 340px; flex-shrink: 0; }
        }
        .metrics-row { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 20px; }
        @media (min-width: 560px) { .metrics-row { grid-template-columns: repeat(3, 1fr); } }
        .experts-row { display: flex; flex-direction: column; gap: 10px; justify-content: center; }
        @media (min-width: 560px) { .experts-row { flex-direction: row; } }
        .saved-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 480px) { .saved-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {showSaveModal && <SaveModal onSave={handleSaveConfirm} onClose={() => setShowSaveModal(false)} />}
      {showCompare && compareCalcs && compareCalcs.length >= 2 && (
        <CompareModal calcs={compareCalcs} onClose={() => { setShowCompare(false); setCompareIds([]); }} />
      )}

      <div style={{ minHeight: '100vh', background: '#edf0fb', position: 'relative', overflowX: 'hidden' }}>

        {/* ── 3D Background ── */}
        <div className="no-print" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div className="orb-1" style={{ position: 'absolute', top: '-12%', left: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,94,244,0.09) 0%, transparent 68%)' }} />
          <div className="orb-2" style={{ position: 'absolute', bottom: '-18%', right: '-10%', width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 68%)' }} />
          <div className="orb-3" style={{ position: 'absolute', top: '40%', left: '45%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 68%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(91,94,244,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(91,94,244,0.025) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto', padding: '2rem 1rem 4rem' }}>

          {/* ════ HEADER ════ */}
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ margin: '0 0 8px', lineHeight: 1.1, fontSize: 'clamp(1.7rem,5vw,2.8rem)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
              Калькулятор аутсорсера
            </h1>
            <p style={{ maxWidth: 480, margin: '0 auto 24px', fontSize: 15, color: '#64748b', lineHeight: 1.7, fontWeight: 500 }}>
              Калькулятор стоимости часа персонала для аутсорсинговой компании
            </p>

            {/* ── Авторы ── */}
            <div className="no-print" style={{ marginBottom: 8 }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.04em' }}>
                Разработан финансистами с опытом в аутсорсинге 4+ лет
              </p>
              <div className="experts-row">
                <ExpertCard
                  photo="photo-yahontova.jpg"
                  name="Екатерина Яхонтова"
                  role="Финансовый эксперт"
                  tg="https://t.me/yahontova_finance"
                  accentColor="#5b5ef4"
                />
                <ExpertCard
                  photo="photo-demina.jpg"
                  name="Елена Демина"
                  role="Финансовый доктор"
                  tg="https://t.me/elenademina_findoctor"
                  accentColor="#a78bfa"
                />
              </div>
            </div>
          </header>

          {/* ════ MAIN ════ */}
          <div className="main-layout">

            {/* ── Inputs ── */}
            <div className="inputs-col card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="step-num">1</div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Входные данные</h2>
                </div>
                <button className="reset-btn no-print" onClick={handleReset}>↺ Сбросить</button>
              </div>

              {/* Validation banners */}
              {isInvalid && (
                <div className="warning-banner">
                  <WarnIcon color="#ef4444" />
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>Расчёт невозможен</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#ef4444', lineHeight: 1.5 }}>
                      Налоги ({inputs.overheadPercent}%) + Прибыль ({inputs.profitPercent}%) = {totalPercent}% ≥ 100%.
                      Уменьшите один из параметров.
                    </p>
                  </div>
                </div>
              )}
              {isWarning && (
                <div className="warning-banner" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
                  <WarnIcon color="#f59e0b" />
                  <div>
                    <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#b45309' }}>Высокая нагрузка на цену</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#d97706', lineHeight: 1.6 }}>
                      Накладные ({inputs.overheadPercent}%) + прибыль ({inputs.profitPercent}%) = <strong>{totalPercent}% от выручки</strong>.
                      На покрытие прямых затрат остаётся лишь {100 - totalPercent}% — ваша ставка
                      в <strong>{(1 / (1 - totalPercent / 100)).toFixed(1)}×</strong> выше себестоимости.
                      Проверьте конкурентоспособность на рынке.
                    </p>
                  </div>
                </div>
              )}

              <InputControl label="ЗП рабочего" value={inputs.workerSalary} onChange={v => set('workerSalary', v)} min={100} max={10000} unit="₽/час" />

              {/* SMZ toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, padding: '12px 14px', borderRadius: 14, background: 'rgba(91,94,244,0.04)', border: '1px solid rgba(91,94,244,0.1)', cursor: 'pointer' }}
                onClick={() => set('smzTaxEnabled', !inputs.smzTaxEnabled)}>
                <div className={`toggle-track${inputs.smzTaxEnabled ? ' active' : ''}`}><div className="toggle-thumb" /></div>
                <div>
                  <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Налог СМЗ (+6%)</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Компенсация налога самозанятого</p>
                </div>
              </div>

              <InputControl label="Налоги и офис (%)" value={inputs.overheadPercent} onChange={v => set('overheadPercent', v)} min={0} max={50} unit="%" hint="% от выручки (конечной цены). Считайте сами: сложите все накладные за месяц (аренда, бухгалтерия, налоги компании) и разделите на месячную выручку × 100." />
              <InputControl label="ЗП Менеджера (%)" value={inputs.managerPercent} onChange={v => set('managerPercent', v)} min={0} max={100} unit="%" hint="Процент от базовой ставки рабочего" />
              <InputControl label="ЗП Руководителя (фикс)" value={inputs.deptHeadSalary} onChange={v => set('deptHeadSalary', v)} min={0} max={500} unit="₽/час" />
              <InputControl label="Желаемая прибыль (%)" value={inputs.profitPercent} onChange={v => set('profitPercent', v)} min={0} max={50} unit="%" />
              <InputControl label="Часов в смене" value={inputs.shiftHours} onChange={v => set('shiftHours', v)} min={1} max={24} unit="ч" />
              <InputControl label="Рабочих на объекте" value={inputs.workersCount} onChange={v => set('workersCount', v)} min={1} max={500} unit="чел" />
              <InputControl label="Рабочих дней в месяц" value={inputs.workDaysPerMonth} onChange={v => set('workDaysPerMonth', v)} min={1} max={31} unit="дней" />

              {/* НДС toggle */}
              <div style={{ marginBottom: 22, padding: '12px 14px', borderRadius: 14, background: 'rgba(91,94,244,0.04)', border: '1px solid rgba(91,94,244,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setShowVat(!showVat)}>
                  <div className={`toggle-track${showVat ? ' active' : ''}`}><div className="toggle-thumb" /></div>
                  <div>
                    <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Показать цену с НДС</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Все суммы без НДС — включите, если работаете с НДС</p>
                  </div>
                </div>
                {showVat && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>Ставка НДС</label>
                    <input
                      type="number"
                      value={vatRateStr !== null ? vatRateStr : (vatRate > 0 ? String(vatRate) : '')}
                      step={1}
                      onFocus={e => { setVatRateStr(vatRate > 0 ? String(vatRate) : ''); e.target.select(); }}
                      onChange={e => {
                        const raw = e.target.value;
                        setVatRateStr(raw);
                        const n = parseInt(raw, 10);
                        if (!isNaN(n)) setVatRate(Math.max(1, Math.min(30, n)));
                      }}
                      onBlur={() => {
                        const n = parseInt(vatRateStr ?? '', 10);
                        setVatRate(isNaN(n) || n <= 0 ? 0 : Math.min(30, n));
                        setVatRateStr(null);
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                      onClick={e => e.stopPropagation()}
                      style={{ width: 64 }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>%</span>
                  </div>
                )}
              </div>

              <button onClick={() => setShowSaveModal(true)} className="btn-primary no-print" disabled={isInvalid}
                style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 8, opacity: isInvalid ? 0.4 : 1, cursor: isInvalid ? 'not-allowed' : 'pointer' }}>
                Сохранить в историю
              </button>

              {/* Share + Print */}
              <div className="no-print" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={handleShare} className="btn-ghost"
                  style={{ flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 12, transition: 'background 0.15s, color 0.15s', background: copySuccess ? 'rgba(16,185,129,0.08)' : undefined, color: copySuccess ? '#10b981' : undefined }}>
                  <LinkIcon />
                  {copySuccess ? 'Ссылка скопирована' : 'Поделиться'}
                </button>
                <button onClick={() => window.print()} className="btn-ghost"
                  style={{ flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, borderRadius: 12 }}>
                  <PrintIcon />
                  Скачать PDF
                </button>
              </div>
            </div>

            {/* ── Results ── */}
            <div className="results-col" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Row 1: per-hour / per-shift cards */}
              <div className="metrics-row" style={{ marginBottom: 14 }}>
                <div className="card-accent" style={{ borderRadius: 20, padding: '20px 22px', opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)' }}>
                    Цена для заказчика {!showVat && <span style={{ fontWeight: 400, opacity: 0.7 }}>· без НДС</span>}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      {isInvalid ? '—' : <AnimatedNum value={result.pricePerHour} />}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>₽/час</span>
                  </div>
                  {showVat && !isInvalid && vatRate > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>С НДС {vatRate}%</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                          {fmt(Math.round(result.pricePerHour * (1 + vatRate / 100)))}
                        </span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>₽/час</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: '20px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                    Стоимость смены {showVat && <span style={{ fontWeight: 400, opacity: 0.7 }}>· без НДС</span>}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                      {isInvalid ? '—' : <AnimatedNum value={result.pricePerShift} />}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>₽</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '20px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                    Прибыль со смены {showVat && <span style={{ fontWeight: 400, opacity: 0.7 }}>· без НДС</span>}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                      {isInvalid ? '—' : <AnimatedNum value={result.grossProfitPerShift} />}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>₽</span>
                  </div>
                </div>
              </div>

              {/* Row 2: monthly + cost price */}
              <div className="metrics-row" style={{ marginBottom: 20 }}>
                <div className="card" style={{ padding: '18px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                    Выручка / месяц{inputs.workersCount > 1 ? ` · ${inputs.workersCount} чел` : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                      {isInvalid ? '—' : <AnimatedNum value={result.pricePerMonth} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>₽</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{inputs.workDaysPerMonth} дн × {inputs.workersCount} чел</p>
                </div>

                <div className="card" style={{ padding: '18px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>
                    Прибыль / месяц{inputs.workersCount > 1 ? ` · ${inputs.workersCount} чел` : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                      {isInvalid ? '—' : <AnimatedNum value={result.profitPerMonth} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>₽</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{inputs.workDaysPerMonth} дн × {inputs.workersCount} чел</p>
                </div>

                <div className="card" style={{ padding: '18px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>Себестоимость</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
                      {isInvalid ? '—' : <AnimatedNum value={result.costPrice} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8' }}>₽/час</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>прямые затраты, без наценки</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="card" style={{ padding: '1.75rem', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="step-num">2</div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Структура цены</h3>
                  </div>
                  <span className="badge" style={{ background: 'rgba(91,94,244,0.08)', color: '#5b5ef4', border: '1px solid rgba(91,94,244,0.15)' }}>
                    Структура 1 часа работы
                  </span>
                </div>
                <BreakdownChart data={result} centerValue={result.pricePerHour} />
              </div>

              {/* Lead magnet */}
              <LeadMagnet />

              {/* Saved calculations */}
              {savedCalculations.length > 0 && (
                <div className="card no-print" style={{ padding: '1.75rem', borderRadius: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>История расчётов</h3>
                    <span className="badge" style={{ background: 'rgba(91,94,244,0.08)', color: '#5b5ef4', border: '1px solid rgba(91,94,244,0.15)' }}>{savedCalculations.length}</span>
                  </div>

                  {/* Compare hint / action */}
                  {compareIds.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', borderRadius: 12, background: 'rgba(91,94,244,0.06)', border: '1px solid rgba(91,94,244,0.15)' }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#5b5ef4', fontWeight: 600, flex: 1 }}>
                        {compareIds.length === 1
                          ? 'Выберите ещё расчёты для сравнения'
                          : `Выбрано расчётов: ${compareIds.length}`}
                      </p>
                      {compareIds.length >= 2 && (
                        <button onClick={() => setShowCompare(true)} className="btn-primary"
                          style={{ padding: '7px 14px', fontSize: 12, borderRadius: 10 }}>
                          Сравнить
                        </button>
                      )}
                      <button onClick={() => setCompareIds([])} className="btn-ghost"
                        style={{ padding: '7px 12px', fontSize: 12, borderRadius: 10 }}>
                        Отмена
                      </button>
                    </div>
                  )}

                  <div className="saved-grid">
                    {savedCalculations.map(calc => {
                      const isSelected = compareIds.includes(calc.id);
                      return (
                        <div key={calc.id} className="saved-card"
                          style={isSelected ? { borderColor: '#5b5ef4', background: 'rgba(91,94,244,0.03)' } : undefined}
                          onClick={() => { if (renamingId !== calc.id) loadCalculation(calc); }}>
                          {/* Header row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4, paddingRight: 70 }}>
                            {renamingId === calc.id ? (
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onBlur={commitRename}
                                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                                onClick={e => e.stopPropagation()}
                                style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#1e293b', border: '1.5px solid #5b5ef4', borderRadius: 6, padding: '2px 6px', outline: 'none', background: '#f8faff' }}
                              />
                            ) : (
                              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{calc.name}</h4>
                            )}
                          </div>
                          {/* Action buttons */}
                          <button onClick={e => handleCompareToggle(calc.id, e)}
                            title={isSelected ? 'Убрать из сравнения' : 'Добавить к сравнению'}
                            style={{ position: 'absolute', top: 10, right: 54, background: isSelected ? 'rgba(91,94,244,0.12)' : 'rgba(91,94,244,0.06)', border: 'none', color: isSelected ? '#5b5ef4' : 'rgba(91,94,244,0.5)', borderRadius: 7, padding: '4px 5px', cursor: 'pointer', lineHeight: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              {isSelected
                                ? <polyline points="20 6 9 17 4 12"/>
                                : <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>
                              }
                            </svg>
                          </button>
                          <button onClick={e => startRename(calc, e)}
                            title="Переименовать"
                            style={{ position: 'absolute', top: 10, right: 32, background: 'rgba(91,94,244,0.07)', border: 'none', color: 'rgba(91,94,244,0.6)', borderRadius: 7, padding: '4px 5px', cursor: 'pointer', lineHeight: 0 }}>
                            <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                          </button>
                          <button onClick={e => { e.stopPropagation(); handleDelete(calc.id); }}
                            title="Удалить"
                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239,68,68,0.08)', border: 'none', color: 'rgba(239,68,68,0.6)', borderRadius: 7, padding: '4px 5px', cursor: 'pointer', lineHeight: 0 }}>
                            <TrashIcon />
                          </button>
                          <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{fmtDate(calc.timestamp)}</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            <span className="badge" style={{ background: 'rgba(91,94,244,0.07)', color: '#5b5ef4', border: '1px solid rgba(91,94,244,0.15)', fontSize: 11 }}>{fmt(calc.result.pricePerHour)} ₽/ч</span>
                            <span className="badge" style={{ background: 'rgba(16,185,129,0.07)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)', fontSize: 11 }}>{calc.inputs.profitPercent}% прибыль</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <footer style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} Outsourcing Premium Calculator · Разработан специально для аутсорсинговой отрасли
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
