import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onPrimary: () => void;
  primaryLabel: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  title, 
  children, 
  onPrimary, 
  primaryLabel, 
  onSecondary, 
  secondaryLabel 
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all scale-100">
        <h2 className="text-3xl font-bold text-indigo-900 mb-4">{title}</h2>
        <div className="text-gray-600 mb-8 text-lg">
          {children}
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={onPrimary}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            {primaryLabel}
          </button>
          {onSecondary && (
            <button
              onClick={onSecondary}
              className="w-full py-3 text-indigo-600 font-semibold hover:bg-indigo-50 rounded-xl transition-colors"
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};