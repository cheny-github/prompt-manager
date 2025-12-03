import React from 'react';
import { Prompt } from '../types';
import { Search, Copy, Edit3, Trash2, Star, Tag, Check, Calendar } from 'lucide-react';

interface PromptListProps {
  prompts: Prompt[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onToggleFav: (prompt: Prompt) => void;
  onCopy: (id: string, text: string) => void;
  onCreate: () => void;
}

export const PromptList: React.FC<PromptListProps> = ({
  prompts,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onToggleFav,
  onCopy,
  onCreate
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    onCopy(id, text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-gray-50/50">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search prompts by title, content or tags..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-500 rounded-full text-sm outline-none transition-all"
          />
        </div>
        <button 
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium shadow-md shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl leading-none font-light">+</span> New Prompt
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {prompts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No prompts found</p>
            <p className="text-sm">Try adjusting your search or create a new one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prompts.map(prompt => (
              <div 
                key={prompt.id} 
                className="group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 flex flex-col h-64 relative overflow-hidden"
              >
                {/* Card Actions (Hover) */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                   <button 
                    onClick={() => onEdit(prompt)}
                    className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-indigo-600 hover:border-indigo-600 shadow-sm"
                    title="Edit"
                   >
                     <Edit3 size={14} />
                   </button>
                   <button 
                    onClick={() => onDelete(prompt.id)}
                    className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-600 hover:text-red-600 hover:border-red-600 shadow-sm"
                    title="Delete"
                   >
                     <Trash2 size={14} />
                   </button>
                </div>

                <div className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-2 pr-16">
                    <h3 className="font-bold text-gray-800 line-clamp-1" title={prompt.title}>{prompt.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                     <button 
                      onClick={() => onToggleFav(prompt)}
                      className={`focus:outline-none transition-colors ${prompt.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                     >
                       <Star size={16} fill={prompt.isFavorite ? "currentColor" : "none"} />
                     </button>
                     <span className="text-xs text-gray-400 flex items-center gap-1">
                       <Calendar size={12} /> {formatDate(prompt.updatedAt)}
                     </span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-4 flex-1 font-mono bg-gray-50 p-2 rounded border border-gray-100">
                    {prompt.content}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-1 overflow-hidden">
                      {prompt.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700">
                          <Tag size={10} className="mr-1" /> {tag}
                        </span>
                      ))}
                      {prompt.tags.length > 2 && (
                        <span className="text-xs text-gray-400 px-1 py-0.5">+{prompt.tags.length - 2}</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleCopy(prompt.id, prompt.content)}
                      className={`
                        flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                        ${copiedId === prompt.id 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-800 hover:text-white'}
                      `}
                    >
                      {copiedId === prompt.id ? <Check size={12} /> : <Copy size={12} />}
                      {copiedId === prompt.id ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};