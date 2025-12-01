
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { GlassCard, Button } from '../components/Components';
import { FlowIntensity, Mood, SYMPTOMS_LIST, DayLog, BleedingColor, DischargeType, MoodTranslation, DischargeTranslation } from '../types';
import { formatDate, haptic } from '../utils';
import { Droplet, Moon, GlassWater, Heart, Thermometer, Weight, Zap, Sparkles, Activity, Check, Minus, Plus } from 'lucide-react';

const LogPage: React.FC = () => {
  const { logs, addLog, settings } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get('date') || formatDate(new Date());

  // Safe accessor for existing log to handle migration from old `mood` to new `moods`
  const getExistingLog = (): DayLog => {
    const log = logs[dateParam];
    if (!log) {
        return {
            date: dateParam,
            flow: FlowIntensity.None,
            symptoms: [],
            sleepHours: 8,
            waterGlasses: 4,
            sex: false,
            notes: '',
            moods: [],
            bleedingClots: false,
            painLevel: 0,
            painLocations: [],
            contraceptiveTaken: false,
            energy: 'Medium',
            stress: 'Low',
        };
    }
    // Migration: if log has 'mood' but not 'moods', fix it
    if ((log as any).mood && (!log.moods || log.moods.length === 0)) {
        return { ...log, moods: [(log as any).mood] };
    }
    // Ensure moods is array
    if (!log.moods) return { ...log, moods: [] };
    
    return log;
  };

  const [form, setForm] = useState<DayLog>(getExistingLog());
  const [isDirty, setIsDirty] = useState(false);
  const [viewMode, setViewMode] = useState<'quick' | 'extended'>('quick');

  // Sync with Telegram MainButton
  useEffect(() => {
    if (window.Telegram?.WebApp?.MainButton) {
        const btn = window.Telegram.WebApp.MainButton;
        btn.setText("СОХРАНИТЬ");
        btn.show();
        btn.onClick(handleSave);
        btn.enable(); 
        return () => {
            btn.hide();
            btn.offClick(handleSave);
        };
    }
  }, [form, isDirty]);

  const handleSave = () => {
      // Validation
      if (form.notes.length > 500) {
          if (window.Telegram?.WebApp) window.Telegram.WebApp.showAlert("Заметка слишком длинная!");
          else alert("Заметка слишком длинная");
          return;
      }
      if (form.sleepHours > 24) return;

      addLog(dateParam, form);
      haptic.success();
      navigate('/home');
  };

  const toggleSymptom = (sym: string) => {
    haptic.selection();
    setForm(prev => ({
        ...prev,
        symptoms: prev.symptoms.includes(sym) 
            ? prev.symptoms.filter(s => s !== sym)
            : [...prev.symptoms, sym]
    }));
    setIsDirty(true);
  };

  const toggleMood = (m: Mood) => {
      haptic.selection();
      setForm(prev => ({
          ...prev,
          moods: prev.moods.includes(m)
            ? prev.moods.filter(x => x !== m)
            : [...prev.moods, m]
      }));
      setIsDirty(true);
  }

  const update = (field: keyof DayLog, value: any) => {
      setForm(prev => ({ ...prev, [field]: value }));
      setIsDirty(true);
  };

  return (
    <div className="pt-4 pb-24 space-y-6">
      
      {/* Header & Mode Switch */}
      <div className="flex flex-col items-center space-y-4">
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Дневник</h2>
            <p className="text-gray-500 capitalize">{new Date(dateParam).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        
        {/* Toggle Pill */}
        <div className="bg-white/50 p-1 rounded-full flex gap-1 shadow-inner w-64">
             <button 
                onClick={() => { haptic.selection(); setViewMode('quick'); }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-full transition-all ${viewMode === 'quick' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
             >
                 Быстро
             </button>
             <button 
                onClick={() => { haptic.selection(); setViewMode('extended'); }}
                className={`flex-1 py-1.5 text-sm font-semibold rounded-full transition-all ${viewMode === 'extended' ? 'bg-white shadow text-primary' : 'text-gray-500'}`}
             >
                 Подробно
             </button>
        </div>
      </div>

      {/* --- QUICK VIEW SECTIONS --- */}

      {/* Flow Section (Always Visible) */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Droplet size={18} className="text-rose-500"/> Выделения</h3>
        <div className="flex justify-between gap-2">
            {[0, 1, 2, 3].map((level) => (
                <button
                    key={level}
                    onClick={() => { haptic.selection(); update('flow', level); }}
                    className={`flex-1 py-3 rounded-xl border transition-all text-xs sm:text-sm font-medium ${form.flow === level ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white/40 border-gray-200 text-gray-600'}`}
                >
                    {level === 0 ? 'Нет' : level === 1 ? 'Скуд' : level === 2 ? 'Сред' : 'Обил'}
                </button>
            ))}
        </div>
        
        {/* Bleeding Details (Visible if Extended OR Flow > 0) */}
        {(viewMode === 'extended' && form.flow > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Цвет</span>
                    <div className="flex gap-2">
                        {[BleedingColor.Red, BleedingColor.Pink, BleedingColor.Brown, BleedingColor.Black].map(c => (
                            <button 
                                key={c}
                                onClick={() => update('bleedingColor', c)}
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${form.bleedingColor === c ? 'ring-2 ring-primary ring-offset-2 border-transparent scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c === 'Pink' ? '#F9A8D4' : c === 'Brown' ? '#78350F' : c === 'Red' ? '#EF4444' : '#1F2937' }}
                            >
                                {form.bleedingColor === c && <Check size={14} className="text-white"/>}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Сгустки</span>
                    <button 
                         onClick={() => update('bleedingClots', !form.bleedingClots)}
                         className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${form.bleedingClots ? 'bg-rose-100 text-rose-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                        {form.bleedingClots ? 'ДА' : 'НЕТ'}
                    </button>
                </div>
            </div>
        )}
      </GlassCard>

      {/* Mood Section (Quick) */}
      <GlassCard className="p-5">
         <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Sparkles size={18} className="text-purple-500"/> Настроение</h3>
         <div className="flex flex-wrap gap-2">
             {Object.values(Mood).map((m) => (
                 <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${form.moods.includes(m) ? 'bg-purple-500 text-white border-purple-500 shadow-md' : 'bg-white/40 border-gray-200 text-gray-600'}`}
                 >
                     {MoodTranslation[m] || m}
                 </button>
             ))}
         </div>
      </GlassCard>

      {/* Symptoms (Quick chips) */}
      <GlassCard className="p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity size={18} className="text-orange-500"/> Симптомы</h3>
          <div className="flex flex-wrap gap-2">
              {SYMPTOMS_LIST.slice(0, viewMode === 'quick' ? 6 : undefined).map(sym => (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.symptoms.includes(sym) ? 'bg-orange-400 text-white border-orange-400 shadow-sm' : 'bg-white/40 border-gray-200 text-gray-500'}`}
                  >
                      {sym}
                  </button>
              ))}
          </div>
      </GlassCard>

      {/* --- EXTENDED VIEW SECTIONS --- */}
      {viewMode === 'extended' && (
          <>
            {/* Physical Vitals */}
            <GlassCard className="p-5 space-y-4 animate-in slide-in-from-bottom-4">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Weight size={18} className="text-blue-500"/> Тело и Показатели</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 p-3 rounded-xl">
                        <label className="text-xs text-gray-500 block mb-1">Температура (°C)</label>
                        <div className="flex items-center gap-2">
                            <Thermometer size={16} className="text-rose-400"/>
                            <input 
                                type="number" step="0.1" placeholder="36.6" 
                                value={form.temperature || ''}
                                onChange={e => update('temperature', parseFloat(e.target.value))}
                                className="bg-transparent w-full font-bold text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl">
                         <label className="text-xs text-gray-500 block mb-1">Вес (кг)</label>
                         <div className="flex items-center gap-2">
                            <Weight size={16} className="text-blue-400"/>
                            <input 
                                type="number" step="0.1" placeholder="60.0" 
                                value={form.weight || ''}
                                onChange={e => update('weight', parseFloat(e.target.value))}
                                className="bg-transparent w-full font-bold text-gray-800 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Discharge */}
                <div>
                     <label className="text-sm font-semibold text-gray-600 mb-2 block">Выделения</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                         {Object.values(DischargeType).map(t => (
                             <button 
                                key={t} 
                                onClick={() => update('discharge', t)}
                                className={`py-2 px-2 text-xs rounded-lg border transition-all flex items-center justify-center gap-1 ${form.discharge === t ? 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm font-bold ring-1 ring-blue-400' : 'bg-white/40 border-gray-200 text-gray-600'}`}
                             >
                                 {DischargeTranslation[t] || t}
                                 {form.discharge === t && <Check size={12} />}
                             </button>
                         ))}
                     </div>
                </div>
            </GlassCard>

            {/* Lifestyle & Energy */}
            <GlassCard className="p-5 space-y-4 animate-in slide-in-from-bottom-8">
                 <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Энергия и Образ жизни</h3>
                 
                 {/* Energy & Stress */}
                 <div className="space-y-3">
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600">Энергия</span>
                         <div className="flex bg-gray-200 rounded-lg p-0.5">
                             {['Low', 'Medium', 'High'].map(l => (
                                 <button 
                                    key={l}
                                    onClick={() => update('energy', l)}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${form.energy === l ? 'bg-white shadow text-yellow-600 font-bold' : 'text-gray-500'}`}
                                 >
                                     {l === 'Low' ? 'Низ' : l === 'Medium' ? 'Сред' : 'Выс'}
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div className="flex items-center justify-between">
                         <span className="text-sm text-gray-600">Стресс</span>
                         <div className="flex bg-gray-200 rounded-lg p-0.5">
                             {['Low', 'Medium', 'High'].map(l => (
                                 <button 
                                    key={l}
                                    onClick={() => update('stress', l)}
                                    className={`px-3 py-1 text-xs rounded-md transition-all ${form.stress === l ? 'bg-white shadow text-red-500 font-bold' : 'text-gray-500'}`}
                                 >
                                     {l === 'Low' ? 'Низ' : l === 'Medium' ? 'Сред' : 'Выс'}
                                 </button>
                             ))}
                         </div>
                     </div>
                 </div>

                 {/* Contraception */}
                 {(settings.goal === 'avoid' || settings.contraceptionType) && (
                     <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-100">
                         <span className="text-sm font-semibold text-blue-800">Контрацептив принят?</span>
                         <button 
                             onClick={() => update('contraceptiveTaken', !form.contraceptiveTaken)}
                             className={`w-12 h-6 rounded-full relative transition-colors ${form.contraceptiveTaken ? 'bg-blue-500' : 'bg-gray-300'}`}
                         >
                             <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.contraceptiveTaken ? 'left-7' : 'left-1'}`} />
                         </button>
                     </div>
                 )}
            </GlassCard>
          </>
      )}

      {/* Common Sliders (Always Visible) */}
      <GlassCard className="p-5 space-y-6">
          {/* Sleep */}
          <div>
              <div className="flex justify-between mb-3">
                  <span className="text-gray-700 font-medium flex items-center gap-2"><Moon size={16}/> Сон</span>
                  <span className="font-bold text-primary text-lg">{form.sleepHours}ч</span>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => update('sleepHours', Math.max(0, form.sleepHours - 0.5))}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                  >
                      <Minus size={16} />
                  </button>
                  <input 
                    type="range" min="0" max="14" step="0.5" 
                    value={form.sleepHours} 
                    onChange={(e) => update('sleepHours', parseFloat(e.target.value))}
                    className="flex-1 accent-primary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <button 
                    onClick={() => update('sleepHours', Math.min(14, form.sleepHours + 0.5))}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                  >
                      <Plus size={16} />
                  </button>
              </div>
          </div>

          {/* Water */}
          <div>
              <div className="flex justify-between mb-3">
                  <span className="text-gray-700 font-medium flex items-center gap-2"><GlassWater size={16}/> Вода</span>
                  <span className="font-bold text-blue-500">{form.waterGlasses} стаканов</span>
              </div>
               <div className="flex gap-1">
                   {[1,2,3,4,5,6,7,8].map(g => (
                       <div 
                         key={g} 
                         onClick={() => { 
                             haptic.selection(); 
                             // If clicking the current max, decrease by 1. Else set to clicked level.
                             update('waterGlasses', form.waterGlasses === g ? g - 1 : g); 
                         }}
                         className={`h-10 w-full rounded-md transition-all cursor-pointer ${g <= form.waterGlasses ? 'bg-blue-400 shadow-md transform scale-105' : 'bg-gray-100 hover:bg-gray-200'}`} 
                       />
                   ))}
               </div>
          </div>

          {/* Sex Toggle */}
          <div className="flex justify-between items-center pt-2">
              <span className="text-gray-700 font-medium flex items-center gap-2"><Heart size={16} /> Секс / Близость</span>
              <button 
                onClick={() => { haptic.impact('medium'); update('sex', !form.sex); }}
                className={`w-12 h-7 rounded-full transition-colors relative ${form.sex ? 'bg-rose-500' : 'bg-gray-300'}`}
              >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${form.sex ? 'left-6' : 'left-1'}`} />
              </button>
          </div>
      </GlassCard>

      {/* Web Fallback Button */}
      {!window.Telegram?.WebApp && (
          <Button onClick={handleSave}>Сохранить</Button>
      )}
    </div>
  );
};

export default LogPage;
