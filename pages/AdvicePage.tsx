
import React, { useState } from 'react';
import { GlassCard, BottomSheet, Button } from '../components/Components';
import { haptic } from '../utils';
import { X, Lock, Crown, Star } from 'lucide-react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = ['Все', 'ПМС', 'Питание', 'Спорт', 'Сон'];
const CAT_MAP: Record<string, string> = { 'Все': 'All', 'ПМС': 'PMS', 'Питание': 'Nutrition', 'Спорт': 'Fitness', 'Сон': 'Sleep' };

const ARTICLES = [
    { id: 1, title: 'Почему так хочется шоколада?', category: 'PMS', displayCat: 'ПМС', readTime: '3 мин', locked: false, image: 'https://picsum.photos/400/200?random=1', content: 'Тяга к сладкому во время ПМС обусловлена падением уровня магния и скачками серотонина. Шоколад содержит магний, поэтому организм его требует. Попробуйте заменить молочный шоколад на горький (>70%).' },
    { id: 2, title: 'Лучшие тренировки в овуляцию', category: 'Fitness', displayCat: 'Спорт', readTime: '5 мин', locked: false, image: 'https://picsum.photos/400/200?random=2', content: 'В период овуляции уровень эстрогена на пике. Это лучшее время для силовых рекордов и интенсивного кардио. Ваша выносливость сейчас максимальна!' },
    { id: 3, title: 'Как высыпаться в любой день цикла', category: 'Sleep', displayCat: 'Сон', readTime: '7 мин', locked: true, image: 'https://picsum.photos/400/200?random=3', content: 'Этот контент доступен только в PRO версии. Узнайте, как фазы цикла влияют на архитектуру сна и как корректировать режим.' },
    { id: 4, title: 'Продукты, богатые железом', category: 'Nutrition', displayCat: 'Питание', readTime: '4 мин', locked: false, image: 'https://picsum.photos/400/200?random=4', content: 'Во время менструации важно восполнять железо. Включите в рацион шпинат, чечевицу, красное мясо и темный шоколад. Не забывайте про витамин С для лучшего усвоения.' },
    { id: 5, title: 'Гормональное акне: что делать?', category: 'PMS', displayCat: 'ПМС', readTime: '6 мин', locked: true, image: 'https://picsum.photos/400/200?random=5', content: 'Этот контент доступен только в PRO версии. Разбор причин появления акне в разные фазы и схема ухода.' },
];

const AdvicePage: React.FC = () => {
  const { settings } = useApp();
  const navigate = useNavigate();
  const [activeCat, setActiveCat] = useState('Все');
  const [selectedArticle, setSelectedArticle] = useState<typeof ARTICLES[0] | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  const filtered = activeCat === 'Все' ? ARTICLES : ARTICLES.filter(a => a.category === CAT_MAP[activeCat]);

  const handleArticleClick = (article: typeof ARTICLES[0]) => {
      haptic.selection();
      if (article.locked && !settings.isPro) {
          setShowPaywall(true);
          return;
      }
      setSelectedArticle(article);
  };

  return (
    <div className="pt-4 pb-20 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 px-2">Советы</h2>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-2 pb-2">
          {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { haptic.selection(); setActiveCat(cat); }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCat === cat ? 'bg-primary text-white shadow-md' : 'bg-white/50 text-gray-600'}`}
              >
                  {cat}
              </button>
          ))}
      </div>

      {/* List */}
      <div className="space-y-4 px-1">
          {filtered.map(article => (
              <GlassCard 
                key={article.id} 
                onClick={() => handleArticleClick(article)}
                className="overflow-hidden group active:scale-[0.98] transition-transform duration-200 cursor-pointer"
              >
                  <div className="h-32 bg-gray-200 relative">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                      {article.locked && !settings.isPro && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                                  <Lock size={12} /> PRO
                              </div>
                          </div>
                      )}
                  </div>
                  <div className="p-4">
                      <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-primary uppercase">{article.displayCat}</span>
                          <span className="text-xs text-gray-400">{article.readTime}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg leading-tight">{article.title}</h3>
                  </div>
              </GlassCard>
          ))}
      </div>

      {/* Article Reader */}
      <BottomSheet isOpen={!!selectedArticle} onClose={() => setSelectedArticle(null)}>
          {selectedArticle && (
              <div>
                  <div className="relative h-48 -mx-6 -mt-6 mb-6">
                      <img src={selectedArticle.image} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setSelectedArticle(null)}
                        className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-gray-800 shadow-lg hover:bg-white"
                      >
                          <X size={20} />
                      </button>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedArticle.title}</h2>
                  <div className="flex gap-3 mb-6">
                      <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">{selectedArticle.displayCat}</span>
                      <span className="text-xs text-gray-500 flex items-center">{selectedArticle.readTime} чтения</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                      {selectedArticle.content}
                  </p>
                  <div className="h-10"/>
              </div>
          )}
      </BottomSheet>

      {/* Paywall Modal */}
      <BottomSheet isOpen={showPaywall} onClose={() => setShowPaywall(false)}>
          <div className="text-center px-4 pt-2">
              <div className="w-16 h-16 bg-gradient-to-tr from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Crown size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Доступно в PRO</h3>
              <p className="text-gray-500 mb-6">Эта статья и другие эксклюзивные материалы доступны подписчикам FemCycle PRO.</p>
              
              <div className="space-y-3 mb-8 text-left bg-gray-50 p-4 rounded-2xl">
                   <div className="flex items-center gap-3">
                       <Star size={18} className="text-yellow-500" />
                       <span className="text-gray-700 text-sm font-medium">Полный доступ ко всем статьям</span>
                   </div>
                   <div className="flex items-center gap-3">
                       <Star size={18} className="text-yellow-500" />
                       <span className="text-gray-700 text-sm font-medium">Расширенная аналитика симптомов</span>
                   </div>
                   <div className="flex items-center gap-3">
                       <Star size={18} className="text-yellow-500" />
                       <span className="text-gray-700 text-sm font-medium">Персональные рекомендации</span>
                   </div>
              </div>

              <Button onClick={() => navigate('/settings')}>
                  Перейти к оформлению
              </Button>
              <button 
                onClick={() => setShowPaywall(false)}
                className="mt-4 text-sm text-gray-400 font-medium p-2"
              >
                  Позже
              </button>
          </div>
      </BottomSheet>
    </div>
  );
};

export default AdvicePage;
