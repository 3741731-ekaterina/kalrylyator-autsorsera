
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
};

const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU');

const fmtDate = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' })
    + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

// ── Icons ──
const TgIcon = ({ color }: { color: string }) => (
  <svg width="18" height="18" fill={color} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.35-1.77 4.84-1.78.11 0 .35.03.5.16.13.1.17.24.18.34.01.06.02.18.01.23z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const WarnIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

// ── Save Modal ──
interface SaveModalProps {
  onSave: (name: string) => void;
  onClose: () => void;
}
const SaveModal: React.FC<SaveModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onSave(name.trim());
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1e293b' }}>Сохранить расчёт</h3>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Дайте название, чтобы легко найти потом</p>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 10, width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="modal-input"
            type="text"
            placeholder='Например: «Склад А», «Ритейл», «Офис 2024»'
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={60}
          />

          {/* Example chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: -8, marginBottom: 20 }}>
            {['Склад А', 'Ритейл', 'Производство', 'Клининг'].map(ex => (
              <button
                key={ex}
                type="button"
                onClick={() => setName(ex)}
                style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid #e2e8f0', background: name === ex ? '#5b5ef4' : '#f8faff', color: name === ex ? '#fff' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {ex}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: '12px' }}>
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!name.trim()}
              style={{ flex: 2, padding: '12px', fontSize: 14, opacity: name.trim() ? 1 : 0.5 }}
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main App ──
const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('outsourcer_calcs');
    if (stored) setSavedCalculations(JSON.parse(stored));
  }, []);

  const result = useMemo(() => calculateOutsourcingRate(inputs), [inputs]);

  // Validation: overhead + profit
  const totalPercent = inputs.overheadPercent + inputs.profitPercent;
  const isInvalid = totalPercent >= 100;
  const isWarning = totalPercent >= 70 && !isInvalid;

  const set = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const handleReset = () => setInputs(INITIAL_INPUTS);

  const handleSaveConfirm = (name: string) => {
    const newCalc: SavedCalculation = {
      id: crypto.randomUUID(), name, inputs, result, timestamp: Date.now(),
    };
    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
    setShowSaveModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = savedCalculations.filter(c => c.id !== id);
    setSavedCalculations(updated);
    localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
  };

  const loadCalculation = (saved: SavedCalculation) => {
    setInputs(saved.inputs);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <style>{`
        .main-layout { display: flex; flex-direction: column; gap: 20px; }
        .inputs-col  { flex: none; width: 100%; }
        .results-col { flex: 1 1 0; }
        @media (min-width: 900px) {
          .main-layout { flex-direction: row; align-items: flex-start; }
          .inputs-col  { width: 340px; flex-shrink: 0; }
        }
        .metrics-row { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 20px; }
        @media (min-width: 560px) { .metrics-row { grid-template-columns: repeat(3, 1fr); } }
        .author-row  { display: flex; flex-direction: column; gap: 10px; }
        @media (min-width: 580px) { .author-row { flex-direction: row; } }
        .footer-layout { display: flex; flex-direction: column; gap: 20px; }
        @media (min-width: 720px) { .footer-layout { flex-direction: row; align-items: center; justify-content: space-between; } }
        .saved-grid  { display: grid; grid-template-columns: 1fr; gap: 10px; }
        @media (min-width: 480px) { .saved-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal onSave={handleSaveConfirm} onClose={() => setShowSaveModal(false)} />
      )}

      <div style={{ minHeight: '100vh', background: '#edf0fb', position: 'relative', overflowX: 'hidden' }}>

        {/* ── 3D Background ── */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div className="orb-1" style={{ position: 'absolute', top: '-12%', left: '-8%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,94,244,0.09) 0%, transparent 68%)' }} />
          <div className="orb-2" style={{ position: 'absolute', bottom: '-18%', right: '-10%', width: 680, height: 680, borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 68%)' }} />
          <div className="orb-3" style={{ position: 'absolute', top: '40%', left: '45%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 68%)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(91,94,244,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(91,94,244,0.025) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto', padding: '2rem 1rem 4rem' }}>

          {/* ── Header ── */}
          <header style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '5px 16px', borderRadius: 999, background: 'rgba(91,94,244,0.08)', border: '1px solid rgba(91,94,244,0.18)', color: '#5b5ef4', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#5b5ef4', display: 'inline-block' }} />
              Инструмент для финансистов
            </div>
            <h1 style={{ margin: '0 0 10px', lineHeight: 1.1 }}>
              <span style={{ display: 'block', fontSize: 'clamp(1.7rem,5vw,2.8rem)', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>
                Калькулятор аутсорсера
              </span>
            </h1>
            <p style={{ maxWidth: 480, margin: '0 auto', fontSize: 15, color: '#64748b', lineHeight: 1.7, fontWeight: 500 }}>
              Калькулятор стоимости часа персонала для аутсорсинговой компании
            </p>
          </header>

          {/* ── Main layout ── */}
          <div className="main-layout">

            {/* ─── LEFT: Inputs ─── */}
            <div className="inputs-col card" style={{ padding: '1.75rem' }}>
              {/* Panel header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="step-num">1</div>
                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Входные данные</h2>
                </div>
                <button className="reset-btn" onClick={handleReset} title="Вернуть все значения к начальным">
                  ↺ Сбросить
                </button>
              </div>

              {/* ── Validation banner ── */}
              {isInvalid && (
                <div className="warning-banner">
                  <WarnIcon />
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                      Расчёт невозможен
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#ef4444', lineHeight: 1.5 }}>
                      Сумма «Налогов и офиса» ({inputs.overheadPercent}%) и «Прибыли» ({inputs.profitPercent}%)
                      составляет {totalPercent}% — превышает 100%. Уменьшите один из параметров.
                    </p>
                  </div>
                </div>
              )}
              {isWarning && !isInvalid && (
                <div className="warning-banner" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  <div>
                    <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#b45309' }}>Высокая нагрузка</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#d97706', lineHeight: 1.5 }}>
                      Налоги + прибыль уже {totalPercent}% — осталось {100 - totalPercent}% на прямые затраты. Цена растёт быстро.
                    </p>
                  </div>
                </div>
              )}

              {/* Inputs */}
              <InputControl
                label="ЗП рабочего"
                value={inputs.workerSalary}
                onChange={(v) => set('workerSalary', v)}
                min={100} max={10000} unit="₽/час"
              />

              {/* SMZ toggle */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22, padding: '12px 14px', borderRadius: 14, background: 'rgba(91,94,244,0.04)', border: '1px solid rgba(91,94,244,0.1)', cursor: 'pointer' }}
                onClick={() => set('smzTaxEnabled', !inputs.smzTaxEnabled)}
              >
                <div className={`toggle-track${inputs.smzTaxEnabled ? ' active' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
                <div>
                  <p style={{ margin: '0 0 1px', fontSize: 13, fontWeight: 600, color: '#374151' }}>Налог СМЗ (+6%)</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>Компенсация налога самозанятого</p>
                </div>
              </div>

              <InputControl label="Налоги и офис (%)" value={inputs.overheadPercent} onChange={(v) => set('overheadPercent', v)} min={0} max={50} unit="%" hint="Офис, бухгалтерия, налоги компании (рек. 11%)" />
              <InputControl label="ЗП Менеджера (%)" value={inputs.managerPercent} onChange={(v) => set('managerPercent', v)} min={0} max={100} unit="%" hint="Процент от базовой ставки рабочего" />
              <InputControl label="ЗП Руководителя (фикс)" value={inputs.deptHeadSalary} onChange={(v) => set('deptHeadSalary', v)} min={0} max={500} unit="₽/час" />
              <InputControl label="Желаемая прибыль (%)" value={inputs.profitPercent} onChange={(v) => set('profitPercent', v)} min={0} max={50} unit="%" />
              <InputControl label="Часов в смене" value={inputs.shiftHours} onChange={(v) => set('shiftHours', v)} min={1} max={24} unit="ч" />

              <button
                onClick={() => setShowSaveModal(true)}
                className="btn-primary"
                disabled={isInvalid}
                style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 8, opacity: isInvalid ? 0.4 : 1, cursor: isInvalid ? 'not-allowed' : 'pointer' }}
              >
                Сохранить в историю
              </button>
            </div>

            {/* ─── RIGHT: Results ─── */}
            <div className="results-col">

              {/* 3 metric cards */}
              <div className="metrics-row">
                <div className="card-accent" style={{ borderRadius: 20, padding: '20px 22px', opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.65)' }}>Цена для заказчика</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      {isInvalid ? '—' : fmt(result.pricePerHour)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.65)' }}>₽/час</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '20px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>Стоимость смены</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#1e293b', lineHeight: 1 }}>
                      {isInvalid ? '—' : fmt(result.pricePerShift)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>₽</span>
                  </div>
                </div>

                <div className="card" style={{ padding: '20px 22px', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8' }}>Прибыль со смены</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(1.8rem,3.5vw,2.5rem)', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
                      {isInvalid ? '—' : fmt(result.grossProfitPerShift)}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8' }}>₽</span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="card" style={{ padding: '1.75rem', borderRadius: 20, opacity: isInvalid ? 0.5 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="step-num">2</div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>Детализация расходов</h3>
                  </div>
                  <span className="badge" style={{ background: 'rgba(91,94,244,0.08)', color: '#5b5ef4', border: '1px solid rgba(91,94,244,0.15)' }}>
                    Структура 1 часа работы
                  </span>
                </div>
                <BreakdownChart data={result} centerValue={result.pricePerHour} />
              </div>

              {/* Saved calculations */}
              {savedCalculations.length > 0 && (
                <div className="card" style={{ padding: '1.75rem', borderRadius: 20, marginTop: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>История расчётов</h3>
                    <span className="badge" style={{ background: 'rgba(91,94,244,0.08)', color: '#5b5ef4', border: '1px solid rgba(91,94,244,0.15)' }}>
                      {savedCalculations.length}
                    </span>
                  </div>
                  <div className="saved-grid">
                    {savedCalculations.map(calc => (
                      <div key={calc.id} className="saved-card" onClick={() => loadCalculation(calc)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: '#1e293b', paddingRight: 28, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {calc.name}
                          </h4>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(calc.id); }}
                            style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(239,68,68,0.08)', border: 'none', color: 'rgba(239,68,68,0.6)', borderRadius: 7, padding: '4px 5px', cursor: 'pointer' }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        {/* Date */}
                        <p style={{ margin: '0 0 8px', fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
                          {fmtDate(calc.timestamp)}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          <span className="badge" style={{ background: 'rgba(91,94,244,0.07)', color: '#5b5ef4', border: '1px solid rgba(91,94,244,0.15)', fontSize: 11 }}>
                            {fmt(calc.result.pricePerHour)} ₽/ч
                          </span>
                          <span className="badge" style={{ background: 'rgba(16,185,129,0.07)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)', fontSize: 11 }}>
                            {calc.inputs.profitPercent}% прибыль
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Footer ── */}
          <footer style={{ marginTop: '3rem' }}>
            <div className="card" style={{ padding: '1.75rem 2rem', borderRadius: 20 }}>
              <div className="footer-layout">
                <div style={{ flex: '1 1 240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ height: 1, width: 20, background: 'linear-gradient(90deg, #5b5ef4, transparent)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#5b5ef4' }}>О создателях</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: '#64748b', maxWidth: 400 }}>
                    Калькулятор разработан финансистами с опытом работы в сфере аутсорсинга&nbsp;4+&nbsp;года
                    для помощи собственникам и менеджерам в быстром принятии решений.
                  </p>
                </div>
                <div className="author-row" style={{ flex: '0 0 auto' }}>
                  <a href="https://t.me/yahontova_finance" target="_blank" rel="noopener noreferrer" className="author-card"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#818cf8'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(91,94,244,0.15), rgba(129,140,248,0.08))', flexShrink: 0 }}>
                      <TgIcon color="#5b5ef4" />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 1px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#94a3b8' }}>Финансовый эксперт</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Екатерина Яхонтова</p>
                    </div>
                  </a>
                  <a href="https://t.me/elenademina_findoctor" target="_blank" rel="noopener noreferrer" className="author-card"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#a78bfa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.08))', flexShrink: 0 }}>
                      <TgIcon color="#a78bfa" />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 1px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#94a3b8' }}>Финансовый доктор</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Елена Демина</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} Outsourcing Premium Calculator
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
