import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-end sm:items-center p-4">
      <div 
        className={cn(
            "bg-card text-foreground rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-border/50 animate-in zoom-in-95 slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300",
            className
        )}
      >
        <div className="flex justify-between items-center p-5 border-b border-border/50 bg-muted/30">
          <h3 className="text-lg font-black tracking-tight uppercase">{title}</h3>
          <button 
            onClick={onClose} 
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
