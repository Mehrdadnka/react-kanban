import React from 'react';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/providers/ThemeProvider';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {

  return (
    // Theme
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        {/* App Sidebar */}
        <Sidebar />
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 ml-16">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default MainLayout;