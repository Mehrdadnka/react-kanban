// features/TaskSidebars/view/components/DeleteConfirmDialog.tsx
import React, { useState, useCallback } from 'react';
import { 
  Trash2, AlertTriangle, Loader2, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { toast } from 'sonner';

interface DeleteConfirmDialogProps {
  taskTitle: string;
  isDarkMode?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  taskTitle,
  isDarkMode,
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'confirm' | 'final'>('confirm');
  
  const isConfirmed = step === 'final';

  const handleFirstConfirm = useCallback(() => {
    setStep('final');
  }, []);

  const handleDelete = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  const handleBack = useCallback(() => {
    setStep('confirm');
    setConfirmText('');
  }, []);

  // Close on Escape
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Overlay background */}
      <div className={cn(
        "p-5 rounded-xl border-2 mb-4 transition-all duration-300",
        isConfirmed 
          ? isDarkMode 
            ? "bg-red-900/30 border-red-700/50" 
            : "bg-red-50 border-red-300"
          : isDarkMode 
            ? "bg-gray-800/80 border-gray-700" 
            : "bg-white border-gray-200 shadow-lg"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-full flex-shrink-0 transition-all duration-300",
            isConfirmed
              ? isDarkMode ? "bg-red-800/50" : "bg-red-100"
              : isDarkMode ? "bg-gray-700" : "bg-gray-100"
          )}>
            {isConfirmed ? (
              <AlertTriangle 
                size={20} 
                className={isDarkMode ? "text-red-400" : "text-red-600"} 
              />
            ) : (
              <Trash2 
                size={20} 
                className={isDarkMode ? "text-gray-400" : "text-gray-500"} 
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {!isConfirmed ? (
              // ──── Step 1: Initial Confirmation ────
              <>
                <h4 className={cn(
                  "text-sm font-semibold mb-1",
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                )}>
                  Delete Task
                </h4>
                <p className={cn(
                  "text-xs mb-3",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Are you sure you want to delete{" "}
                  <span className={cn(
                    "font-semibold",
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  )}>
                    "{taskTitle}"
                  </span>
                  ? This action cannot be undone.
                </p>

                {/* Warning info */}
                <div className={cn(
                  "flex items-start gap-2 p-2.5 rounded-lg text-xs mb-4",
                  isDarkMode 
                    ? "bg-yellow-900/20 text-yellow-300 border border-yellow-800/50" 
                    : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                )}>
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    All sub-tasks, attachments, and related data will also be permanently deleted.
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleFirstConfirm}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                      "bg-red-500 hover:bg-red-600 text-white",
                      "shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                    )}
                  >
                    <Trash2 size={12} />
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className={cn(
                      "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                      "border",
                      isDarkMode
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              // ──── Step 2: Final Confirmation ────
              <>
                <h4 className={cn(
                  "text-sm font-semibold mb-1",
                  isDarkMode ? "text-red-300" : "text-red-700"
                )}>
                  Final Confirmation
                </h4>
                <p className={cn(
                  "text-xs mb-4",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  This is your last chance. The task{" "}
                  <span className="font-semibold text-red-500">"{taskTitle}"</span>{" "}
                  will be permanently deleted.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                      "bg-red-600 hover:bg-red-700 text-white",
                      "shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95",
                      "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    )}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 size={12} />
                        Delete Forever
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isDeleting}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all",
                      "border",
                      isDarkMode
                        ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                        : "border-gray-300 text-gray-600 hover:bg-gray-50",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <X size={12} />
                    Go Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};