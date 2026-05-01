import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface MetaItem {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

interface SidebarMetaInfoProps {
  items: MetaItem[];
}

export const SidebarMetaInfo: React.FC<SidebarMetaInfoProps> = ({ items }) => {
  const { isDarkMode } = useApp();

  return (
    <div className={cn("space-y-3 pt-4 border-t", isDarkMode ? "border-gray-800" : "border-gray-200")}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-sm">
          <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            {item.label}
          </span>
          <span className="flex items-center gap-2">
            {item.icon}
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};