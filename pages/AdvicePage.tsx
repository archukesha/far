
import React, { useState } from 'react';
import { GlassCard } from '../components/Components';
import { haptic } from '../utils';

const CATEGORIES = ['Все', 'ПМС', 'Питание', 'Спорт', 'Сон'];
const CAT_MAP: Record<string, string> = { 'Все': 'All', 'ПМС': 'PMS', 'Питание': 'Nutrition', 'Спорт': 'Fitness', 'Сон': 'Sleep' };

const ARTICLES = [
    { id: 1, title: 'Почему так хочется шоколада?', category: 'PMS', displayCat: 'ПМС', readTime: '3 мин', locked: false, image: 'https://picsum.photos/400/200?random=1' },
    { id: 2, title: 'Лучшие тренировки в овуляцию', category: 'Fitness', displayCat: 'Спорт', readTime: '5 мин', locked: false, image: 'https://picsum.photos/400/200?random=2' },
    { id: 3, title: 'Как высыпаться в любой день цикла', category: 'Sleep', displayCat: 'Сон', readTime: '7 мин', locked: true, image: 'https://picsum.photos/400/200?random=3' },
    { id: 4, title: 'Продукты, богатые железом', category: 'Nutrition', displayCat: 'Питание', readTime: '4 мин', locked: false, image: 'https://picsum.photos/400/200?random=4' },
    { id: 5, title: 'Гормональное акне: что делать?', category: 'PMS', displayCat: 'ПМС', readTime: '6 мин', locked: true, image: 'https://picsum.photos/400/200?random=5' },
];

const AdvicePage: React.FC = () => {
  const [activeCat, setActiveCat] = useState('Все');

  const filtered = activeCat === 'Все' ? ARTICLES : ARTICLES.filter(a => a.category === CAT_MAP[activeCat]);

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
      <div className="space-y-4">
          {filtered.map(article => (
              <GlassCard key={article.id} className="overflow-hidden group active:scale-[0.98] transition-transform duration-200">
                  <div className="h-32 bg-gray-200 relative">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                      {article.locked && (
                          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                              PRO
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
    </div>
  );
};

export default AdvicePage;
