
import React, { useMemo } from 'react';
import { useApp } from '../App';
import { GlassCard } from '../components/Components';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MoodTranslation, DayLog } from '../types';
import { analyzeCycles } from '../utils';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle, TrendingUp, Calendar, Zap, Brain } from 'lucide-react';

const InsightsPage: React.FC = () => {
  const { logs, settings } = useApp();
  const navigate = useNavigate();

  // Run Smart Analysis
  const analysis = useMemo(() => analyzeCycles(logs, settings), [logs, settings]);

  const cycleData = useMemo(() => {
    // If we have history from analysis, use it. Otherwise use last 5 mock entries based on settings to avoid empty chart
    if (analysis.history.length > 1) {
        return analysis.history.slice(0, 6).reverse().map((h, i) => ({
            cycle: new Date(h.startDate).toLocaleDateString('ru-RU', { month: 'short' }),
            length: h.length
        }));
    }
    return [
        { cycle: 'Ср', length: settings.avgCycleLength },
    ];
  }, [analysis, settings]);

  const moodData = useMemo(() => {
      const counts: Record<string, number> = {};
      Object.values(logs).forEach((log: DayLog) => {
          const moodList = log.moods || ((log as any).mood ? [(log as any).mood] : []);
          moodList.forEach(m => {
              counts[m] = (counts[m] || 0) + 1;
          });
      });
      if (Object.keys(counts).length === 0) return [];
      return Object.keys(counts).map(k => ({ name: k, value: counts[k], color: '#B9A2E1' })).sort((a,b) => b.value - a.value).slice(0,5);
  }, [logs]);

  return (
    <div className="pt-4 pb-20 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 px-2">Паспорт цикла</h2>

      {/* 1. Cycle Passport (Summary) */}
      <div className="grid grid-cols-2 gap-4 px-2">
          <GlassCard className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 uppercase font-semibold">Средний цикл</span>
              <div className="flex items-baseline gap-1 my-1">
                 <span className="text-3xl font-bold text-primary">{analysis.avgLength}</span>
                 <span className="text-sm text-gray-600">дней</span>
              </div>
              <span className="text-[10px] text-gray-400">Норма: 21-35</span>
          </GlassCard>
          <GlassCard className="p-4 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-500 uppercase font-semibold">Регулярность</span>
              <div className="flex items-baseline gap-1 my-1">
                 <span className={`text-xl font-bold ${analysis.variability < 3 ? 'text-green-500' : 'text-orange-500'}`}>
                     {analysis.variability < 3 ? 'Высокая' : analysis.variability < 6 ? 'Средняя' : 'Низкая'}
                 </span>
              </div>
              <span className="text-[10px] text-gray-400">±{Math.round(analysis.variability)} дня</span>
          </GlassCard>
      </div>

      {/* 2. Anomaly Alerts */}
      {analysis.anomalies.length > 0 && (
          <div className="px-2">
              <GlassCard className="p-4 bg-orange-50 border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="text-orange-500" size={20} />
                      <h3 className="font-bold text-orange-800">Обратите внимание</h3>
                  </div>
                  <div className="space-y-2">
                      {analysis.anomalies.map((a, i) => (
                          <div key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5" />
                              {a.details} {a.date && <span className="text-gray-400">({new Date(a.date).toLocaleDateString('ru-RU')})</span>}
                          </div>
                      ))}
                  </div>
              </GlassCard>
          </div>
      )}

      {/* 3. Cycle History Chart */}
      <GlassCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
               <TrendingUp size={18} className="text-gray-500" />
               <h3 className="font-semibold text-gray-700">Динамика длины</h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleData}>
                    <XAxis dataKey="cycle" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="length" stroke="#E97A9A" strokeWidth={3} dot={{ r: 4, fill: '#E97A9A', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
            </ResponsiveContainer>
          </div>
      </GlassCard>

      {/* 4. Smart Correlations (PRO) */}
      <GlassCard className="p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
                <Brain size={18} className="text-purple-500" />
                <h3 className="font-semibold text-gray-700">Умные корреляции</h3>
            </div>
            {!settings.isPro && <span className="text-xs font-bold text-white bg-black/80 px-2 py-0.5 rounded">PRO</span>}
          </div>
          
          <div className={`space-y-4 ${!settings.isPro ? 'blur-sm select-none' : ''}`}>
             <div className="bg-white/50 p-3 rounded-xl border border-white/60">
                 <p className="text-xs text-gray-500 uppercase font-bold mb-1">Сон и Настроение</p>
                 <p className="text-gray-800 font-medium">{analysis.correlations.sleepEffect}</p>
                 <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                     <div className="h-full bg-blue-400 w-3/4" />
                 </div>
             </div>
             
             {moodData.length > 0 && (
                 <div className="h-32 w-full mt-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={moodData}>
                            <XAxis hide />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                {moodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             )}
          </div>

          {/* Paywall Overlay */}
          {!settings.isPro && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
                  <p className="font-bold text-gray-800 mb-2 drop-shadow-sm text-center px-4">Раскройте связь симптомов и привычек</p>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform active:scale-95 transition-transform flex items-center gap-2"
                  >
                      <Lock size={16} /> Купить PRO за 199₽
                  </button>
              </div>
          )}
      </GlassCard>
      
      {/* 5. Timeline / Events */}
      <div className="px-2">
          <h3 className="text-lg font-bold text-gray-700 mb-3 px-1">Хронология циклов</h3>
          <div className="space-y-3">
              {analysis.history.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-white/60 rounded-xl border border-white/50">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                          <Calendar size={18} />
                      </div>
                      <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">
                              {new Date(item.startDate).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' })}
                              {' - '}
                              {new Date(item.endDate).toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">{item.length} дней • Менструация {item.periodLength} дн.</p>
                      </div>
                  </div>
              ))}
              {analysis.history.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">Недостаточно данных для хронологии</p>
              )}
          </div>
      </div>
    </div>
  );
};

export default InsightsPage;
