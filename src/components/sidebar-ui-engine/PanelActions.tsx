import React from 'react';
import { cn } from '@/lib/utils';
import { MinimizeButton } from './MinimizeButton';
import { CloseButton } from './CloseButton';
import { CollapseButton } from './CollapseButton';

interface PanelActionsProps {
  onClose: () => void;
  onMinimize?: () => void;
  isDarkMode?: boolean;
  className?: string;
}

export const PanelActions: React.FC<PanelActionsProps> = ({
  onClose,
  onMinimize,
  isDarkMode,
  className,
}) => {
  return (
    <>
      {/* Desktop: separate buttons */}
      <div className={cn('hidden md:flex items-center gap-1', className)}>
        {onMinimize && (
          <MinimizeButton onClick={onMinimize} isDarkMode={isDarkMode}  />
        )}
        <CloseButton onClick={onClose} isDarkMode={isDarkMode} />
      </div>

      {/* Mobile: unified pill button like sidebar hamburger */}
      <div className="md:hidden">
        <div
          aria-label="Minimize panel"
          className={cn(
            'p-1 flex flex-row gap-2 items-center rounded-md transition-colors',
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
              : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
          )}
        >
          {onMinimize && (
            <>
              <CollapseButton onClick={onMinimize} isDarkMode={isDarkMode} />
              <div 
                className={cn(
                'w-px h-5',
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                )} 
              />
            </>
          )}
          <CloseButton onClick={onClose} isDarkMode={isDarkMode} />
        </div>
      </div>
    </>
  );
};