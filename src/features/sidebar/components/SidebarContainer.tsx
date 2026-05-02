import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useSidebar } from './SidebarProvider';
import { HamburgerMenu } from './HamburgerMenu';
import * as Dialog from '@radix-ui/react-dialog';
import { CollapseIcon } from './CollapseIcon';

interface SidebarContainerProps {
  children: (variant: 'icon-only' | 'full') => React.ReactNode;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({ children }) => {
  const { isDarkMode } = useApp();
  const { isMobileOpen, setMobileOpen, isMobile } = useSidebar();

  // Desktop: icon-only, mobile drawer: full
  const sidebarContent = (variant: 'icon-only' | 'full') => (
    <aside
      className={cn(
        'flex flex-col border-r shadow-xl h-full pt-8 lg:pt-2',
        variant === 'full' ? 'w-64' : 'w-16',
        isDarkMode
          ? 'bg-gray-900/95 border-gray-800 text-gray-300'
          : 'bg-white/95 border-gray-200 text-gray-700'
      )}
    >
      {children(variant)}
    </aside>
  );

  // Desktop
  if (!isMobile) {
    return (
      <div className="fixed left-0 top-0 h-screen w-16 z-50">
        {sidebarContent('icon-only')}
      </div>
    );
  }

  // Mobile
  return (
    <>
      <HamburgerMenu />
      <Dialog.Root open={isMobileOpen} onOpenChange={setMobileOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[60]" />
          <Dialog.Content
            className={cn(
              'fixed top-0 left-0 h-full z-[70]',
              'data-[state=open]:animate-in data-[state=open]:slide-in-from-left',
              'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left',
              'duration-300'
            )}
          >
            <Dialog.Close asChild>
              <button
                className={cn(
                  'absolute top-4 right-4 p-1.5 rounded-lg z-10',
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                <CollapseIcon size={20} />
              </button>
            </Dialog.Close>
            {sidebarContent('full')}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};