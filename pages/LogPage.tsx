
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { GlassCard, Button } from '../components/Components';
import { FlowIntensity, Mood, SYMPTOMS_LIST, DayLog, BleedingColor, DischargeType, MoodTranslation, DischargeTranslation, SexType } from '../types';
import { formatDate, haptic } from '../utils';
import { Droplet, Moon, GlassWater, Heart, Thermometer, Weight, Zap, Sparkles, Activity, Check, Minus, Plus, ChevronDown, ChevronUp, Shield, ShieldAlert } from 'lucide-react';

const LogPage: React.FC = () => {
  const { logs, addLog, settings } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get('date') || formatDate(new Date());
  const initialMood = searchParams.get('mood');
  
  // Safe accessor for existing log to handle migration from old `mood` to new `moods`
  const getExistingLog = (): DayLog => {
    const log = logs[dateParam];
    let baseLog: DayLog = {
        date: dateParam,
        flow: FlowIntensity.None,
        symptoms: [],
        sleepHours: 8,
        waterGlasses: 4,
        sex: 'None',
        notes: '',
        moods: [],
        bleedingClots: false,
        painLevel: 0,
        painLocations: [],
        contraceptiveTaken: false,
        energy: 'Medium',
        stress: 'Low',
    };

    if (log) {
        baseLog = { ...baseLog, ...log };
        // Migration: if log has 'mood' but not 'moods', fix it
        if ((log as any).mood && (!log.moods || log.moods.length === 0)) {
            baseLog.moods = [(log as any).mood];
        }
        // Migration: boolean sex to SexType
        if (typeof log.sex === 'boolean') {
            baseLog.sex = log.sex ? 'Unprotected' : 'None';
        }
    }
    
    // Add initial mood if passed via URL and not already present
    if (initialMood && !baseLog.moods.includes(initialMood as Mood)) {
        baseLog.moods = [...baseLog.moods, initialMood as Mood];
    }
    
    return baseLog;
  };

  const [form, setForm] = useState<DayLog>(getExistingLog());
  const [isDirty, setIsDirty] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  const toggleSex = () => {
      haptic.impact('medium');
      setForm(prev => {
          const nextSex = prev.sex === 'None' ? 'Protected' 
                        : prev.sex === 'Protected' ? 'Unprotected' 
                        : 'None';
          return { ...prev, sex: nextSex };
      });
      setIsDirty(true);
  };

  return (
    <div className="pt-4 pb-24 space-y-6">
      
      {/* Header */}
      <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Дневник</h2>
            <p className="text-gray-500 capitalize">{new Date(dateParam).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* --- MAIN SECTIONS --- */}

      {/* Flow Section */}
      <GlassCard className="p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Droplet size={18} className="text-rose-500"/> Выделения</h3>
        <div className="flex justify-between gap-2">
            {[0, 1, 2, 3].map((level) => (
                <button
                    key={level}
                    onClick={() => { haptic.selection(); update('flow', level); }}
                    className={`flex-1 py-3 rounded-xl border transition-all text-xs sm:text-sm font-medium ${form.flow === level ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white/40 border-gray-300 text-gray-600'}`}
                >
                    {level === 0 ? 'Нет' : level === 1 ? 'Скуд' : level === 2 ? 'Сред' : 'Обил'}
                </button>
            ))}
        </div>
        
        {/* Bleeding Details (Visible if Flow > 0 OR Expanded) */}
        {(form.flow > 0 || showDetails) && (
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
            </div>
        )}
      </GlassCard>

      {/* Mood Section */}
      <GlassCard className="p-5">
         <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Sparkles size={18} className="text-purple-500"/> Настроение</h3>
         <div className="flex flex-wrap gap-2">
             {Object.values(Mood).map((m) => (
                 <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${form.moods.includes(m) ? 'bg-purple-500 text-white border-purple-500 shadow-md' : 'bg-white/40 border-gray-300 text-gray-600'}`}
                 >
                     {MoodTranslation[m] || m}
                 </button>
             ))}
         </div>
      </GlassCard>

      {/* Symptoms */}
      <GlassCard className="p-5">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Activity size={18} className="text-orange-500"/> Симптомы</h3>
          <div className="flex flex-wrap gap-2">
              {SYMPTOMS_LIST.slice(0, showDetails ? undefined : 6).map(sym => (
                  <button
                    key={sym}
                    onClick={() => toggleSymptom(sym)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.symptoms.includes(sym) ? 'bg-orange-400 text-white border-orange-400 shadow-sm' : 'bg-white/40 border-gray-300 text-gray-500'}`}
                  >
                      {sym}
                  </button>
              ))}
          </div>
      </GlassCard>

      {/* Common Sliders */}
      <GlassCard className="p-5 space-y-6">
          {/* Sleep - Revised with native input overlay for reliable touch seeking */}
          <div>
              <div className="flex justify-between mb-3">
                  <span className="text-gray-700 font-medium flex items-center gap-2"><Moon size={16}/> Сон</span>
                  <span className="font-bold text-primary text-lg">{form.sleepHours}ч</span>
              </div>
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { haptic.selection(); update('sleepHours', Math.max(0, Number(form.sleepHours) - 0.5)); }}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-transform"
                  >
                      <Minus size={18} />
                  </button>
                  
                  {/* Slider Container */}
                  <div className="relative flex-1 h-12 flex items-center group cursor-pointer">
                    {/* Track Background */}
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden absolute pointer-events-none">
                        {/* Fill */}
                        <div className="h-full bg-primary transition-all duration-150 ease-out" style={{ width: `${(Number(form.sleepHours) / 14) * 100}%` }} />
                    </div>
                    {/* Thumb (Visual Only) */}
                    <div 
                        className="absolute h-7 w-7 bg-white border-2 border-primary rounded-full shadow-lg pointer-events-none transition-all duration-150 ease-out z-10"
                        style={{ left: `calc(${(Number(form.sleepHours) / 14) * 100}% - 14px)` }}
                    />
                    {/* Native Input - for dragging support AND tapping */}
                    <input 
                        type="range" min="0" max="14" step="0.5" 
                        value={form.sleepHours} 
                        onChange={(e) => update('sleepHours', parseFloat(e.target.value))}
                        className="w-full h-full opacity-0 cursor-pointer z-20 absolute inset-0 touch-pan-y"
                    />
                  </div>
                  
                  <button 
                    onClick={() => { haptic.selection(); update('sleepHours', Math.min(14, Number(form.sleepHours) + 0.5)); }}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-transform"
                  >
                      <Plus size={18} />
                  </button>
              </div>
          </div>

          {/* Water */}
          <div>
              <div className="flex justify-between mb-3">
                  <span className="text-gray-700 font-medium flex items-center gap-2"><GlassWater size={16}/> Вода</span>
                  <span className="font-bold text-blue-500">{form.waterGlasses} стаканов</span>
              </div>
               <div className="flex gap-1 h-12">
                   {[1,2,3,4,5,6,7,8].map(g => (
                       <button 
                         key={g} 
                         onClick={() => { 
                             haptic.selection(); 
                             // If clicking the current count, decrement (deselect). Otherwise set to new count.
                             update('waterGlasses', form.waterGlasses === g ? g - 1 : g); 
                         }}
                         className={`flex-1 rounded-md transition-all duration-300 ${g <= form.waterGlasses ? 'bg-blue-400 shadow-md transform scale-y-110' : 'bg-gray-100 hover:bg-gray-200'}`} 
                       />
                   ))}
               </div>
               <p className="text-[10px] text-gray-400 mt-1 text-center">Нажмите на последний стакан, чтобы убрать его.</p>
          </div>

          {/* Sex Toggle (3 States) */}
          <div className="flex justify-between items-center pt-2">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                  {form.sex === 'None' && <Heart size={16} />}
                  {form.sex === 'Protected' && <Shield size={16} className="text-green-500" />}
                  {form.sex === 'Unprotected' && <ShieldAlert size={16} className="text-rose-500" />}
                  Секс / Близость
              </span>
              
              <div className="flex flex-col items-end">
                  <button 
                    onClick={toggleSex}
                    className={`w-16 h-8 rounded-full relative transition-colors duration-300 ${
                        form.sex === 'None' ? 'bg-gray-300' :
                        form.sex === 'Protected' ? 'bg-green-500' :
                        'bg-rose-500'
                    }`}
                  >
                      <div 
                        className={`absolute top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-sm flex items-center justify-center ${
                            form.sex === 'None' ? 'translate-x-1' : 'translate-x-9'
                        }`}
                      >
                         {form.sex === 'Protected' && <Shield size={12} className="text-green-500"/>}
                         {form.sex === 'Unprotected' && <ShieldAlert size={12} className="text-rose-500"/>}
                      </div>
                  </button>
                  <span className="text-[10px] text-gray-400 font-medium mt-1">
                      {form.sex === 'None' ? 'Нет' : form.sex === 'Protected' ? 'Защищенный' : 'Без защиты'}
                  </span>
              </div>
          </div>
      </GlassCard>

      {/* --- SHOW MORE BUTTON --- */}
      <div className="flex justify-center">
        <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-primary font-semibold text-sm py-2 px-4 rounded-full bg-white/50 hover:bg-white transition-colors"
        >
            {showDetails ? 'Скрыть детали' : 'Больше показателей'}
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* --- EXPANDED SECTIONS --- */}
      {showDetails && (
          <>
            {/* Physical Vitals */}
            <GlassCard className="p-5 space-y-4 animate-in slide-in-from-bottom-4 fade-in">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Weight size={18} className="text-blue-500"/> Тело и Показатели</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 p-3 rounded-xl border border-white/60">
                        <label className="text-xs text-gray-500 block mb-1">Температура (°C)</label>
                        <div className="flex items-center gap-2">
                            <Thermometer size={16} className="text-rose-400"/>
                            <input 
                                type="number" step="0.1" placeholder="36.6" 
                                value={form.temperature ?? ''}
                                onChange={e => update('temperature', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                className="bg-transparent w-full font-bold text-gray-800 focus:outline-none placeholder-gray-300"
                            />
                        </div>
                    </div>
                    <div className="bg-white/50 p-3 rounded-xl border border-white/60">
                         <label className="text-xs text-gray-500 block mb-1">Вес (кг)</label>
                         <div className="flex items-center gap-2">
                            <Weight size={16} className="text-blue-400"/>
                            <input 
                                type="number" step="0.1" placeholder="60.0" 
                                value={form.weight ?? ''}
                                onChange={e => update('weight', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                                className="bg-transparent w-full font-bold text-gray-800 focus:outline-none placeholder-gray-300"
                            />
                        </div>
                    </div>
                </div>

                {/* Discharge - High Contrast Fix */}
                <div>
                     <label className="text-sm font-semibold text-gray-600 mb-2 block">Выделения</label>
                     <div className="grid grid-cols-2 gap-2">
                         {Object.values(DischargeType).map(t => (
                             <button 
                                key={t} 
                                onClick={() => update('discharge', t)}
                                className={`py-3 px-2 text-xs rounded-xl border transition-all flex items-center justify-center gap-2 ${form.discharge === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold ring-2 ring-indigo-200' : 'bg-white/40 border-gray-300 text-gray-600 hover:bg-white/60'}`}
                             >
                                 {DischargeTranslation[t] || t}
                                 {form.discharge === t && <Check size={14} className="text-white"/>}
                             </button>
                         ))}
                     </div>
                </div>
            </GlassCard>

            {/* Lifestyle & Energy */}
            <GlassCard className="p-5 space-y-4 animate-in slide-in-from-bottom-8 fade-in">
                 <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Энергия и Образ жизни</h3>
                 
                 {/* Energy & Stress - High Contrast Fix */}
                 <div className="space-y-4">
                     <div>
                         <span className="text-sm text-gray-600 block mb-2">Энергия</span>
                         <div className="grid grid-cols-3 gap-2">
                             {['Low', 'Medium', 'High'].map(l => (
                                 <button 
                                    key={l}
                                    onClick={() => update('energy', l)}
                                    className={`py-2 text-xs rounded-lg transition-all border ${form.energy === l ? 'bg-yellow-600 border-yellow-600 text-white font-bold shadow-sm' : 'bg-white/50 border-gray-300 text-gray-500 hover:bg-white/70'}`}
                                 >
                                     {l === 'Low' ? 'Низкая' : l === 'Medium' ? 'Средняя' : 'Высокая'}
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div>
                         <span className="text-sm text-gray-600 block mb-2">Стресс</span>
                         <div className="grid grid-cols-3 gap-2">
                             {['Low', 'Medium', 'High'].map(l => (
                                 <button 
                                    key={l}
                                    onClick={() => update('stress', l)}
                                    className={`py-2 text-xs rounded-lg transition-all border ${form.stress === l ? 'bg-rose-600 border-rose-600 text-white font-bold shadow-sm' : 'bg-white/50 border-gray-300 text-gray-500 hover:bg-white/70'}`}
                                 >
                                     {l === 'Low' ? 'Низкий' : l === 'Medium' ? 'Средний' : 'Высокий'}
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

      {/* Web Fallback Button */}
      {!window.Telegram?.WebApp && (
          <Button onClick={handleSave}>Сохранить</Button>
      )}
    </div>
  );
};

export default LogPage;
