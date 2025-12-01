
import React, { useMemo } from 'react';
import { useApp } from '../App';
import { GlassCard } from '../components/Components';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MoodTranslation } from '../types';

const InsightsPage: React.FC = () => {
  const { logs, settings } = useApp();

  // Mock Data generation if logs are empty for visualization
  const cycleData = useMemo(() => {
    return [
        { cycle: 'Янв', length: 28 },
        { cycle: 'Фев', length: 29 },
        { cycle: 'Мар', length: 27 },
        { cycle: 'Апр', length: 28 },
        { cycle: 'Май', length: 30 },
    ];
  }, [logs]);

  const moodData = useMemo(() => {
      // Count moods
      const counts: Record<string, number> = {};
      Object.values(logs).forEach(log => {
          // Handle new array structure
          const moodList = log.moods || ((log as any).mood ? [(log as any).mood] : []);
          
          moodList.forEach(m => {
              counts[m] = (counts[m] || 0) + 1;
          });
      });
      // Fallback mock
      if (Object.keys(counts).length === 0) return [
          { name: 'Happy', value: 5, color: '#86EFAC' },
          { name: 'Sad', value: 2, color: '#93C5FD' },
          { name: 'Irritable', value: 3, color: '#FCA5A5' },
      ];
      return Object.keys(counts).map(k => ({ name: k, value: counts[k], color: '#B9A2E1' }));
  }, [logs]);

  return (
    <div className="pt-4 pb-20 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 px-2">Аналитика цикла</h2>

      {/* Cycle Length Chart */}
      <GlassCard className="p-5">
          <h3 className="font-semibold text-gray-700 mb-4">История циклов</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleData}>
                    <XAxis dataKey="cycle" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="length" stroke="#E97A9A" strokeWidth={3} dot={{ r: 4, fill: '#E97A9A', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">Средняя длина: {settings.avgCycleLength} дней</p>
      </GlassCard>

      {/* Mood Analysis (Bar) */}
      <GlassCard className="p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Карта настроения</h3>
            {!settings.isPro && <span className="text-xs font-bold text-white bg-black/80 px-2 py-0.5 rounded">PRO</span>}
          </div>
          
          <div className={`h-48 w-full ${!settings.isPro ? 'blur-sm select-none' : ''}`}>
             <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={moodData}>
                    <XAxis 
                        dataKey="name" 
                        stroke="#9CA3AF" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(val) => MoodTranslation[val]?.substring(0, 3) || val.substring(0, 3)}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {moodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#B9A2E1'} />
                        ))}
                    </Bar>
                 </BarChart>
             </ResponsiveContainer>
          </div>

          {/* Paywall Overlay */}
          {!settings.isPro && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/20">
                  <p className="font-bold text-gray-800 mb-2">Открыть полную аналитику</p>
                  <button className="bg-gradient-to-r from-primary to-purple-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform active:scale-95 transition-transform">
                      Купить PRO
                  </button>
              </div>
          )}
      </GlassCard>
      
      <GlassCard className="p-5">
          <h3 className="font-semibold text-gray-700 mb-2">Это интересно</h3>
          <p className="text-sm text-gray-600">Качество сна снижается на 15% во время лютеиновой фазы. Попробуйте ложиться спать пораньше на следующей неделе!</p>
      </GlassCard>
    </div>
  );
};

export default InsightsPage;
