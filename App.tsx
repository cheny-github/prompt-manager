import React, { useEffect, useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { PromptList } from './components/PromptList';
import { PromptEditor } from './components/PromptEditor';
import { StatsDashboard } from './components/StatsDashboard';
import { Prompt, Category, Toast } from './types';
import { db } from './services/db';
import { v4 as uuidv4 } from 'uuid';
import { Menu, X } from 'lucide-react';

const App = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  // Initialize Data
  useEffect(() => {
    const init = async () => {
      await db.seedDataIfNeeded();
      refreshData();
    };
    init();
  }, []);

  const refreshData = async () => {
    const [p, c] = await Promise.all([db.getAllPrompts(), db.getAllCategories()]);
    setPrompts(p);
    setCategories(c);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Actions ---

  const handleAddCategory = async (parentId: string | null) => {
    const name = prompt("Enter category name:");
    if (name) {
      const newCat: Category = {
        id: uuidv4(),
        name,
        parentId,
        icon: 'folder',
        color: 'gray'
      };
      await db.saveCategory(newCat);
      await refreshData();
      showToast('Category created');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Delete this category? Prompts inside will be uncategorized.")) {
        // Logic to update child prompts could go here, for now just delete cat
        await db.deleteCategory(id);
        
        // Uncategorize prompts in this category
        const promptsInCat = prompts.filter(p => p.categoryId === id);
        for(const p of promptsInCat) {
            await db.savePrompt({ ...p, categoryId: null });
        }

        await refreshData();
        if (selectedFilter === id) setSelectedFilter('all');
        showToast('Category deleted');
    }
  }

  const handleSavePrompt = async (data: Partial<Prompt>) => {
    const now = Date.now();
    const promptToSave: Prompt = {
      id: data.id || uuidv4(),
      title: data.title!,
      content: data.content!,
      categoryId: data.categoryId || null,
      tags: data.tags || [],
      isFavorite: data.isFavorite || false,
      usageCount: data.usageCount || 0,
      createdAt: data.createdAt || now,
      updatedAt: now
    };

    await db.savePrompt(promptToSave);
    await refreshData();
    showToast(data.id ? 'Prompt updated' : 'Prompt created');
  };

  const handleDeletePrompt = async (id: string) => {
    if (confirm("Are you sure you want to delete this prompt?")) {
      await db.deletePrompt(id);
      await refreshData();
      showToast('Prompt deleted');
    }
  };

  const handleToggleFav = async (prompt: Prompt) => {
    await db.savePrompt({ ...prompt, isFavorite: !prompt.isFavorite });
    await refreshData();
  };

  const handleUsage = async (id: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    
    // Find the prompt and increment usage
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
        const updated = {
            ...prompt,
            usageCount: (prompt.usageCount || 0) + 1,
            lastUsedAt: Date.now()
        };
        // Optimistic update locally
        setPrompts(prev => prev.map(p => p.id === id ? updated : p));
        // Persist
        await db.savePrompt(updated);
    }
    
    showToast('Copied to clipboard');
  };

  // --- Filtering Logic ---

  const filteredPrompts = useMemo(() => {
    let result = prompts;

    // Category Filter
    if (selectedFilter === 'stats') {
        return []; // Not used for list
    } else if (selectedFilter === 'favorites') {
      result = result.filter(p => p.isFavorite);
    } else if (selectedFilter === 'recent') {
      result = result.slice(0, 50); 
    } else if (selectedFilter !== 'all') {
      // Specific Category (include children?)
      const getChildIds = (parentId: string): string[] => {
          const children = categories.filter(c => c.parentId === parentId);
          return [parentId, ...children.flatMap(c => getChildIds(c.id))];
      };
      const relevantIds = getChildIds(selectedFilter);
      result = result.filter(p => p.categoryId && relevantIds.includes(p.categoryId));
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [prompts, categories, selectedFilter, searchQuery]);

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform lg:transform-none lg:static transition-transform duration-300
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar 
          categories={categories}
          selectedFilter={selectedFilter}
          onSelectFilter={(id) => { setSelectedFilter(id); setMobileMenuOpen(false); }}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full min-w-0">
         {/* Mobile Header */}
         <div className="lg:hidden flex items-center p-4 border-b border-gray-200 bg-white">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600">
               <Menu />
            </button>
            <span className="font-bold ml-2">PromptMind</span>
         </div>

         {selectedFilter === 'stats' ? (
             <StatsDashboard prompts={prompts} categories={categories} />
         ) : (
             <PromptList 
                prompts={filteredPrompts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onEdit={(p) => { setEditingPrompt(p); setIsEditorOpen(true); }}
                onDelete={handleDeletePrompt}
                onToggleFav={handleToggleFav}
                onCopy={handleUsage}
                onCreate={() => { setEditingPrompt(null); setIsEditorOpen(true); }}
             />
         )}
      </div>

      <PromptEditor 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSavePrompt}
        categories={categories}
        initialData={editingPrompt}
        currentCategoryId={selectedFilter === 'stats' ? null : selectedFilter}
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-in fade-in slide-in-from-bottom-5 transition-all z-50 ${toast.type === 'error' ? 'bg-red-500' : 'bg-gray-800'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;