import React, { useMemo } from 'react';
import { Prompt, Category } from '../types';
import { BarChart2, Hash, Star, Zap, TrendingUp, Tag } from 'lucide-react';

interface StatsDashboardProps {
  prompts: Prompt[];
  categories: Category[];
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ prompts, categories }) => {
  
  const stats = useMemo(() => {
    const totalPrompts = prompts.length;
    const totalFavorites = prompts.filter(p => p.isFavorite).length;
    const totalUsage = prompts.reduce((acc, curr) => acc + (curr.usageCount || 0), 0);
    
    // Sort by usage
    const mostUsed = [...prompts]
      .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
      .slice(0, 5)
      .filter(p => (p.usageCount || 0) > 0);

    // Category Distribution
    const categoryCounts: Record<string, number> = {};
    prompts.forEach(p => {
      const catId = p.categoryId || 'uncategorized';
      categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCounts)
      .map(([id, count]) => {
        const cat = categories.find(c => c.id === id);
        return {
          name: cat ? cat.name : 'Uncategorized',
          count,
          color: cat ? cat.color : 'gray',
          percentage: Math.round((count / totalPrompts) * 100)
        };
      })
      .sort((a, b) => b.count - a.count);

    // Tag Analysis
    const tagCounts: Record<string, number> = {};
    prompts.forEach(p => {
      p.tags.forEach(tag => {
        const cleanTag = tag.toLowerCase().trim();
        if (cleanTag) tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    return { totalPrompts, totalFavorites, totalUsage, mostUsed, categoryData, topTags };
  }, [prompts, categories]);

  return (
    <div className="flex-1 h-full bg-gray-50/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-5">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" />
          Statistics Dashboard
        </h2>
        <p className="text-sm text-gray-500 mt-1">Insights into your prompt library usage and organization</p>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Total Prompts" 
              value={stats.totalPrompts} 
              icon={Hash} 
              color="bg-blue-100 text-blue-600" 
            />
             <StatCard 
              label="Total Usage" 
              value={stats.totalUsage} 
              icon={Zap} 
              color="bg-amber-100 text-amber-600" 
            />
            <StatCard 
              label="Favorites" 
              value={stats.totalFavorites} 
              icon={Star} 
              color="bg-pink-100 text-pink-600" 
            />
            <StatCard 
              label="Categories" 
              value={categories.length} 
              icon={BarChart2} 
              color="bg-emerald-100 text-emerald-600" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Category Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-6">Prompts by Category</h3>
              <div className="space-y-4">
                {stats.categoryData.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">No data available</div>
                ) : (
                    stats.categoryData.map((item) => (
                    <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-gray-500">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                            style={{ width: `${item.percentage}%` }}
                        />
                        </div>
                    </div>
                    ))
                )}
              </div>
            </div>

            {/* Top Tags */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
                <Tag size={18} /> Top Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.length === 0 ? (
                    <div className="text-gray-400 w-full text-center py-10">No tags used yet</div>
                ) : (
                    stats.topTags.map(([tag, count]) => (
                    <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                        <span className="font-medium text-gray-700">#{tag}</span>
                        <span className="bg-indigo-100 text-indigo-700 text-xs px-1.5 py-0.5 rounded-full font-bold">{count}</span>
                    </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Most Used Prompts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-700">Most Used Prompts</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.mostUsed.length === 0 ? (
                 <div className="p-8 text-center text-gray-400">
                    Usage data will appear here once you start copying prompts.
                 </div>
              ) : (
                stats.mostUsed.map((p, idx) => (
                    <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm shrink-0">
                            {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-800 truncate">{p.title}</h4>
                            <p className="text-xs text-gray-500 truncate">{p.content}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
                            <Zap size={12} /> {p.usageCount} uses
                        </div>
                    </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
