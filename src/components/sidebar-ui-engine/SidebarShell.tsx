import React, { useEffect, useState, memo } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { BreadcrumbItem } from '@/types/sidebar.types';
import { Breadcrumb } from '@/components/ui/breadcrumb/Breadcrumb';

interface SidebarShellProps {
  // Required
  isOpen: boolean;
  zIndex?: number;
  onClose: () => void;
  
  // Header
  title: string;
  icon?: React.ReactNode;
  
  // Breadcrumbs
  breadcrumbs?: BreadcrumbItem[];
  
  // Content
  children: React.ReactNode;
  
  // Optional customization
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
  title,
  icon,
  breadcrumbs,
  children,
  maxWidth = 'lg',
}) => {
  const { isDarkMode } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

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
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ESC key handler
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

  if (!shouldRender) return null;

  return (
    <div
      style={{ zIndex }}
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
        <button
          onClick={onClose}
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isDarkMode
              ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
          )}
        >
          <X size={20} />
        </button>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} isDarkMode={isDarkMode} />
      )}

      {/* Content */}
      <div className="overflow-y-auto h-[calc(100vh-130px)] p-6">
        {children}
      </div>
    </div>
  );
});

SidebarShell.displayName = 'SidebarShell';