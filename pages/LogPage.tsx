
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { GlassCard, Button } from '../components/Components';
import { FlowIntensity, Mood, SYMPTOM_CATEGORIES, DayLog, BleedingColor, DischargeType, MoodTranslation, DischargeTranslation, SexType, MEDS_LIST, NUTRITION_LIST, SEX_DETAILS_LIST, PAIN_LOCATIONS } from '../types';
import { formatDate, haptic } from '../utils';
import { Droplet, Moon, GlassWater, Heart, Thermometer, Weight, Zap, Sparkles, Activity, Check, Minus, Plus, ChevronDown, ChevronUp, Shield, ShieldAlert, Pill, Utensils, Flame, Frown } from 'lucide-react';

const LogPage: React.FC = () => {
  const { logs, addLog, settings } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dateParam = searchParams.get('date') || formatDate(new Date());
  const initialMood = searchParams.get('mood');
  
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
        medications: [],
        nutrition: [],
        sexDetails: [],
    };

    if (log) {
        baseLog = { ...baseLog, ...log };
        if ((log as any).mood && (!log.moods || log.moods.length === 0)) {
            baseLog.moods = [(log as any).mood];
        }
        if (typeof log.sex === 'boolean') {
            baseLog.sex = log.sex ? 'Unprotected' : 'None';
        }
    }
    
    if (initialMood && !baseLog.moods.includes(initialMood as Mood)) {
        baseLog.moods = [...baseLog.moods, initialMood as Mood];
    }
    
    return baseLog;
  };

  const [form, setForm] = useState<DayLog>(getExistingLog());
  const [isDirty, setIsDirty] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
      addLog(dateParam, form);
      haptic.success();
      navigate('/home');
  };

  const toggleArrayItem = (field: keyof DayLog, item: string) => {
    haptic.selection();
    setForm(prev => {
        const list = (prev[field] as string[]) || [];
        return {
            ...prev,
            [field]: list.includes(item) ? list.filter(i => i !== item) : [...list, item]
        };
    });
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

      {/* 1. Cycle & Pain */}
      <GlassCard className="p-5">
        <div className="flex justify-between items-center mb-3">
             <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Droplet size={18} className="text-rose-500"/> Выделения</h3>
             {(form.flow > 0 || form.painLevel > 0) && <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-0.5 rounded">Идет цикл</span>}
        </div>
        
        {/* Flow Selector */}
        <div className="flex justify-between gap-2 mb-6">
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

        {/* Pain Slider */}
        <div className="bg-white/40 rounded-xl p-3 border border-white/50">
             <div className="flex justify-between mb-2">
                 <span className="text-sm text-gray-600 flex items-center gap-1"><Frown size={14} /> Уровень боли</span>
                 <span className={`text-sm font-bold ${form.painLevel > 0 ? 'text-rose-500' : 'text-gray-400'}`}>{form.painLevel}/10</span>
             </div>
             <input 
                type="range" min="0" max="10" step="1"
                value={form.painLevel}
                onChange={(e) => update('painLevel', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
             />
             {form.painLevel > 0 && (
                 <div className="mt-3 flex flex-wrap gap-1.5 animate-in fade-in">
                     {PAIN_LOCATIONS.map(loc => (
                         <button 
                            key={loc}
                            onClick={() => toggleArrayItem('painLocations', loc)}
                            className={`px-2 py-1 text-[10px] rounded border transition-colors ${form.painLocations.includes(loc) ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white/50 border-transparent text-gray-500'}`}
                         >
                             {loc}
                         </button>
                     ))}
                 </div>
             )}
        </div>
        
        {/* Bleeding Details */}
        {form.flow > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
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

      {/* 2. Mood & Stress */}
      <GlassCard className="p-5">
         <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Sparkles size={18} className="text-purple-500"/> Настроение</h3>
         </div>
         <div className="flex flex-wrap gap-2 mb-4">
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
         
         <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex items-center justify-between">
             <div>
                <span className="text-xs text-purple-700 font-bold block">Стресс</span>
                <div className="flex gap-1 mt-1">
                     {['Low', 'Medium', 'High'].map(l => (
                         <div key={l} className={`w-6 h-2 rounded-full ${form.stress === l || (l === 'Medium' && form.stress === 'High') || (l === 'Low') ? (form.stress === 'High' ? 'bg-rose-500' : form.stress === 'Medium' ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-200'}`} />
                     ))}
                </div>
             </div>
             <div className="flex gap-2">
                 {['Low', 'Medium', 'High'].map(l => (
                     <button key={l} onClick={() => update('stress', l)} className={`text-xs px-2 py-1 rounded ${form.stress === l ? 'bg-white shadow text-purple-700' : 'text-gray-400'}`}>
                         {l === 'Low' ? 'Низк' : l === 'Medium' ? 'Сред' : 'Выс'}
                     </button>
                 ))}
             </div>
         </div>
      </GlassCard>

      {/* 3. Deep Symptoms (Grouped) */}
      <GlassCard className="p-5">
          <div className="flex justify-between items-center mb-3">
             <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Activity size={18} className="text-orange-500"/> Симптомы</h3>
          </div>
          <div className="space-y-4">
              {Object.entries(SYMPTOM_CATEGORIES).map(([cat, items]) => (
                  <div key={cat}>
                      <span className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 block tracking-wider">
                          {cat === 'General' ? 'Общее' : cat === 'GI' ? 'ЖКТ и Аппетит' : cat === 'Skin' ? 'Кожа и Волосы' : 'Грудь'}
                      </span>
                      <div className="flex flex-wrap gap-2">
                          {items.map(sym => (
                              <button
                                key={sym}
                                onClick={() => toggleArrayItem('symptoms', sym)}
                                className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${form.symptoms.includes(sym) ? 'bg-orange-400 text-white border-orange-400 shadow-sm' : 'bg-white/40 border-gray-300 text-gray-500 hover:bg-white/60'}`}
                              >
                                  {sym}
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </GlassCard>

      {/* 4. Meds & Nutrition */}
      <GlassCard className="p-5 space-y-4">
           {/* Meds */}
           <div>
               <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><Pill size={18} className="text-blue-500"/> Лекарства и Добавки</h3>
               <div className="flex flex-wrap gap-2">
                    {MEDS_LIST.map(med => (
                        <button
                            key={med}
                            onClick={() => toggleArrayItem('medications', med)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.medications?.includes(med) ? 'bg-blue-500 text-white border-blue-500' : 'bg-white/40 border-gray-300 text-gray-600'}`}
                        >
                            {med}
                        </button>
                    ))}
               </div>
           </div>
           
           {/* Nutrition */}
           <div>
               <h3 className="font-semibold text-gray-700 flex items-center gap-2 mb-2"><Utensils size={18} className="text-green-500"/> Питание</h3>
               <div className="flex flex-wrap gap-2">
                    {NUTRITION_LIST.map(nut => (
                        <button
                            key={nut}
                            onClick={() => toggleArrayItem('nutrition', nut)}
                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.nutrition?.includes(nut) ? 'bg-green-500 text-white border-green-500' : 'bg-white/40 border-gray-300 text-gray-600'}`}
                        >
                            {nut}
                        </button>
                    ))}
               </div>
           </div>
      </GlassCard>

      {/* 5. Sleep & Water (Compact) */}
      <div className="grid grid-cols-2 gap-4">
          <GlassCard className="p-4">
               <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-700 flex gap-1"><Moon size={16} className="text-indigo-400"/> Сон</span>
                    <span className="text-xl font-bold text-indigo-600">{form.sleepHours}</span>
               </div>
               {/* Simplified Slider */}
               <div className="relative h-2 bg-gray-200 rounded-full mt-2">
                   <div className="absolute h-full bg-indigo-400 rounded-full" style={{ width: `${(form.sleepHours/12)*100}%` }}/>
                   <input type="range" min="0" max="12" step="0.5" value={form.sleepHours} onChange={e => update('sleepHours', parseFloat(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer"/>
               </div>
          </GlassCard>

          <GlassCard className="p-4">
               <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-700 flex gap-1"><GlassWater size={16} className="text-blue-400"/> Вода</span>
                    <span className="text-xl font-bold text-blue-600">{form.waterGlasses}</span>
               </div>
               <div className="flex gap-0.5 mt-2 h-4">
                   {[1,2,3,4,5,6].map(g => (
                       <div key={g} className={`flex-1 rounded-sm ${g <= form.waterGlasses ? 'bg-blue-400' : 'bg-gray-200'}`} onClick={() => update('waterGlasses', g <= form.waterGlasses ? g-1 : g)}/>
                   ))}
               </div>
          </GlassCard>
      </div>

      {/* 6. Sex Details */}
      <GlassCard className="p-5">
          <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium flex items-center gap-2">
                  {form.sex === 'None' && <Heart size={18} className="text-gray-400"/>}
                  {form.sex === 'Protected' && <Shield size={18} className="text-green-500" />}
                  {form.sex === 'Unprotected' && <ShieldAlert size={18} className="text-rose-500" />}
                  Секс
              </span>
              <button 
                onClick={toggleSex}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    form.sex === 'None' ? 'bg-gray-200 text-gray-600' :
                    form.sex === 'Protected' ? 'bg-green-100 text-green-700 border border-green-200' :
                    'bg-rose-100 text-rose-700 border border-rose-200'
                }`}
              >
                  {form.sex === 'None' ? 'Нет' : form.sex === 'Protected' ? 'Защищенный' : 'Без защиты'}
              </button>
          </div>
          
          {form.sex !== 'None' && (
              <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                  <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">Детали</span>
                  <div className="flex flex-wrap gap-2">
                      {SEX_DETAILS_LIST.map(det => (
                          <button
                            key={det}
                            onClick={() => toggleArrayItem('sexDetails', det)}
                            className={`px-3 py-1 rounded-full text-xs border transition-all ${form.sexDetails?.includes(det) ? 'bg-pink-100 text-pink-700 border-pink-200' : 'bg-white/50 text-gray-500 border-gray-200'}`}
                          >
                              {det}
                          </button>
                      ))}
                  </div>
              </div>
          )}
      </GlassCard>

      {/* Show More / Hide Details - Toggle Extra Vitals */}
      <div className="flex justify-center">
        <button 
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-primary font-semibold text-sm py-2 px-4 rounded-full bg-white/50 hover:bg-white transition-colors"
        >
            {showDetails ? 'Скрыть показатели' : 'Температура и Вес'}
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showDetails && (
            <GlassCard className="p-5 space-y-4 animate-in slide-in-from-bottom-4 fade-in">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Weight size={18} className="text-blue-500"/> Тело</h3>
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
            </GlassCard>
      )}

      {/* Web Fallback Button */}
      {!window.Telegram?.WebApp && (
          <Button onClick={handleSave}>Сохранить</Button>
      )}
    </div>
  );
};

export default LogPage;
