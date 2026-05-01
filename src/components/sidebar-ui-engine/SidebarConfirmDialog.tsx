// src/components/sidebar-ui-engine/SidebarConfirmDialog.tsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SidebarConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
  variant?: 'destructive' | 'warning';
}

export const SidebarConfirmDialog: React.FC<SidebarConfirmDialogProps> = ({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  icon,
  variant = 'destructive',
}) => {
  const { isDarkMode } = useApp();
  
  const styles = {
    destructive: {
      wrapper: isDarkMode ? 'bg-red-900/20 border-red-800/50 text-red-300' : 'bg-red-50 border-red-200 text-red-700',
      button: 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700',
    },
    warning: {
      wrapper: isDarkMode ? 'bg-yellow-900/20 border-yellow-800/50 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-600 hover:border-yellow-700',
    },
  };

  const currentStyle = styles[variant];

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className={cn("p-4 rounded-lg border-2 mb-4", currentStyle.wrapper)}>
        <div className="flex items-start gap-3">
          {icon || <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />}
          <div>
            <p className="font-semibold text-sm mb-1">{title}</p>
            <p className="text-xs opacity-80">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 w-full">
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          className={cn("flex items-center gap-2 flex-1", currentStyle.button)}
        >
          {confirmLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex items-center gap-2 flex-1"
        >
          {cancelLabel}
        </Button>
      </div>
    </div>
  );
};