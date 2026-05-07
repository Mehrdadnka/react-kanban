// features/SettingsSidebar/SettingsSidebar.tsx
import React from 'react';
import { Settings, Cog, Palette, Bell, Shield, User, Keyboard } from 'lucide-react';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { useSettingsSidebarStore } from '@/stores/settings-sidebar.store';
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { Tab, TabItem } from '@/components/ui/tab/Tab';
import { cn } from '@/lib/utils';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { usePanelIconComponent } from '@/hooks/usePanelIcon';

export const SettingsSidebar: React.FC<PanelProps> = ({ 
  isOpen, 
  onClose, 
  panelId, 
  isDarkMode 
}) => {
  const { closeSettings } = useSettingsSidebarStore();
  const position = usePanelPosition(panelId);
  const icon = usePanelIconComponent(panelId);

  const handleClose = () => {
    closeSettings();
    onClose();
  };

  const tabItems: TabItem[] = [
    {
      id: 'general',
      label: 'General',
      icon: <Cog size={16} />,
      content: (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Settings size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              General Settings
            </h3>
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              General application settings coming soon
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette size={16} />,
      content: (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Palette size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Appearance
            </h3>
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Theme and appearance settings coming soon
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell size={16} />,
      content: (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Notifications
            </h3>
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Notification preferences coming soon
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'shortcuts',
      label: 'Shortcuts',
      icon: <Keyboard size={16} />,
      content: (
        <div className="space-y-6">
          <div className="text-center py-12">
            <Keyboard size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className={cn(
              "text-lg font-semibold mb-2",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              Keyboard Shortcuts
            </h3>
            <p className={cn(
              "text-sm",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              Customize keyboard shortcuts coming soon
            </p>
          </div>
        </div>
      ),
    },
  ];

  const defaultTab = 'general';

  return (
    <SidebarShell
      isOpen={isOpen}
      position={position}
      onClose={handleClose}
      isDarkMode={isDarkMode}
      panelId={panelId}
      title="Settings"
      icon={<Settings size={20} />}
      breadcrumbs={[{ label: 'Settings' }]}
    >
      <Tab 
        items={tabItems} 
        defaultValue={defaultTab}
        isDarkMode={isDarkMode} 
        variant="underline" 
        size="sm"
      />
    </SidebarShell>
  );
};

SettingsSidebar.displayName = 'SettingsSidebar';