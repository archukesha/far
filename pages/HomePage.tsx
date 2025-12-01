
import React from 'react';
import { useApp } from '../App';
import CycleRing from '../components/CycleRing';
import { GlassCard, Button } from '../components/Components';
import { predictNextPeriod, predictOvulation, haptic, formatDate } from '../utils';
import { Droplet, ThermometerSun, ChevronRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PhaseTranslation, MoodTranslation } from '../types';

const HomePage: React.FC = () => {
  const { settings, cyclePhase } = useApp();
  const navigate = useNavigate();

  const nextPeriodDate = predictNextPeriod(settings.lastPeriodDate || formatDate(new Date()), settings.avgCycleLength);
  const ovulationDate = predictOvulation(nextPeriodDate);

  const phaseColor = cyclePhase.phase === 'Menstruation' ? 'text-rose-500' : 'text-purple-600';
  const phaseBg = cyclePhase.phase === 'Menstruation' ? 'bg-rose-100' : 'bg-purple-100';

  const translatedPhase = PhaseTranslation[cyclePhase.phase] || cyclePhase.phase;

  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Привет, {settings.name || 'Красотка'}</h1>
            <p className="text-sm text-gray-500 capitalize">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
             <div className={`px-3 py-1 rounded-full text-xs font-bold ${phaseBg} ${phaseColor}`}>
                {translatedPhase}
            </div>
            <button 
                onClick={() => navigate('/settings')}
                className="p-2 bg-white/50 rounded-full hover:bg-white text-gray-500"
            >
                <Settings size={20} />
            </button>
        </div>
      </div>

      {/* Cycle Ring */}
      <div className="flex justify-center py-2">
        <CycleRing settings={settings} currentDayInCycle={cyclePhase.dayInCycle} />
      </div>

      {/* Predictions Row */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
            <Droplet className="text-rose-400 mb-2" size={24} />
            <span className="text-xs text-gray-500 uppercase font-semibold">Месячные</span>
            <span className="text-lg font-bold text-gray-800">{new Date(nextPeriodDate).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric'})}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
            <ThermometerSun className="text-purple-400 mb-2" size={24} />
            <span className="text-xs text-gray-500 uppercase font-semibold">Овуляция</span>
            <span className="text-lg font-bold text-gray-800">{new Date(ovulationDate).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric'})}</span>
        </GlassCard>
      </div>

      {/* Quick Log Teaser */}
      <GlassCard className="p-5">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800">Как самочувствие?</h3>
            <button onClick={() => navigate('/log')} className="text-primary text-sm font-semibold">В дневник</button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['Happy', 'Calm', 'Energetic', 'Irritable'].map((mood) => (
                <button 
                    key={mood}
                    onClick={() => {
                        haptic.selection();
                        navigate('/log');
                    }}
                    className="flex-shrink-0 px-4 py-2 bg-white/50 border border-white rounded-full text-sm text-gray-700 font-medium hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                >
                    {MoodTranslation[mood] || mood}
                </button>
            ))}
        </div>
      </GlassCard>

      {/* Advice Teaser */}
      <div className="space-y-3 pb-6">
        <div className="flex justify-between items-center px-1">
            <h3 className="font-bold text-gray-800 text-lg">Совет дня</h3>
            <ChevronRight size={20} className="text-gray-400" />
        </div>
        <GlassCard className="p-0 overflow-hidden" onClick={() => navigate('/advice')}>
             <div className="h-32 bg-gradient-to-r from-indigo-300 to-purple-400 relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-4 left-4 text-white">
                    <div className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs inline-block mb-1">Питание</div>
                    <h4 className="font-bold text-lg leading-tight">Что лучше есть во время фазы: {translatedPhase}</h4>
                </div>
             </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default HomePage;
