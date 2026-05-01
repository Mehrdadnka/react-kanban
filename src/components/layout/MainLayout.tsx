import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SidebarRegistry } from './SidebarRegistry';
import { useSearchSidebarStore } from '@/stores/sidebar-engine/search-sidebar.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { openSearch } = useSearchSidebarStore();

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // چک کردن Ctrl+K (Windows/Linux) یا ⌘K (Mac)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); // ✅ اول preventDefault
        
        // باز کردن search sidebar
        openSearch();
      }
      
      // Escape برای بستن
      if (e.key === 'Escape') {
        const engine = useSidebarEngineStore.getState();
        const topPanel = engine.stack[engine.stack.length - 1];
        
        // فقط اگه search-sidebar باز باشه، ببندش
        if (topPanel === 'search-sidebar') {
          e.preventDefault();
          engine.close('search-sidebar');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch]); // openSearch dependency رو یادت نره

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ml-16">
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