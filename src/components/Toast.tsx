import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg shadow-lg">
      <AlertCircle className="w-5 h-5 text-blue-500" />
      <p className="text-sm">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-blue-500 hover:text-blue-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}