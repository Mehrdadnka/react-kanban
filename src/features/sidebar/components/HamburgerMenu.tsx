import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from './SidebarProvider';
import { useApp } from '@/providers/AppProvider';

export const HamburgerMenu: React.FC = () => {
  const { toggleMobile } = useSidebar();
  const { isDarkMode } = useApp();

  return (
    <button
      onClick={toggleMobile}
      className={cn(
        'fixed top-4 left-4 z-50 p-2 rounded-lg',
        'md:hidden',
        isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white shadow-md text-gray-700'
      )}
    >
      <Menu size={20} />
    </button>
  );
};