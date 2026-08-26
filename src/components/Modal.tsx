import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface ModalPortalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  className?: string;
  backdropClassName?: string;
}

export const ModalPortal: React.FC<ModalPortalProps> = ({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
  className = '',
  backdropClassName = '',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background page, sidebar, and layout from scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow || '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-sm sm:backdrop-blur-md animate-fade-in overflow-y-auto ${backdropClassName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && closeOnBackdropClick && onClose) {
          onClose();
        }
      }}
    >
      <div className={`relative z-[100000] w-full flex justify-center ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
  hideHeader?: boolean;
  closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-xl',
  className = '',
  hideHeader = false,
  closeOnBackdropClick = true,
}) => {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose} closeOnBackdropClick={closeOnBackdropClick}>
      <div
        className={`w-full ${maxWidth} bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${className}`}
      >
        {/* Header */}
        {!hideHeader && title && (
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
            <div className="font-bold text-slate-900 text-sm tracking-wide">{title}</div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-xs text-slate-700">
          {children}
        </div>
      </div>
    </ModalPortal>
  );
};

