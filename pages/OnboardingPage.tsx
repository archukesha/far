
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Button, GlassCard } from '../components/Components';
import { haptic, isFutureDate } from '../utils';
import { UserGoal } from '../types';
import { Check, ChevronRight, Info } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [goal, setGoal] = useState<UserGoal>('track');
  const [consent, setConsent] = useState(false);

  // Validation Logic
  const isValid = () => {
      switch(step) {
          case 1: return name.trim().length > 0 && typeof age === 'number' && age >= 13 && age <= 55;
          case 2: return lastPeriod !== '' && !isFutureDate(lastPeriod);
          case 3: return cycleLen >= 21 && cycleLen <= 45;
          case 4: return periodLen >= 1 && periodLen <= 8;
          case 5: return !!goal;
          case 6: return consent;
          default: return false;
      }
  };

  // Actions
  const handleNext = () => {
      if (!isValid()) {
          haptic.impact('heavy'); // Error haptic
          if (window.Telegram?.WebApp) window.Telegram.WebApp.showAlert("Пожалуйста, проверьте введенные данные.");
          return;
      }

      haptic.impact('medium');
      if (step < totalSteps) {
          setStep(s => s + 1);
      } else {
          // Finish
          updateSettings({
              name,
              age: Number(age),
              lastPeriodDate: lastPeriod,
              avgCycleLength: cycleLen,
              avgPeriodLength: periodLen,
              goal,
              hasConsented: consent,
              isOnboarded: true
          });
      }
  };

  const handleBack = () => {
      haptic.impact('light');
      if (step > 1) setStep(s => s - 1);
  };

  // Telegram Integration
  const handleNextRef = useRef(handleNext);
  const handleBackRef = useRef(handleBack);
  const isValidRef = useRef(isValid());

  useEffect(() => {
      handleNextRef.current = handleNext;
      handleBackRef.current = handleBack;
      isValidRef.current = isValid();
  }, [step, name, age, lastPeriod, cycleLen, periodLen, goal, consent]);

  useEffect(() => {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;

      const mainBtn = tg.MainButton;
      const backBtn = tg.BackButton;

      mainBtn.setText(step === totalSteps ? "ГОТОВО" : "ДАЛЕЕ");
      
      if (isValidRef.current) {
        mainBtn.show();
        mainBtn.enable();
      } else {
         mainBtn.disable();
         mainBtn.setParams({ color: '#E5E7EB', text_color: '#9CA3AF' }); // Gray out
      }
      
      if (isValidRef.current) {
          // Restore color
          mainBtn.setParams({ color: tg.themeParams.button_color || '#E97A9A', text_color: tg.themeParams.button_text_color || '#FFFFFF' });
      }

      const onMainClick = () => handleNextRef.current();
      const onBackClick = () => handleBackRef.current();

      mainBtn.onClick(onMainClick);
      backBtn.onClick(onBackClick);

      if (step > 1) backBtn.show();
      else backBtn.hide();

      return () => {
          mainBtn.offClick(onMainClick);
          backBtn.offClick(onBackClick);
      };
  }, [step, name, age, lastPeriod, cycleLen, periodLen, goal, consent]);


  // UI Renders
  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col pt-10 px-6 pb-20">
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200 rounded-full mb-8">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* Step 1: Greeting & Age */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Привет! 👋</h1>
                    <p className="text-gray-500 mt-2">Давай настроим профиль для персональных рекомендаций.</p>
                </div>
                <GlassCard className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1">Твое имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Например, Анна"
                            className="w-full mt-1 p-3 rounded-xl bg-white/50 border border-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1">Возраст</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(parseInt(e.target.value) || '')}
                            placeholder="13-55"
                            className="w-full mt-1 p-3 rounded-xl bg-white/50 border border-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                </GlassCard>
            </div>
          )}

          {/* Step 2: Last Period */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                 <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Когда начались последние месячные?</h1>
                    <p className="text-gray-500 mt-2">Выберите первый день цикла.</p>
                </div>
                <GlassCard className="p-6">
                    <input
                        type="date"
                        value={lastPeriod}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLastPeriod(e.target.value)}
                        className="w-full p-4 text-center text-lg rounded-xl bg-white/50 border border-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </GlassCard>
            </div>
          )}

          {/* Step 3: Cycle Length */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Длина цикла</h1>
                    <p className="text-gray-500 mt-2">Количество дней между месячными.</p>
                </div>
                <GlassCard className="p-8 flex flex-col items-center">
                    <div className="flex items-center gap-6">
                         <button onClick={() => setCycleLen(c => Math.max(21, c-1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600">-</button>
                         <div className="text-center">
                             <span className="text-5xl font-bold text-primary">{cycleLen}</span>
                             <p className="text-gray-400 text-sm mt-1">Дней</p>
                         </div>
                         <button onClick={() => setCycleLen(c => Math.min(45, c+1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600">+</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-6 bg-white/50 px-3 py-1 rounded-full">Обычно 21 - 45 дней</p>
                </GlassCard>
            </div>
          )}

          {/* Step 4: Period Length */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                 <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Длительность месячных</h1>
                    <p className="text-gray-500 mt-2">Сколько дней обычно длится кровотечение?</p>
                </div>
                <GlassCard className="p-8 flex flex-col items-center">
                    <div className="flex items-center gap-6">
                         <button onClick={() => setPeriodLen(c => Math.max(1, c-1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600">-</button>
                         <div className="text-center">
                             <span className="text-5xl font-bold text-rose-400">{periodLen}</span>
                             <p className="text-gray-400 text-sm mt-1">Дней</p>
                         </div>
                         <button onClick={() => setPeriodLen(c => Math.min(8, c+1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600">+</button>
                    </div>
                </GlassCard>
            </div>
          )}

          {/* Step 5: Goal / Mode */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Выберите цель</h1>
                    <p className="text-gray-500 mt-2">Ваш текущий жизненный этап.</p>
                </div>
                <div className="space-y-3 h-[50vh] overflow-y-auto no-scrollbar pb-4">
                    {[
                        { id: 'track', label: 'Отслеживание', desc: 'Мониторинг здоровья и симптомов', icon: '📅' },
                        { id: 'avoid', label: 'Контрацепция', desc: 'Безопасные дни и защита', icon: '🛡️' },
                        { id: 'conceive', label: 'Зачатие', desc: 'Повышение шансов забеременеть', icon: '👶' },
                        { id: 'pregnancy', label: 'Беременность', desc: 'Трекинг недель и развития', icon: '🤰' },
                        { id: 'postpartum', label: 'После родов', desc: 'Восстановление и настроение', icon: '🍼' },
                        { id: 'menopause', label: 'Менопауза', desc: 'Симптомы и изменения', icon: '🍂' },
                    ].map((opt) => (
                        <GlassCard 
                            key={opt.id}
                            onClick={() => { haptic.selection(); setGoal(opt.id as UserGoal); }}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-all ${goal === opt.id ? 'ring-2 ring-primary bg-white/80' : 'opacity-80'}`}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{opt.label}</h3>
                                <p className="text-xs text-gray-500">{opt.desc}</p>
                            </div>
                            {goal === opt.id && <Check className="text-primary" />}
                        </GlassCard>
                    ))}
                </div>
            </div>
          )}

           {/* Step 6: Consents */}
           {step === 6 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Почти готово</h1>
                    <p className="text-gray-500 mt-2">Пожалуйста, ознакомьтесь с правилами.</p>
                </div>
                <GlassCard className="p-6">
                    <div className="h-32 overflow-y-auto text-xs text-gray-500 bg-white/40 p-3 rounded-lg mb-4">
                        <p><strong>Политика конфиденциальности</strong></p>
                        <p className="mt-2">
                            FemCycle Glow хранит все ваши данные локально на вашем устройстве. Мы не передаем ваши личные данные о здоровье на внешние серверы.
                            Продолжая, вы соглашаетесь с нашими Условиями использования и Политикой конфиденциальности. Вы подтверждаете, что вам исполнилось 13 лет.
                        </p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${consent ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                            {consent && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={consent} onChange={e => { haptic.selection(); setConsent(e.target.checked); }} />
                        <span className="text-sm text-gray-700">Я соглашаюсь с Политикой конфиденциальности.</span>
                    </label>
                </GlassCard>
            </div>
          )}

      </div>

      {!window.Telegram?.WebApp?.initData && (
          <div className="mt-8 flex justify-between">
              <Button variant="secondary" onClick={handleBack} disabled={step===1} className="w-1/3">Назад</Button>
              <Button onClick={handleNext} disabled={!isValid()} className="w-1/3">
                  {step === totalSteps ? "Готово" : "Далее"}
              </Button>
          </div>
      )}
    </div>
  );
};

export default OnboardingPage;
