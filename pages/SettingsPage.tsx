
import React, { useState } from 'react';
import { useApp } from '../App';
import { GlassCard, Button } from '../components/Components';
import { haptic } from '../utils';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Crown, CheckCircle2 } from 'lucide-react';

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
          <button onClick={() => navigate(-1)} className="p-2 bg-white/50 rounded-full text-gray-700 hover:bg-white transition-colors">
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
                 className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-primary focus:bg-white transition-colors"
              />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <label className="text-sm text-gray-500 mb-1 block">Цикл (дней)</label>
                  <input 
                     type="number"
                     value={cycle} 
                     onChange={e => setCycle(Number(e.target.value))}
                     className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-primary focus:bg-white transition-colors"
                  />
              </div>
              <div>
                  <label className="text-sm text-gray-500 mb-1 block">Месячные (дней)</label>
                  <input 
                     type="number"
                     value={period} 
                     onChange={e => setPeriod(Number(e.target.value))}
                     className="w-full bg-white/50 border border-gray-200 rounded-xl p-3 focus:outline-primary focus:bg-white transition-colors"
                  />
              </div>
          </div>
          <Button onClick={handleSave}>Сохранить изменения</Button>
      </GlassCard>

      {/* PRO Section */}
      <GlassCard className="p-0 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none overflow-hidden relative">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Crown className="text-yellow-400 fill-yellow-400" size={24} />
                        <h3 className="font-bold text-xl tracking-tight">FemCycle PRO</h3>
                    </div>
                    <p className="text-gray-400 text-sm">Максимум возможностей</p>
                  </div>
                  {settings.isPro && <span className="bg-white/10 backdrop-blur border border-white/20 px-3 py-1 rounded-full text-xs font-bold text-yellow-300">АКТИВЕН</span>}
              </div>

              <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200">Безлимитный доступ к статьям</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200">Расширенная аналитика настроения</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200">Умные уведомления</span>
                  </div>
                  <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200">PDF экспорт для врача</span>
                  </div>
              </div>

              <button 
                onClick={() => {
                    haptic.impact('medium');
                    updateSettings({ isPro: !settings.isPro });
                }}
                className={`w-full py-3.5 font-bold rounded-xl transition-all active:scale-95 ${settings.isPro ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 shadow-lg shadow-yellow-500/30'}`}
              >
                  {settings.isPro ? 'Отключить PRO (Demo)' : 'Подключить PRO (Demo)'}
              </button>
              {!settings.isPro && <p className="text-center text-xs text-gray-500 mt-3">7 дней бесплатно, затем 199₽/мес</p>}
          </div>
      </GlassCard>

      {/* Danger Zone */}
      <div className="px-2 pt-4">
          <button 
            onClick={handleReset}
            className="w-full py-3 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
          >
              <Trash2 size={16} />
              Сбросить все данные и начать заново
          </button>
      </div>
    </div>
  );
};

export default SettingsPage;
