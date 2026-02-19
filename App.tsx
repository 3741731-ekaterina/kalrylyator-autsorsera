
import React, { useState, useMemo, useEffect } from 'react';
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

const TgIcon = ({ color }: { color: string }) => (
  <svg width="20" height="20" fill={color} viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.35-1.77 4.84-1.78.11 0 .35.03.5.16.13.1.17.24.18.34.01.06.02.18.01.23z"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('outsourcer_calcs');
    if (stored) setSavedCalculations(JSON.parse(stored));
  }, []);

  const result = useMemo(() => calculateOutsourcingRate(inputs), [inputs]);

  const set = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) =>
    setInputs(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const name = prompt('Название расчёта (например: «Склад А», «Ритейл»):');
    if (!name) return;
    const newCalc: SavedCalculation = {
      id: crypto.randomUUID(), name, inputs, result, timestamp: Date.now(),
    };
    const updated = [newCalc, ...savedCalculations];
    setSavedCalculations(updated);
    localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
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
      {/* ── Responsive styles injected once ── */}
      <style>{`
        .calc-layout {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        @media (min-width: 1024px) {
          .calc-layout {
            flex-direction: row;
            align-items: flex-start;
          }
          .calc-inputs { flex: 0 0 38%; }
          .calc-results { flex: 1 1 0; }
        }
        .author-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        @media (min-width: 600px) {
          .author-row { flex-direction: row; }
        }
        .footer-inner {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        @media (min-width: 768px) {
          .footer-inner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }
        .saved-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 540px) {
          .saved-grid { grid-template-columns: 1fr 1fr; }
        }
        .price-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#05070c', position: 'relative', overflowX: 'hidden' }}>

        {/* ══ 3D BACKGROUND ══ */}
        <div className="grid-bg" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div className="orb-1" style={{
            position: 'absolute', top: '-15%', left: '-10%',
            width: 640, height: 640, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,168,83,0.13) 0%, transparent 68%)',
          }} />
          <div className="orb-2" style={{
            position: 'absolute', bottom: '-20%', right: '-12%',
            width: 720, height: 720, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79,100,210,0.14) 0%, transparent 68%)',
          }} />
          <div className="orb-3" style={{
            position: 'absolute', top: '35%', right: '18%',
            width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,80,210,0.09) 0%, transparent 68%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(212,168,83,0.04) 0%, transparent 55%)',
          }} />
        </div>

        {/* ══ PAGE CONTENT ══ */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1160, margin: '0 auto', padding: '2.5rem 1rem 4rem' }}>

          {/* ══ HEADER ══ */}
          <header style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 18px', borderRadius: 999, marginBottom: 20,
              background: 'rgba(212,168,83,0.09)', border: '1px solid rgba(212,168,83,0.22)',
              color: '#d4a853', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#d4a853', display: 'inline-block' }} />
              Профессиональный инструмент
            </div>

            <h1 style={{ margin: '0 0 12px', lineHeight: 1.1 }}>
              <span style={{ display: 'block', fontSize: 'clamp(2rem,6vw,3.4rem)', fontWeight: 900, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
                Калькулятор
              </span>
              <span className="gold-text depth-tag" style={{ display: 'block', fontSize: 'clamp(2.2rem,7vw,4rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
                аутсорсера
              </span>
            </h1>

            <p style={{ maxWidth: 520, margin: '0 auto', fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.75, fontWeight: 500 }}>
              Калькулятор стоимости часа персонала для аутсорсинговой компании
            </p>
          </header>

          {/* ══ MAIN LAYOUT ══ */}
          <div className="calc-layout">

            {/* ── LEFT: Inputs ── */}
            <section className="premium-card calc-inputs" style={{ borderRadius: 28, padding: '2rem' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #d4a853, #f7d47a)', color: '#0a0a14',
                  fontSize: 14, fontWeight: 900, boxShadow: '0 4px 16px rgba(212,168,83,0.4)',
                }}>1</div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#e2e8f0' }}>Параметры затрат</h2>
              </div>

              <InputControl
                label="ЗП рабочего (база)"
                value={inputs.workerSalary}
                onChange={(v) => set('workerSalary', v)}
                min={100} max={2000} unit="руб/час"
              />

              {/* SMZ toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, padding: '14px 16px',
                borderRadius: 16, background: 'rgba(212,168,83,0.055)', border: '1px solid rgba(212,168,83,0.13)',
                cursor: 'pointer',
              }} onClick={() => set('smzTaxEnabled', !inputs.smzTaxEnabled)}>
                <div className={`toggle-track${inputs.smzTaxEnabled ? ' active' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                    Компенсация налога СМЗ (+6%)
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.32)' }}>
                    Налог включён в базу расчёта себестоимости
                  </p>
                </div>
              </div>

              <InputControl
                label="ЗП Менеджера"
                value={inputs.managerPercent}
                onChange={(v) => set('managerPercent', v)}
                min={0} max={100} unit="%"
                hint="Процент от базовой ставки рабочего"
              />

              <InputControl
                label="ЗП Руководителя отдела (фикс)"
                value={inputs.deptHeadSalary}
                onChange={(v) => set('deptHeadSalary', v)}
                min={0} max={500} unit="руб/час"
              />

              <InputControl
                label="Накладные расходы"
                value={inputs.overheadPercent}
                onChange={(v) => set('overheadPercent', v)}
                min={0} max={50} unit="%"
                hint="Офис, бухгалтерия, налоги компании (рек. 11%)"
              />

              <InputControl
                label="Целевая маржинальность"
                value={inputs.profitPercent}
                onChange={(v) => set('profitPercent', v)}
                min={0} max={50} unit="%"
              />

              <InputControl
                label="Длительность смены"
                value={inputs.shiftHours}
                onChange={(v) => set('shiftHours', v)}
                min={1} max={24} unit="ч"
              />
            </section>

            {/* ── RIGHT: Results ── */}
            <div className="calc-results" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Hero result card */}
              <section className="result-card shine-on-hover" style={{ borderRadius: 28, padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative glows */}
                <div style={{
                  position: 'absolute', top: '-20%', right: '-10%', width: 260, height: 260,
                  borderRadius: '50%', pointerEvents: 'none',
                  background: 'radial-gradient(circle, rgba(212,168,83,0.07) 0%, transparent 70%)',
                }} />
                <div style={{
                  position: 'absolute', bottom: '-15%', left: '-5%', width: 180, height: 180,
                  borderRadius: '50%', pointerEvents: 'none',
                  background: 'radial-gradient(circle, rgba(79,100,200,0.06) 0%, transparent 70%)',
                }} />

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 32, position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, #d4a853, #f7d47a)', color: '#0a0a14',
                      fontSize: 14, fontWeight: 900, boxShadow: '0 4px 16px rgba(212,168,83,0.4)',
                    }}>2</div>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Итоговые показатели</h2>
                  </div>
                  <button onClick={handleSave} className="btn-gold" style={{ padding: '10px 22px', borderRadius: 12, fontSize: 13 }}>
                    Сохранить расчёт
                  </button>
                </div>

                {/* Prices */}
                <div className="price-row" style={{ position: 'relative', zIndex: 1 }}>
                  <div>
                    <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)' }}>
                      Цена для заказчика
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span className="gold-text" style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1 }}>{fmt(result.pricePerHour)}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.38)' }}>₽/ч</span>
                    </div>
                  </div>
                  <div style={{ borderLeft: '1px solid rgba(255,255,255,0.07)', paddingLeft: 20 }}>
                    <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)' }}>
                      Стоимость смены
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 900, lineHeight: 1, color: '#e2e8f0' }}>{fmt(result.pricePerShift)}</span>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.38)' }}>₽</span>
                    </div>
                  </div>
                </div>

                {/* Profit */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, position: 'relative', zIndex: 1 }}>
                  <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.32)' }}>
                    Валовая прибыль со смены
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: '#34d399' }}>+{fmt(result.grossProfitPerShift)}</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.38)' }}>₽</span>
                  </div>
                </div>
              </section>

              {/* Breakdown + Chart */}
              <section className="premium-card" style={{ borderRadius: 28, padding: '2rem' }}>
                <h3 style={{ margin: '0 0 24px', fontSize: 17, fontWeight: 700, color: '#e2e8f0' }}>Структура цены</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 28, alignItems: 'center' }}>
                  {/* Donut chart */}
                  <div style={{ position: 'relative' }}>
                    <BreakdownChart data={result} />
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', marginBottom: 2 }}>Маржа</span>
                      <span className="gold-text" style={{ fontSize: 26, fontWeight: 900 }}>{Math.round(result.breakdown.profitPercent)}%</span>
                    </div>
                  </div>

                  {/* Breakdown list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'Выплаты рабочему', value: result.breakdown.workerTotal, pct: result.breakdown.workerPercent, color: '#4f8ef7', bg: 'rgba(79,142,247,0.07)' },
                      { label: 'Налоги и офис', value: result.breakdown.overhead, pct: result.breakdown.overheadPercent, color: '#94a3b8', bg: 'rgba(148,163,184,0.06)' },
                      { label: 'ЗП персонала', value: result.breakdown.staffTotal, pct: result.breakdown.staffPercent, color: '#a78bfa', bg: 'rgba(167,139,250,0.07)' },
                      { label: 'Чистая прибыль', value: result.breakdown.netProfit, pct: result.breakdown.profitPercent, color: '#34d399', bg: 'rgba(52,211,153,0.07)' },
                    ].map((item, idx) => (
                      <div key={idx} className="breakdown-item" style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '11px 14px', borderRadius: 14,
                        background: item.bg, border: `1px solid ${item.color}22`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                            background: item.color, boxShadow: `0 0 7px ${item.color}88`,
                          }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.66)' }}>{item.label}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: item.color }}>{fmt(item.value)} ₽/ч</p>
                          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>{Math.round(item.pct)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Saved calculations */}
              {savedCalculations.length > 0 && (
                <section className="premium-card" style={{ borderRadius: 28, padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#e2e8f0' }}>Архив расчётов</h3>
                    <span style={{
                      padding: '3px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: 'rgba(212,168,83,0.1)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.2)',
                    }}>{savedCalculations.length}</span>
                  </div>
                  <div className="saved-grid">
                    {savedCalculations.map(calc => (
                      <div
                        key={calc.id}
                        className="saved-card"
                        onClick={() => loadCalculation(calc)}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,83,0.28)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'; }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#e2e8f0', paddingRight: 28, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {calc.name}
                          </h4>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(calc.id); }}
                            style={{
                              position: 'absolute', top: 12, right: 12,
                              background: 'rgba(239,68,68,0.1)', border: 'none', color: 'rgba(239,68,68,0.65)',
                              borderRadius: 8, padding: '5px 6px', cursor: 'pointer',
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(212,168,83,0.1)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.15)' }}>
                            {fmt(calc.result.pricePerHour)} ₽/ч
                          </span>
                          <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.15)' }}>
                            {calc.inputs.profitPercent}% приб.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* ══ FOOTER / AUTHORS ══ */}
          <footer style={{ marginTop: '4rem' }}>
            <div className="premium-card" style={{ borderRadius: 28, padding: '2rem 2.5rem' }}>
              <div className="footer-inner">
                {/* About text */}
                <div style={{ flex: '1 1 260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ height: 1, width: 24, background: 'linear-gradient(90deg, #d4a853, transparent)' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#d4a853' }}>О создателях</span>
                    <div style={{ height: 1, width: 24, background: 'linear-gradient(90deg, transparent, #d4a853)' }} />
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: 'rgba(255,255,255,0.46)', maxWidth: 440 }}>
                    Калькулятор разработан финансистами с опытом работы в сфере аутсорсинга&nbsp;4+&nbsp;года
                    для помощи собственникам и менеджерам в быстром принятии решений.
                  </p>
                </div>

                {/* Author cards */}
                <div className="author-row" style={{ flex: '0 0 auto' }}>
                  <a
                    href="https://t.me/yahontova_finance"
                    target="_blank" rel="noopener noreferrer"
                    className="author-card"
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(212,168,83,0.38)'; el.style.boxShadow = '0 8px 30px rgba(212,168,83,0.1)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(212,168,83,0.22), rgba(212,168,83,0.09))',
                      boxShadow: '0 0 14px rgba(212,168,83,0.2)',
                    }}>
                      <TgIcon color="#d4a853" />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
                        Финансовый эксперт
                      </p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Екатерина Яхонтова</p>
                    </div>
                  </a>

                  <a
                    href="https://t.me/elenademina_findoctor"
                    target="_blank" rel="noopener noreferrer"
                    className="author-card"
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(167,139,250,0.38)'; el.style.boxShadow = '0 8px 30px rgba(167,139,250,0.1)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.boxShadow = 'none'; }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(167,139,250,0.09))',
                      boxShadow: '0 0 14px rgba(167,139,250,0.2)',
                    }}>
                      <TgIcon color="#a78bfa" />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.28)' }}>
                        Финансовый доктор
                      </p>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Елена Демина</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.16)', fontWeight: 500 }}>
              &copy; {new Date().getFullYear()} Outsourcing Premium Calculator
            </p>
          </footer>
        </div>
      </div>
    </>
  );
};

export default App;
