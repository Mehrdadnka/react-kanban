// features/BoardSidebars/create/layout/BoardSidebarLayout.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { BreadcrumbItem } from '@/types/sidebar.types';
import { BoardStepId, BOARD_STEPS } from '@/stores/sidebar-engine/board-sidebar.store';
import { FileText, Palette, Settings } from 'lucide-react';
import { StepConfig, Stepper } from '@/components/ui/stepper/Stepper';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';

interface BoardSidebarLayoutProps {
  isOpen: boolean;
  zIndex?: number;
  onClose: () => void;
  panelId?: string;
  title: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  activeStep: BoardStepId;
  completedSteps: BoardStepId[];
  steps: StepConfig[];
  onStepClick?: (stepId: BoardStepId) => void;
}

const BOARD_STEP_ICONS: Record<BoardStepId, React.ReactNode> = {
  'basic-info': <FileText size={14} />,
  'appearance': <Palette size={14} />,
  'settings': <Settings size={14} />,
};

export const BoardSidebarLayout: React.FC<BoardSidebarLayoutProps> = ({
  isOpen,
  zIndex,
  onClose,
  panelId,
  title,
  icon,
  breadcrumbs,
  children,
  activeStep,
  completedSteps,
  steps,
  onStepClick,
}) => {
  const { isDarkMode } = useApp();
  const stepConfig = BOARD_STEPS.map(step => ({ 
    ...step, 
    icon: BOARD_STEP_ICONS[step.id] 
  }));

  const position = usePanelPosition(panelId);
  
  return (
    <SidebarShell
      isOpen={isOpen}
      zIndex={zIndex}
      onClose={onClose}
      isDarkMode={isDarkMode}
      panelId={panelId}
      title={title}
      icon={icon}
      breadcrumbs={breadcrumbs}
      position={position} 
      maxWidth="full"
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full max-h-full min-h-0">
        {/* Stepper Sidebar */}
        <div className="flex-shrink-0 lg:w-40 lg:border-r border-gray-200 dark:border-gray-800 lg:pr-4">
          <Stepper
            steps={stepConfig}
            activeStep={activeStep}
            completedSteps={completedSteps}
            onStepClick={onStepClick}
            orientation="vertical"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 px-4 h-full min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarShell>
  );
};