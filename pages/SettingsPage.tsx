
import React, { useState } from 'react';
import { useApp } from '../App';
import { GlassCard, Button } from '../components/Components';
import { haptic } from '../utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Crown } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetData } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState(settings.name || '');
  const [cycle, setCycle] = useState(settings.avgCycleLength);
  const [period, setPeriod] = useState(settings.avgPeriodLength);

  const handleSave = () => {
      updateSettings({
          name,
          avgCycleLength: cycle,
          avgPeriodLength: period
      });
      haptic.success();
      navigate(-1);
  };

  const handleReset = () => {
      if (confirm('Вы уверены? Все данные будут удалены.')) {
          resetData();
      }
  }

  return (
    <div className="pt-4 pb-10 space-y-6">
      <div className="flex items-center gap-4 px-2">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/50 rounded-full text-gray-700">
              <ArrowLeft />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Настройки</h2>
      </div>

      {/* Profile Section */}
      <GlassCard className="p-5 space-y-4">
          <h3 className="font-bold text-gray-700">Профиль</h3>
          <div>
              <label className="text-sm text-gray-500 mb-1 block">Имя</label>
              <input 
                 value={name} 
                 onChange={e => setName(e.target.value)}
                 className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-primary"
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-sm text-gray-500 mb-1 block">Цикл (дней)</label>
                  <input 
                     type="number"
                     value={cycle} 
                     onChange={e => setCycle(Number(e.target.value))}
                     className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-primary"
                  />
              </div>
              <div>
                  <label className="text-sm text-gray-500 mb-1 block">Месячные (дней)</label>
                  <input 
                     type="number"
                     value={period} 
                     onChange={e => setPeriod(Number(e.target.value))}
                     className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-primary"
                  />
              </div>
          </div>
          <Button onClick={handleSave}>Сохранить</Button>
      </GlassCard>

      {/* PRO Section */}
      <GlassCard className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                  <Crown className="text-yellow-400" />
                  <h3 className="font-bold text-lg">FemCycle PRO</h3>
              </div>
              {settings.isPro && <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">АКТИВЕН</span>}
          </div>
          <p className="text-gray-300 text-sm mb-4">
              Получите доступ ко всей аналитике, статьям и персонализированным советам.
          </p>
          <button 
             onClick={() => updateSettings({ isPro: !settings.isPro })}
             className="w-full py-3 bg-white text-gray-900 font-bold rounded-xl"
          >
              {settings.isPro ? 'Отключить PRO (Demo)' : 'Подключить PRO (Demo)'}
          </button>
      </GlassCard>

      {/* Danger Zone */}
      <div className="px-2">
          <button 
            onClick={handleReset}
            className="w-full py-3 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-colors"
          >
              <Trash2 size={18} />
              Сбросить все данные
          </button>
      </div>
    </div>
  );
};

export default SettingsPage;
