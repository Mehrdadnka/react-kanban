import React, { useEffect, useState, memo, useCallback } from 'react';
import { X, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { BreadcrumbItem } from '@/types/sidebar.types';
import { Breadcrumb } from '@/components/ui/breadcrumb/Breadcrumb';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { IconButton } from '@radix-ui/themes';
import { PanelPosition } from '@/stores/sidebar-engine/sidebar-engine.types';
import { PanelActions } from '@/components/sidebar-ui-engine/PanelActions';

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
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  position?: PanelPosition;
  isDarkMode?: boolean
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'lg:max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full w-[96vw] left-1/2 -translate-x-1/2',
};

const positionClasses: Record<PanelPosition, string> = {
  left: 'left-0 lg:ml-16 ml-0 ',
  right: 'right-0',
  overlay: 'left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 h-auto max-h-[80vh] rounded-xl',
};

const positionAnimation: Record<PanelPosition, { open: string; closed: string }> = {
  left: {
    open: 'translate-x-0',
    closed: '-translate-x-[200vw]',
  },
  right: {
    open: 'translate-x-0',
    closed: 'translate-x-[200vw]', 
  },
  overlay: {
    open: 'opacity-100 scale-100',
    closed: 'opacity-0 scale-95',
  },
};

export const SidebarShell: React.FC<SidebarShellProps> = memo(({
  isOpen,
  zIndex = 40,
  onClose,
  panelId,
  showMinimize = true,
  title,
  icon,
  breadcrumbs,
  children,
  maxWidth = 'lg',
  position = 'overlay',
  isDarkMode
}) => {
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

  const anim = positionAnimation[position];
  const isOverlay = position === 'overlay';

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-full w-full',
        isOverlay && 'h-auto max-h-[80vh]',
        maxWidthClasses[maxWidth],
        'shadow-2xl border-l',
        'transform transition-transform duration-300 ease-in-out',
        isDarkMode
          ? 'bg-gray-900 border-gray-800 text-gray-100'
          : 'bg-white border-gray-200 text-gray-900',
        positionClasses[position],
        isAnimating ? anim.open : anim.closed,
        isOverlay && 'rounded-xl border',
        isOverlay && isDarkMode ? 'border-gray-800' : '',
        isOverlay && !isDarkMode ? 'border-gray-200' : '',
      )}
      style={{ pointerEvents: isAnimating ? 'auto' : 'none', zIndex }}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        isDarkMode ? "border-gray-800" : "border-gray-200",
        isOverlay && "rounded-t-xl"
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
          <PanelActions
            onClose={onClose}
            onMinimize={showMinimize && panelId ? handleMinimize : undefined}
            isDarkMode={isDarkMode}
          />
      </div>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} isDarkMode={isDarkMode} />
      )}

      <div className="overflow-y-auto h-[calc(100vh-10vh)] p-6">
        {children}
      </div>
    </div>
  );
});

SidebarShell.displayName = 'SidebarShell';