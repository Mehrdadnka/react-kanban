import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SidebarRegistry } from './SidebarRegistry';
import { useSearchSidebarStore } from '@/stores/sidebar-engine/search-sidebar.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  isHomePage: boolean
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ isHomePage, children }) => {
  const { openSearch } = useSearchSidebarStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      
      if (e.key === 'Escape') {
        const engine = useSidebarEngineStore.getState();
        const topPanel = engine.stack[engine.stack.length - 1];
        
        if (topPanel === 'search-sidebar') {
          e.preventDefault();
          engine.close('search-sidebar');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]); // openSearch dependency 

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className={cn(
          'flex-1 pt-10 lg:pt-0 overflow-y-auto  ml-0 lg:ml-16',
          isHomePage 
            ?  
              'dark:bg-gray-900/10 bg-gray-900/10' 
            : 'bg-gray-50 dark:bg-gray-900'
        )}>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
      <SidebarRegistry />
    </ThemeProvider>
  );
};

export default MainLayout;