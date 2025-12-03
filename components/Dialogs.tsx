import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const BaseDialog: React.FC<DialogProps> = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', isDestructive = false 
}) => {
  return (
    <BaseDialog isOpen={isOpen} title={title} onClose={onCancel}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          {isDestructive && (
            <div className="p-3 bg-red-100 rounded-full shrink-0 text-red-600">
               <AlertTriangle size={24} />
            </div>
          )}
          <p className="text-gray-600 text-sm leading-relaxed mt-1">{message}</p>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-sm transition-colors ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </BaseDialog>
  );
};

export interface InputDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  initialValue?: string;
  placeholder?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen, title, message, initialValue = '', placeholder, onConfirm, onCancel, confirmLabel = 'Save'
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) setValue(initialValue);
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
        onConfirm(value.trim());
    }
  };

  return (
    <BaseDialog isOpen={isOpen} title={title} onClose={onCancel}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {message && <p className="text-sm text-gray-600">{message}</p>}
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          autoFocus
        />
        <div className="flex justify-end gap-3 mt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!value.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </BaseDialog>
  );
};