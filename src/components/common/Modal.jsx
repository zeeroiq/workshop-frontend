import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/75 dark:bg-gray-900/75 p-2 sm:p-4">
      <div className="w-[calc(100vw-1rem)] max-w-2xl overflow-hidden rounded-lg bg-white text-foreground shadow-lg dark:bg-gray-800">
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
