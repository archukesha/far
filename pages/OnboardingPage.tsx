import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Button, GlassCard } from '../components/Components';
import { haptic, isFutureDate } from '../utils';
import { UserGoal } from '../types';
import { Check, Calendar, AlertCircle } from 'lucide-react';

const OnboardingPage: React.FC = () => {
  const { updateSettings } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>(''); // Keep as string for better input handling
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLen, setCycleLen] = useState(28);
  const [periodLen, setPeriodLen] = useState(5);
  const [goal, setGoal] = useState<UserGoal>('track');
  const [consent, setConsent] = useState(false);
  
  // UI State
  const [showErrors, setShowErrors] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Validation Logic
  const getStepError = (): string | null => {
      switch(step) {
          case 1: 
              if (name.trim().length === 0) return "Введите ваше имя";
              const ageNum = parseInt(age);
              if (!age || isNaN(ageNum)) return "Укажите возраст";
              if (ageNum < 13 || ageNum > 55) return "Возраст должен быть от 13 до 55 лет";
              return null;
          case 2: 
              if (!lastPeriod) return "Выберите дату";
              if (isFutureDate(lastPeriod)) return "Дата не может быть в будущем";
              return null;
          case 3: 
              if (cycleLen < 21 || cycleLen > 45) return "Цикл обычно от 21 до 45 дней";
              return null;
          case 4: return null;
          case 5: return !goal ? "Выберите цель" : null;
          case 6: return !consent ? "Необходимо согласие" : null;
          default: return null;
      }
  };

  const isStepValid = !getStepError();

  // Actions
  const handleNext = () => {
      const error = getStepError();
      if (error) {
          setShowErrors(true);
          haptic.impact('heavy'); // Error haptic
          if (window.Telegram?.WebApp) window.Telegram.WebApp.showAlert(error);
          return;
      }

      haptic.impact('medium');
      setShowErrors(false);

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
      setShowErrors(false);
      if (step > 1) setStep(s => s - 1);
  };

  const triggerDatePicker = () => {
    // Explicitly show picker to ensure desktop interaction works
    const input = dateInputRef.current;
    if (input) {
        try {
            if (typeof (input as any).showPicker === 'function') {
                (input as any).showPicker();
            } else {
                input.focus();
                input.click();
            }
        } catch (e) {
            console.warn("Date picker open failed", e);
        }
    }
  };

  // Telegram Integration
  const handleNextRef = useRef(handleNext);
  const handleBackRef = useRef(handleBack);
  const isStepValidRef = useRef(isStepValid);

  useEffect(() => {
      handleNextRef.current = handleNext;
      handleBackRef.current = handleBack;
      isStepValidRef.current = isStepValid;
  }, [step, name, age, lastPeriod, cycleLen, periodLen, goal, consent, isStepValid]);

  useEffect(() => {
      const tg = window.Telegram?.WebApp;
      if (!tg) return;

      const mainBtn = tg.MainButton;
      const backBtn = tg.BackButton;

      mainBtn.setText(step === totalSteps ? "ГОТОВО" : "ДАЛЕЕ");
      mainBtn.show();
      mainBtn.enable(); 

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
  }, [step]);


  // UI Renders
  const progress = (step / totalSteps) * 100;

  // Formatting date for Step 2
  const formattedDate = lastPeriod 
    ? new Date(lastPeriod).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Нажмите, чтобы выбрать';

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
                <GlassCard className="p-6 space-y-5">
                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1 mb-1 block">Твое имя</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setShowErrors(false);
                            }}
                            placeholder="Например, Анна"
                            className="w-full p-3.5 rounded-xl bg-white/50 border border-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-800 placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-semibold text-gray-700 ml-1 mb-1 block">Возраст</label>
                        <input
                            type="number"
                            min="13"
                            max="55"
                            value={age}
                            onChange={(e) => {
                                setAge(e.target.value);
                                setShowErrors(false);
                            }}
                            placeholder="Введите возраст"
                            className={`w-full p-3.5 rounded-xl bg-white/50 border focus:outline-none focus:ring-2 text-gray-800 placeholder:text-gray-400 ${
                                (showErrors && (Number(age) < 13 || Number(age) > 55)) 
                                ? 'border-red-300 focus:ring-red-200' 
                                : 'border-white focus:ring-primary/50'
                            }`}
                        />
                        {/* Inline Error Message */}
                        <div className={`mt-2 text-xs text-red-500 flex items-center gap-1 transition-opacity duration-200 ${
                            (Number(age) > 0 && (Number(age) < 13 || Number(age) > 55)) ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                        }`}>
                            <AlertCircle size={12} />
                            <span>Допустимый возраст: 13-55 лет</span>
                        </div>
                    </div>
                </GlassCard>
            </div>
          )}

          {/* Step 2: Last Period */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6">
                 <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Дата начала месячных</h1>
                    <p className="text-gray-500 mt-2">Первый день последнего цикла.</p>
                </div>
                
                {/* Custom Date Picker Trigger */}
                <div 
                    className="relative cursor-pointer group"
                    onClick={triggerDatePicker}
                >
                    <GlassCard className={`p-8 flex flex-col items-center justify-center gap-3 transition-colors group-active:scale-[0.98] ${showErrors && !lastPeriod ? 'ring-2 ring-red-200' : ''}`}>
                        <Calendar size={32} className="text-primary mb-1" />
                        <span className={`text-xl font-bold ${lastPeriod ? 'text-gray-800' : 'text-gray-400'}`}>
                            {formattedDate}
                        </span>
                        <div className="bg-white/50 px-3 py-1 rounded-full text-xs text-primary font-medium">
                            Нажмите, чтобы изменить
                        </div>
                    </GlassCard>
                    
                    {/* Invisible Input Overlay - Ensures click works everywhere */}
                    <input
                        ref={dateInputRef}
                        type="date"
                        value={lastPeriod}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                            setLastPeriod(e.target.value);
                            setShowErrors(false);
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />
                </div>
                
                {showErrors && isFutureDate(lastPeriod) && (
                    <p className="text-center text-red-500 text-sm">Дата не может быть в будущем</p>
                )}
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
                         <button onClick={() => setCycleLen(c => Math.max(21, c-1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition-transform">-</button>
                         <div className="text-center w-24">
                             <span className="text-5xl font-bold text-primary">{cycleLen}</span>
                             <p className="text-gray-400 text-sm mt-1">Дней</p>
                         </div>
                         <button onClick={() => setCycleLen(c => Math.min(45, c+1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition-transform">+</button>
                    </div>
                    <p className="text-xs text-gray-400 mt-6 bg-white/50 px-3 py-1 rounded-full">Норма: 21 - 45 дней</p>
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
                         <button onClick={() => setPeriodLen(c => Math.max(1, c-1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition-transform">-</button>
                         <div className="text-center w-24">
                             <span className="text-5xl font-bold text-rose-400">{periodLen}</span>
                             <p className="text-gray-400 text-sm mt-1">Дней</p>
                         </div>
                         <button onClick={() => setPeriodLen(c => Math.min(8, c+1))} className="w-12 h-12 rounded-full bg-white shadow hover:bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-600 active:scale-95 transition-transform">+</button>
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
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-all border ${goal === opt.id ? 'ring-2 ring-primary border-primary/50 bg-white' : 'border-transparent opacity-90 hover:opacity-100'}`}
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
                    <div className="h-32 overflow-y-auto text-xs text-gray-500 bg-white/40 p-3 rounded-lg mb-4 border border-white/60 leading-relaxed">
                        <p><strong>Политика конфиденциальности</strong></p>
                        <p className="mt-2">
                            FemCycle Glow хранит все ваши данные локально на вашем устройстве. Мы не передаем ваши личные данные о здоровье на внешние серверы.
                        </p>
                        <p className="mt-2">
                            Продолжая, вы соглашаетесь с нашими Условиями использования и подтверждаете, что вам исполнилось 13 лет.
                        </p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer p-2 hover:bg-white/30 rounded-lg transition-colors">
                        <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${consent ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                            {consent && <Check size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={consent} onChange={e => { haptic.selection(); setConsent(e.target.checked); }} />
                        <span className="text-sm text-gray-700 select-none">Я соглашаюсь с Политикой конфиденциальности.</span>
                    </label>
                </GlassCard>
            </div>
          )}

      </div>

      {/* Manual Navigation (Non-Telegram) */}
      {!window.Telegram?.WebApp?.initData && (
          <div className="mt-8 flex justify-between gap-4">
              <Button 
                variant="ghost" 
                onClick={handleBack} 
                className={`w-1/3 ${step === 1 ? 'invisible' : 'visible'}`}
              >
                  Назад
              </Button>
              <Button 
                onClick={handleNext} 
                className={`w-1/2 ${!isStepValid && showErrors ? 'bg-gray-400' : ''}`}
              >
                  {step === totalSteps ? "Готово" : "Далее"}
              </Button>
          </div>
      )}
    </div>
  );
};

export default OnboardingPage;