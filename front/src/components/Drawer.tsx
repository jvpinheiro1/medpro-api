import React, { useEffect } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  isConfirmDisabled?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirmar',
  isConfirmDisabled = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-full max-w-md bg-[#ffffff] h-full shadow-2xl flex flex-col border-l border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <h2 className="text-[1.5rem] font-medium text-[#09090b]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-[#71717a] hover:text-[#09090b] text-2xl px-2 leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>

        {onConfirm && (
          <div className="p-6 border-t border-[rgba(0,0,0,0.08)] bg-[#f4f4f5] flex gap-3">
            <button 
              onClick={onConfirm}
              disabled={isConfirmDisabled}
              className="flex-1 bg-[#000000] text-[#ffffff] py-3 px-4 text-[0.875rem] font-medium hover:bg-black/80 disabled:opacity-50 transition-colors"
            >
              {confirmText}
            </button>
            <button 
              onClick={onClose}
              className="px-6 border border-[#09090b] text-[#09090b] py-3 text-[0.875rem] font-medium hover:bg-[rgba(0,0,0,0.04)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
