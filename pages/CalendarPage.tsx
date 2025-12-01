
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { GlassCard, BottomSheet, Button } from '../components/Components';
import { ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { addDays, formatDate, haptic } from '../utils';
import { useNavigate } from 'react-router-dom';
import { MoodTranslation } from '../types';

const CalendarPage: React.FC = () => {
  const { logs, settings } = useApp();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const handleToday = () => {
      haptic.impact('light');
      setCurrentDate(new Date());
  }

  const handleDateClick = (day: number) => {
    haptic.impact('light');
    setSelectedDate(formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)));
  };

  const renderDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const status = getDayStatus(i);
        let className = "h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium relative transition-all ";
        
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
                    {status?.type === 'logged' && <span className="absolute bottom-1 w-1 h-1 bg-gray-500 rounded-full" />}
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

  return (
    <div className="pt-6 pb-20">
      <div className="flex justify-between items-center mb-6 px-2">
        <button onClick={handlePrevMonth} className="p-2 bg-white/50 rounded-full"><ChevronLeft /></button>
        <div className="flex flex-col items-center" onClick={handleToday}>
            <h2 className="text-xl font-bold text-gray-800 capitalize leading-none">{currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</h2>
            {currentDate.getMonth() !== new Date().getMonth() && (
                <span className="text-xs text-primary font-semibold mt-1">Вернуться к сегодня</span>
            )}
        </div>
        <button onClick={handleNextMonth} className="p-2 bg-white/50 rounded-full"><ChevronRight /></button>
      </div>

      <GlassCard className="p-4 min-h-[350px]">
        <div className="grid grid-cols-7 mb-4 text-center">
            {['Вс','Пн','Вт','Ср','Чт','Пт','Сб'].map(d => <span key={d} className="text-xs font-bold text-gray-400">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-y-2">
            {renderDays()}
        </div>
        
        <div className="mt-6 flex justify-center gap-4 text-xs text-gray-500 flex-wrap">
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-full" /> Месячные</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-rose-300 border-dashed rounded-full" /> Прогноз</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 border border-purple-200 rounded-full" /> Фертильность</div>
            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-200 border-2 border-purple-400 rounded-full" /> Овуляция</div>
        </div>
      </GlassCard>

      {/* Details Bottom Sheet */}
      <BottomSheet isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? new Date(selectedDate).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric', weekday: 'long' }) : ''}>
         {selectedDate && (
             <div className="space-y-4">
                 <button 
                    onClick={() => setSelectedDate(null)} 
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500"
                 >
                     <X size={16} />
                 </button>

                 {logs[selectedDate] ? (
                     <div className="space-y-3">
                         <div className="flex flex-wrap gap-2">
                             {logs[selectedDate].flow > 0 && <span className="px-3 py-1 bg-rose-100 text-rose-600 rounded-lg text-sm font-medium">Кровотечение: {logs[selectedDate].flow}</span>}
                             {getMoods(selectedDate).map(m => (
                                 <span key={m} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium">{MoodTranslation[m] || m}</span>
                             ))}
                             {logs[selectedDate].sex && <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-lg text-sm font-medium">Секс</span>}
                         </div>
                         {logs[selectedDate].symptoms?.length > 0 && (
                             <div className="flex flex-wrap gap-1">
                                 {logs[selectedDate].symptoms.map(s => (
                                     <span key={s} className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">{s}</span>
                                 ))}
                             </div>
                         )}
                         <div className="p-3 bg-gray-50 rounded-xl">
                            <p className="text-gray-600 italic text-sm">"{logs[selectedDate].notes || 'Нет заметок'}"</p>
                         </div>
                     </div>
                 ) : (
                     <p className="text-gray-500 text-center py-4">Нет данных за этот день.</p>
                 )}
                 <Button onClick={() => {
                     navigate(`/log?date=${selectedDate}`);
                 }}>
                    <Edit2 size={18} /> Редактировать
                 </Button>
             </div>
         )}
      </BottomSheet>
    </div>
  );
};

export default CalendarPage;
