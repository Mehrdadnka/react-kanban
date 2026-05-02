import { WIDGET_ICONS } from '@/config/panel-icons.config';
import { DashboardWidgetType } from '@/stores/dashboard-sidebar.store';
import { BreadcrumbItem } from '@/types/sidebar.types';

export const widgetConfig: Record<DashboardWidgetType, {
  title: string;
  icon: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
}> = Object.entries(WIDGET_ICONS).reduce((acc, [key, config]) => {
  if (key in WIDGET_ICONS) {
    const Icon = config.icon;
    acc[key as DashboardWidgetType] = {
      title: config.label,
      icon: <Icon size={20} />,
      breadcrumbs: [
        { label: 'Dashboard' },
        { label: config.label },
      ],
    };
  }
  return acc;
}, {} as Record<string, any>);
