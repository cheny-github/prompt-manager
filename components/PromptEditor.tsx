import React, { useState, useEffect } from 'react';
import { Prompt, Category } from '../types';
import { X, Save, Wand2, Loader2, Copy, Check } from 'lucide-react';
import { refinePrompt } from '../services/gemini';

interface PromptEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Partial<Prompt>) => void;
  categories: Category[];
  initialData: Prompt | null;
  currentCategoryId: string | null;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  initialData,
  currentCategoryId
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [tags, setTags] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setContent(initialData.content);
        setCategoryId(initialData.categoryId || '');
        setTags(initialData.tags.join(', '));
      } else {
        // New prompt
        setTitle('');
        setContent('');
        // If current filter is a specific category, default to it
        const isSystemFilter = ['all', 'favorites', 'recent'].includes(currentCategoryId || '');
        setCategoryId(isSystemFilter ? '' : currentCategoryId || '');
        setTags('');
      }
    }
  }, [isOpen, initialData, currentCategoryId]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const formattedTags = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    onSave({
      ...(initialData || {}),
      title,
      content,
      categoryId: categoryId || null,
      tags: formattedTags
    });
    onClose();
  };

  const handleRefine = async () => {
    if (!content.trim()) return;
    setIsRefining(true);
    try {
      const betterPrompt = await refinePrompt(content);
      setContent(betterPrompt);
    } catch (error) {
      alert("Failed to refine prompt. Check your connection or API key.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? 'Edit Prompt' : 'New Prompt'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* Title & Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SEO Blog Generator"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-1 flex flex-col h-64">
             <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase">Prompt Content</label>
                <div className="flex gap-2">
                   <button 
                    onClick={handleCopy}
                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-indigo-600"
                    title="Copy current content"
                   >
                     {copied ? <Check size={12} /> : <Copy size={12} />}
                     {copied ? 'Copied' : 'Copy'}
                   </button>
                   <button 
                    onClick={handleRefine}
                    disabled={isRefining || !content}
                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                   >
                     {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                     Refine with AI
                   </button>
                </div>
             </div>
             <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your prompt here..."
                className="flex-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm leading-relaxed"
             />
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. creative, work, email"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!title || !content}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Save size={16} />
            Save Prompt
          </button>
        </div>

      </div>
    </div>
  );
};
