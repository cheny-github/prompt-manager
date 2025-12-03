import React, { useState } from 'react';
import { Category } from '../types';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  LayoutGrid, 
  Star, 
  Clock,
  Plus,
  Trash2,
  FolderOpen,
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  onAddCategory: (parentId: string | null) => void;
  onDeleteCategory: (id: string) => void;
}

interface CategoryItemProps {
  category: Category;
  allCategories: Category[];
  selectedFilter: string;
  onSelect: (id: string) => void;
  depth?: number;
  onDelete: (id: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  category, 
  allCategories, 
  selectedFilter, 
  onSelect, 
  depth = 0,
  onDelete
}) => {
  const [expanded, setExpanded] = useState(false);
  const children = allCategories.filter(c => c.parentId === category.id);
  const hasChildren = children.length > 0;
  const isSelected = selectedFilter === category.id;

  return (
    <div>
      <div 
        className={`
          group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-150
          ${isSelected 
            ? 'bg-indigo-50 text-indigo-700' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
        `}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
        onClick={() => onSelect(category.id)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className={`p-0.5 rounded hover:bg-gray-200 ${!hasChildren ? 'opacity-0 cursor-default' : ''}`}
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          
          {expanded ? <FolderOpen size={16} className="text-indigo-400 shrink-0" /> : <Folder size={16} className="text-gray-400 shrink-0" />}
          <span className="truncate">{category.name}</span>
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
          title="Delete Category"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && children.map(child => (
        <CategoryItem 
          key={child.id} 
          category={child} 
          allCategories={allCategories} 
          selectedFilter={selectedFilter}
          onSelect={onSelect}
          depth={depth + 1}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  selectedFilter, 
  onSelectFilter, 
  onAddCategory,
  onDeleteCategory
}) => {
  const rootCategories = categories.filter(c => c.parentId === null);

  const navItems = [
    { id: 'all', label: 'All Prompts', icon: LayoutGrid },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'stats', label: 'Statistics', icon: BarChart2 },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 hidden lg:block">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          PromptMind
        </h1>
        <p className="text-xs text-gray-500 mt-1">Manage your AI prompts</p>
      </div>

      {/* Main Nav */}
      <div className="p-3 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectFilter(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${selectedFilter === item.id 
                ? 'bg-gray-900 text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
            `}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Categories Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Categories
        </span>
        <button 
          onClick={() => onAddCategory(null)}
          className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          title="Add Category"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 custom-scrollbar">
        {rootCategories.length === 0 ? (
          <div className="text-center py-8 px-4">
             <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 mb-2">
                <Folder size={14} className="text-gray-400" />
             </div>
             <p className="text-xs text-gray-400">No categories yet.</p>
             <button 
                onClick={() => onAddCategory(null)}
                className="text-xs text-indigo-600 hover:underline mt-1"
             >
                Create one
             </button>
          </div>
        ) : (
          rootCategories.map(cat => (
            <CategoryItem 
              key={cat.id} 
              category={cat} 
              allCategories={categories}
              selectedFilter={selectedFilter}
              onSelect={onSelectFilter}
              onDelete={onDeleteCategory}
            />
          ))
        )}
      </div>

      {/* Footer / User Info could go here */}
      <div className="p-4 border-t border-gray-100 text-xs text-center text-gray-400">
        v1.1.0 • Local Storage
      </div>
    </div>
  );
};