import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'destructive' | 'outline' | 'ghost';
  type?: 'button' | 'submit';
  className?: string;
}

interface SidebarActionBarProps {
  children?: React.ReactNode;
  className?: string;
}

export const SidebarActionBar: React.FC<SidebarActionBarProps> = ({ children, className }) => {
  const { isDarkMode } = useApp();
  
  return (
    <div className={cn(
      "flex justify-between items-center pt-4 border-t",
      isDarkMode ? "border-gray-800" : "border-gray-200",
      className
    )}>
      {children}
    </div>
  );
};

export const SidebarActionLeft: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-2">{children}</div>
);

export const SidebarActionRight: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex gap-2 ml-auto">{children}</div>
);