import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const BASENAME = '/react-kanban';
  const [currentPath, setCurrentPath] = useState(() => normalizePath(window.location.pathname, BASENAME));
  
  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', `${BASENAME}${path}`);
    setCurrentPath(path);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname, BASENAME));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    useSidebarEngineStore.getState().closeAllExcept('search-sidebar');
  }, [currentPath]);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

function normalizePath(pathname: string, base: string): string {
  if (pathname.startsWith(base)) {
    return pathname.slice(base.length) || '/';
  }
  return pathname; // fallback, in case running without base
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
