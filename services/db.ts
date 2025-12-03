import { Prompt, Category } from '../types';

const DB_NAME = 'PromptMindDB';
const DB_VERSION = 1;

class StorageService {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Prompts Store
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' });
          promptStore.createIndex('categoryId', 'categoryId', { unique: false });
          promptStore.createIndex('isFavorite', 'isFavorite', { unique: false });
          promptStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // Categories Store
        if (!db.objectStoreNames.contains('categories')) {
          const catStore = db.createObjectStore('categories', { keyPath: 'id' });
          catStore.createIndex('parentId', 'parentId', { unique: false });
        }
      };
    });
  }

  // Generic Helpers
  private async getStore(storeName: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    const db = await this.dbPromise;
    const tx = db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  }

  // Prompts
  async getAllPrompts(): Promise<Prompt[]> {
    const store = await this.getStore('prompts', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result.sort((a: Prompt, b: Prompt) => b.updatedAt - a.updatedAt));
      request.onerror = () => reject(request.error);
    });
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    const store = await this.getStore('prompts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(prompt);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePrompt(id: string): Promise<void> {
    const store = await this.getStore('prompts', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Categories
  async getAllCategories(): Promise<Category[]> {
    const store = await this.getStore('categories', 'readonly');
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveCategory(category: Category): Promise<void> {
    const store = await this.getStore('categories', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(category);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const store = await this.getStore('categories', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Seed Data (if empty)
  async seedDataIfNeeded(): Promise<boolean> {
    const cats = await this.getAllCategories();
    if (cats.length > 0) return false;

    const initialCats: Category[] = [
      { id: 'marketing', name: 'Marketing', parentId: null, icon: 'megaphone', color: 'blue' },
      { id: 'social-media', name: 'Social Media', parentId: 'marketing', icon: 'share', color: 'indigo' },
      { id: 'seo', name: 'SEO', parentId: 'marketing', icon: 'search', color: 'green' },
      { id: 'coding', name: 'Coding', parentId: null, icon: 'code', color: 'slate' },
      { id: 'react', name: 'React', parentId: 'coding', icon: 'atom', color: 'cyan' },
      { id: 'writing', name: 'Creative Writing', parentId: null, icon: 'pen-tool', color: 'purple' },
    ];

    const initialPrompts: Prompt[] = [
      {
        id: 'p1',
        title: 'Blog Post Generator',
        content: 'Write a comprehensive blog post about [TOPIC]. structure it with an engaging introduction, 3 main points with examples, and a conclusion with a call to action. Tone: Professional yet accessible.',
        categoryId: 'social-media',
        tags: ['blog', 'content'],
        isFavorite: true,
        usageCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'p2',
        title: 'React Component Specialist',
        content: 'Act as a Senior React Engineer. Create a functional component for [COMPONENT_NAME] using TypeScript and Tailwind CSS. Ensure accessibility (a11y) and handle loading/error states.',
        categoryId: 'react',
        tags: ['dev', 'frontend'],
        isFavorite: false,
        usageCount: 5,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    for (const c of initialCats) await this.saveCategory(c);
    for (const p of initialPrompts) await this.savePrompt(p);
    
    return true;
  }
}

export const db = new StorageService();
