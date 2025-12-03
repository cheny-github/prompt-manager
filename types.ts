export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
  color?: string;
}

export interface Prompt {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export type ViewFilter = 'all' | 'favorites' | 'recent' | string; // string is categoryId

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}