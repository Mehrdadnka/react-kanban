import React from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SidebarRegistry } from './SidebarRegistry';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
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