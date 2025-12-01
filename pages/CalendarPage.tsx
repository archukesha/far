
import React, { useState } from 'react';
import { useApp } from '../App';
import { GlassCard, BottomSheet, Button } from '../components/Components';
import { ChevronLeft, ChevronRight, Edit2, X, Calendar as CalIcon, Droplet, ChevronDown, Heart, Shield, ShieldAlert } from 'lucide-react';
import { formatDate, haptic } from '../utils';
import { useNavigate } from 'react-router-dom';
import { MoodTranslation } from '../types';

const CalendarPage: React.FC = () => {
  const { logs, settings } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Prediction Logic
  const getDayStatus = (day: number) => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    const log = logs[dateStr];
    
    // Check actual log first
    if (log && log.flow > 0) return { type: 'period', intensity: log.flow };
    if (log) return { type: 'logged', intensity: 0 };

    // Prediction
    if (!settings.lastPeriodDate) return null;
    
    const lastPeriod = new Date(settings.lastPeriodDate);
    const thisDate = new Date(dateStr);
    const diffTime = thisDate.getTime() - lastPeriod.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
        const cycleDay = (diffDays % settings.avgCycleLength) + 1;
        if (cycleDay <= settings.avgPeriodLength) return { type: 'predicted-period' };
        if (cycleDay >= 10 && cycleDay <= 17) {
             if (cycleDay === 14) return { type: 'ovulation' };
             return { type: 'fertile' };
        }
        if (cycleDay > 17) return { type: 'luteal' };
        if (cycleDay > settings.avgPeriodLength && cycleDay < 10) return { type: 'follicular' };
    }
    return null;
  };

  const handlePrevMonth = () => {
    haptic.selection();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    haptic.selection();
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const changeYear = (offset: number) => {
      haptic.impact('light');
      setCurrentDate(new Date(currentDate.getFullYear() + offset, currentDate.getMonth(), 1));
  };

  const handleDateClick = (day: number) => {
    haptic.impact('light');
    setSelectedDate(formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)));
  };

  const renderDays = () => {
    const days = [];
    const dayNames = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
    
    // Empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const status = getDayStatus(i);
        let className = "h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium relative transition-all ";
        
        if (status?.type === 'period') className += "bg-rose-500 text-white shadow-md shadow-rose-200";
        else if (status?.type === 'predicted-period') className += "border-2 border-rose-300 text-rose-500 border-dashed bg-rose-50";
        else if (status?.type === 'ovulation') className += "bg-purple-200 text-purple-800 border-2 border-purple-400 font-bold";
        else if (status?.type === 'fertile') className += "bg-purple-100 text-purple-700 border border-purple-200";
        else if (status?.type === 'luteal') className += "bg-yellow-50/50 text-gray-600";
        else if (status?.type === 'follicular') className += "bg-blue-50/50 text-gray-600";
        else if (status?.type === 'logged') className += "bg-gray-200 text-gray-700";
        else className += "text-gray-700 hover:bg-white/50";

        const isToday = formatDate(new Date()) === formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
        if (isToday) {
            className += " ring-2 ring-offset-1 ring-primary";
        }

        days.push(
            <div key={i} className="flex justify-center items-center py-1">
                <button onClick={() => handleDateClick(i)} className={className}>
                    {i}
                    {status?.type === 'logged' && <span className="absolute bottom-0.5 w-1 h-1 bg-gray-500 rounded-full" />}
                </button>
            </div>
        );
    }
    return days;
  };

  // Helper to extract moods safely
  const getMoods = (date: string) => {
      const log = logs[date];
      if (!log) return [];
      if (log.moods) return log.moods;
      // Backward compatibility
      if ((log as any).mood) return [(log as any).mood];
      return [];
  }

  // Safe sex checker
  const getSexLabel = (date: string) => {
      const log = logs[date];
      if (!log) return null;
      if (log.sex === 'Protected') return { label: 'Защищенный', color: 'bg-green-100 text-green-700', icon: Shield };
      if (log.sex === 'Unprotected') return { label: 'Без защиты', color: 'bg-rose-100 text-rose-700', icon: ShieldAlert };
      if (log.sex === true as any) return { label: 'Секс', color: 'bg-pink-100 text-pink-600', icon: Heart }; // legacy
      return null;
  }

  return (
    <div className="pt-6 pb-20">
      
      {/* Header with Year Selector */}
      <div className="flex justify-between items-center mb-6 px-4 relative z-20">
        <button onClick={handlePrevMonth} className="p-2 bg-white/50 rounded-full shadow-sm active:scale-95 transition-transform"><ChevronLeft size={20}/></button>
        
        <div className="flex flex-col items-center cursor-pointer" onClick={() => setShowYearPicker(!showYearPicker)}>
            <div className="flex items-center gap-1 group bg-white/30 px-3 py-1 rounded-full border border-white/40">
                <h2 className="text-xl font-bold text-gray-800 capitalize leading-none">
                    {currentDate.toLocaleDateString('ru-RU', { month: 'long' })}
                </h2>
                <span className="text-lg font-light text-gray-600 flex items-center ml-1">
                    {currentDate.getFullYear()}
                    <ChevronDown size={14} className={`ml-1 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
                </span>
            </div>
            {currentDate.getMonth() !== new Date().getMonth() && (
                <span className="text-xs text-primary font-semibold mt-1" onClick={(e) => {
                    e.stopPropagation();
                    setCurrentDate(new Date());
                }}>
                    Вернуться к сегодня
                </span>
            )}
        </div>
        
        <button onClick={handleNextMonth} className="p-2 bg-white/50 rounded-full shadow-sm active:scale-95 transition-transform"><ChevronRight size={20}/></button>
      </div>

      {showYearPicker && (
          <GlassCard className="mb-4 mx-4 p-4 flex justify-between items-center animate-in slide-in-from-top-4 border-2 border-primary/20">
              <button onClick={() => changeYear(-1)} className="p-3 bg-white shadow-sm rounded-xl text-primary"><ChevronLeft size={20}/></button>
              <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Год</span>
                  <span className="font-bold text-3xl text-gray-800">{currentDate.getFullYear()}</span>
              </div>
              <button onClick={() => changeYear(1)} className="p-3 bg-white shadow-sm rounded-xl text-primary"><ChevronRight size={20}/></button>
          </GlassCard>
      )}

      <GlassCard className="p-4 min-h-[350px]">
        <div className="grid grid-cols-7 mb-4 text-center">
            {['Вс','Пн','Вт','Ср','Чт','Пт','Сб'].map(d => <span key={d} className="text-xs font-bold text-gray-400 uppercase">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
            {renderDays()}
        </div>
        
        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm" /> Месячные</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 border-2 border-rose-300 border-dashed rounded-full" /> Прогноз</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-200 border border-purple-400 rounded-full" /> Овуляция</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-100 border border-purple-200 rounded-full" /> Фертильность</div>
        </div>
      </GlassCard>

      {/* Details Bottom Sheet */}
      <BottomSheet isOpen={!!selectedDate} onClose={() => setSelectedDate(null)}>
         {selectedDate && (
             <div className="relative pt-2">
                 {/* Explicit Close Button - Positioned INSIDE the container */}
                 <button 
                    onClick={() => setSelectedDate(null)} 
                    className="absolute top-0 right-0 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors z-50 shadow-sm"
                 >
                     <X size={20} />
                 </button>

                 <h3 className="text-xl font-bold text-gray-800 mb-1 pr-10">
                     {new Date(selectedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                 </h3>
                 <p className="text-gray-400 text-sm mb-6 capitalize">{new Date(selectedDate).toLocaleDateString('ru-RU', { weekday: 'long' })}</p>

                 {logs[selectedDate] ? (
                     <div className="space-y-4 mb-6">
                         <div className="flex flex-wrap gap-2">
                             {logs[selectedDate].flow > 0 && <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-sm font-medium flex items-center gap-1"><Droplet size={12}/> Кровотечение</span>}
                             {getMoods(selectedDate).map(m => (
                                 <span key={m} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">{MoodTranslation[m] || m}</span>
                             ))}
                             {(() => {
                                 const sexInfo = getSexLabel(selectedDate);
                                 if (sexInfo) {
                                     const Icon = sexInfo.icon;
                                     return (
                                        <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${sexInfo.color}`}>
                                            <Icon size={12} /> {sexInfo.label}
                                        </span>
                                     )
                                 }
                                 return null;
                             })()}
                         </div>
                         
                         {logs[selectedDate].symptoms?.length > 0 && (
                             <div>
                                 <span className="text-xs text-gray-400 font-bold uppercase mb-2 block">Симптомы</span>
                                 <div className="flex flex-wrap gap-1.5">
                                     {logs[selectedDate].symptoms.map(s => (
                                         <span key={s} className="px-2.5 py-1 bg-orange-50 text-orange-600 border border-orange-100 rounded-md text-xs font-medium">{s}</span>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {logs[selectedDate].notes && (
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">Заметка</span>
                                <p className="text-gray-600 text-sm">{logs[selectedDate].notes}</p>
                            </div>
                         )}
                     </div>
                 ) : (
                     <div className="text-center py-8">
                         <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                             <CalIcon size={24} />
                         </div>
                         <p className="text-gray-500 text-sm">Нет записей за этот день.</p>
                     </div>
                 )}
                 <Button onClick={() => {
                     navigate(`/log?date=${selectedDate}`);
                 }}>
                    <Edit2 size={18} /> {logs[selectedDate] ? 'Редактировать запись' : 'Создать запись'}
                 </Button>
             </div>
         )}
      </BottomSheet>
    </div>
  );
};

export default CalendarPage;
