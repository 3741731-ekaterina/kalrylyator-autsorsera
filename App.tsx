
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

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculatorInputs>(INITIAL_INPUTS);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);

  // Load saved calcs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('outsourcer_calcs');
    if (stored) {
      setSavedCalculations(JSON.parse(stored));
    }
  }, []);

  const result = useMemo(() => calculateOutsourcingRate(inputs), [inputs]);

  const handleInputChange = <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const name = prompt("Введите название для сохранения (например, 'Склад А', 'Ритейл'):");
    if (name) {
      const newCalc: SavedCalculation = {
        id: crypto.randomUUID(),
        name,
        inputs,
        result,
        timestamp: Date.now(),
      };
      const updated = [newCalc, ...savedCalculations];
      setSavedCalculations(updated);
      localStorage.setItem('outsourcer_calcs', JSON.stringify(updated));
    }
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
    <div className="min-h-screen relative overflow-hidden bg-[#f0f2f5] p-4 md:p-8 flex flex-col items-center">
      {/* Premium 3D Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute top-[20%] right-[5%] w-[150px] h-[150px] bg-emerald-400/5 blur-[60px] rounded-full pointer-events-none animate-pulse"></div>

      <header className="max-w-4xl w-full mb-8 text-center md:text-left relative z-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          Калькулятор аутсорсера
        </h1>
        <p className="text-slate-500 mt-2 font-medium max-w-2xl">
          Профессиональный расчет стоимости часа персонала. Оптимизируйте маржинальность вашего бизнеса в реальном времени.
        </p>
      </header>

      <main className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        {/* Left Column: Inputs */}
        <section className="lg:col-span-5 bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/50">
          <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center text-sm shadow-lg shadow-blue-200">1</span>
            Параметры затрат
          </h2>

          <InputControl
            label="ЗП рабочего (база)"
            value={inputs.workerSalary}
            onChange={(v) => handleInputChange('workerSalary', v)}
            min={100}
            max={2000}
            unit="руб/час"
          />

          <div className="flex items-center gap-4 mb-8 p-5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 shadow-inner">
            <input
              type="checkbox"
              id="smz"
              checked={inputs.smzTaxEnabled}
              onChange={(e) => handleInputChange('smzTaxEnabled', e.target.checked)}
              className="w-6 h-6 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all"
            />
            <div>
              <label htmlFor="smz" className="text-sm font-bold text-slate-700 cursor-pointer">
                Компенсация налога СМЗ (+6%)
              </label>
              <p className="text-[11px] text-slate-400">Налог включен в базу расчета себестоимости</p>
            </div>
          </div>

          <InputControl
            label="ЗП Менеджера (в % от ЗП)"
            value={inputs.managerPercent}
            onChange={(v) => handleInputChange('managerPercent', v)}
            min={0}
            max={100}
            unit="%"
            hint="Процент от базовой ставки рабочего"
          />

          <InputControl
            label="ЗП Руководителя (фикс)"
            value={inputs.deptHeadSalary}
            onChange={(v) => handleInputChange('deptHeadSalary', v)}
            min={0}
            max={500}
            unit="руб/час"
          />

          <InputControl
            label="Накладные расходы"
            value={inputs.overheadPercent}
            onChange={(v) => handleInputChange('overheadPercent', v)}
            min={0}
            max={50}
            unit="%"
            hint="Офис, бухгалтерия, налоги компании (рек. 11%)"
          />

          <InputControl
            label="Целевая маржинальность"
            value={inputs.profitPercent}
            onChange={(v) => handleInputChange('profitPercent', v)}
            min={0}
            max={50}
            unit="%"
          />

          <InputControl
            label="Длительность смены"
            value={inputs.shiftHours}
            onChange={(v) => handleInputChange('shiftHours', v)}
            min={1}
            max={24}
            unit="ч"
          />
        </section>

        {/* Right Column: Results */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {/* Summary Block */}
          <section className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white p-10 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(15,23,42,0.3)] sticky top-4 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000"></div>
            
            <div className="flex justify-between items-start mb-10 relative z-10">
              <h2 className="text-xl font-semibold text-slate-300">Итоговые показатели</h2>
              <button 
                onClick={handleSave}
                className="px-6 py-2.5 bg-white text-slate-900 hover:bg-blue-50 rounded-xl text-sm font-bold transition-all transform active:scale-95 shadow-xl shadow-black/20"
              >
                Сохранить расчет
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Цена для заказчика</p>
                <div className="text-5xl font-black text-white flex items-baseline gap-2">
                  {Math.round(result.pricePerHour)} 
                  <span className="text-xl font-medium text-slate-400">руб/час</span>
                </div>
              </div>
              <div className="md:border-l md:border-white/10 md:pl-10">
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Стоимость смены</p>
                <div className="text-5xl font-black text-white flex items-baseline gap-2">
                  {Math.round(result.pricePerShift).toLocaleString('ru-RU')} 
                  <span className="text-xl font-medium text-slate-400">руб</span>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-white/10 relative z-10">
              <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-bold">Валовая прибыль со смены</p>
              <div className="text-4xl font-black text-emerald-400">
                +{Math.round(result.grossProfitPerShift).toLocaleString('ru-RU')} 
                <span className="text-lg font-medium text-slate-400 ml-2">руб</span>
              </div>
            </div>
          </section>

          {/* Breakdown & Visualization */}
          <section className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-8">Структура цены</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="relative">
                <BreakdownChart data={result} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Маржа</span>
                  <span className="text-2xl font-black text-slate-800">{Math.round(result.breakdown.profitPercent)}%</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Выплаты рабочему', value: result.breakdown.workerTotal, pct: result.breakdown.workerPercent, bg: 'bg-blue-50', text: 'text-blue-700', sub: 'text-blue-600/60' },
                  { label: 'Налоги и офис', value: result.breakdown.overhead, pct: result.breakdown.overheadPercent, bg: 'bg-slate-50', text: 'text-slate-700', sub: 'text-slate-500/60' },
                  { label: 'ЗП персонала', value: result.breakdown.staffTotal, pct: result.breakdown.staffPercent, bg: 'bg-indigo-50', text: 'text-indigo-700', sub: 'text-indigo-600/60' },
                  { label: 'Чистая прибыль', value: result.breakdown.netProfit, pct: result.breakdown.profitPercent, bg: 'bg-emerald-50', text: 'text-emerald-700', sub: 'text-emerald-600/60' },
                ].map((item, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-4 rounded-2xl ${item.bg} transition-transform hover:scale-[1.02] border border-white`}>
                    <span className="text-sm font-bold text-slate-600">{item.label}:</span>
                    <div className="text-right">
                      <p className={`font-black ${item.text}`}>{Math.round(item.value)} руб/час</p>
                      <p className={`text-[10px] font-bold ${item.sub}`}>{Math.round(item.pct)}% от цены</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Comparison / Saved Calcs */}
          {savedCalculations.length > 0 && (
            <section className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
              <h3 className="text-xl font-bold text-slate-800 mb-8 flex justify-between items-center">
                Архив расчетов
                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-lg text-slate-400">{savedCalculations.length}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedCalculations.map(calc => (
                  <div key={calc.id} className="group relative bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer" onClick={() => loadCalculation(calc)}>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 truncate pr-8">{calc.name}</h4>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(calc.id); }}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-600 font-bold rounded-md">{Math.round(calc.result.pricePerHour)} ₽/ч</span>
                      <span className="text-[10px] px-2 py-1 bg-emerald-50 text-emerald-600 font-bold rounded-md">{calc.inputs.profitPercent}% приб.</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="mt-16 mb-12 max-w-4xl w-full relative z-10">
        <div className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)] text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1">
            <h4 className="text-xl font-black text-slate-900 mb-3 uppercase tracking-tighter">О создателях</h4>
            <p className="text-slate-500 font-medium leading-relaxed max-w-lg">
              Калькулятор разработан финансистами с опытом работы в сфере аутсорсинга 4+ года для помощи собственникам и менеджерам в быстром принятии решений.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <a 
              href="https://t.me/yahontova_finance" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all group border border-slate-100 hover:border-blue-600 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-white/20">
                <svg className="w-5 h-5 group-hover:fill-white fill-blue-600" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.35-1.77 4.84-1.78.11 0 .35.03.5.16.13.1.17.24.18.34.01.06.02.18.01.23z"/></svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Финансовый эксперт</p>
                <p className="font-bold">Екатерина Яхонтова</p>
              </div>
            </a>

            <a 
              href="https://t.me/elenademina_findoctor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all group border border-slate-100 hover:border-indigo-600 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center group-hover:bg-white/20">
                <svg className="w-5 h-5 group-hover:fill-white fill-indigo-600" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.69-.52.36-1 .53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.35-.49.96-.75 3.78-1.65 6.31-2.74 7.58-3.27 3.61-1.51 4.35-1.77 4.84-1.78.11 0 .35.03.5.16.13.1.17.24.18.34.01.06.02.18.01.23z"/></svg>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Финансовый доктор</p>
                <p className="font-bold">Елена Демина</p>
              </div>
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-slate-400 text-xs font-medium">
          &copy; {new Date().getFullYear()} Outsourcing Premium Calculator. Разработано специально для профессионалов индустрии.
        </div>
      </footer>
    </div>
  );
};

export default App;
