import React, { useEffect, useState, memo, useCallback } from 'react';
import { X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { BreadcrumbItem } from '@/types/sidebar.types';
import { Breadcrumb } from '@/components/ui/breadcrumb/Breadcrumb';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { IconButton } from '@radix-ui/themes';

interface SidebarShellProps {
  isOpen: boolean;
  zIndex?: number;
  onClose: () => void;
  panelId?: string;
  showMinimize?: boolean;
  title: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const SidebarShell: React.FC<SidebarShellProps> = memo(({
  isOpen,
  zIndex = 50,
  onClose,
  panelId,
  showMinimize = true,
  title,
  icon,
  breadcrumbs,
  children,
  maxWidth = 'lg',
}) => {
  const { isDarkMode } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const isMinimized = useSidebarEngineStore(
    state => panelId ? state.panels[panelId]?.isMinimized : false
  );

  const handleMinimize = useCallback(() => {
    if (panelId) {
      useSidebarEngineStore.getState().minimize(panelId);
    }
  }, [panelId]);

  React.useEffect(() => {
    return () => {
      // cleanup when component unmounts
    };
  }, []);

  // Animation lifecycle
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      if (!isMinimized) {
        const timer = setTimeout(() => {
          setShouldRender(false);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!shouldRender && !isMinimized) return null;

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full w-full',
        maxWidthClasses[maxWidth],
        'shadow-2xl border-l',
        'transform transition-transform duration-300 ease-in-out',
        isDarkMode
          ? 'bg-gray-900 border-gray-800 text-gray-100'
          : 'bg-white border-gray-200 text-gray-900',
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      )}
      style={{ pointerEvents: isAnimating ? 'auto' : 'none', zIndex }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-3">
          {icon && (
            <div className={cn(
              'p-2 rounded-lg',
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            )}>
              {icon}
            </div>
          )}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        
        <div className="flex items-center gap-1">
          {showMinimize && panelId && (
            <IconButton
              variant='ghost'
              size='2'
              onClick={handleMinimize}
              title="Minimize panel"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isDarkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              )}
            >
              <Minus size={20} />
            </IconButton>
          )}
          
          <IconButton
            variant='ghost'
            size='2'
            onClick={onClose}
            title="Close panel"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isDarkMode
                ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
            )}
          >
            <X size={20} />
          </IconButton>
        </div>
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} isDarkMode={isDarkMode} />
      )}

      <div className="overflow-y-auto h-[calc(100vh-130px)] p-6">
        {children}
      </div>
    </div>
  );
});

SidebarShell.displayName = 'SidebarShell';