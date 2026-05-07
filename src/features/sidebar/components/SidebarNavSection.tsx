import React from 'react';
import { useRouter } from '@/router';
import { useApp } from '@/providers/AppProvider';
import { NAV_ICONS } from '@/config/panel-icons.config';
import { SidebarItem } from '@/features/sidebar/components/SidebarItem';
import { cn } from '@/lib/utils';

interface SidebarNavSectionProps {
  variant?: 'icon-only' | 'full';
}

export const SidebarNavSection: React.FC<SidebarNavSectionProps> = ({ variant = 'icon-only' }) => {
  const { navigate, currentPath } = useRouter();
  const { isDarkMode } = useApp();

  return (
    <nav className={cn(
      'flex flex-col gap-1 py-4',
      variant === 'full' ? 'px-3' : 'items-center'
    )}>
      {Object.entries(NAV_ICONS).map(([id, config]) => {
        const Icon = config.icon;
        const path = id === 'home' ? '/' : `/${id}`;
        const isActive = currentPath === path ||
          (path !== '/' && currentPath.startsWith(path));

        return (
          <SidebarItem
            key={id}
            id={id}
            icon={<Icon size={variant === 'full' ? 20 : 22} />}
            label={config.label}
            isDarkMode={isDarkMode}
            isActive={isActive}
            onClick={() => path && navigate(path)}
            variant={variant}
          />
        );
      })}
    </nav>
  );
};