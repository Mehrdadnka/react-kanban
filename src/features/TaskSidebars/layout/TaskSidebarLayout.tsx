// src/features/TaskSidebars/layout/TaskSidebarLayout.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { Stepper, StepConfig } from '@/components/sidebar-ui-engine/Stepper';
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { BreadcrumbItem } from '@/types/sidebar.types';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { StepId, STEPS } from '@/stores/sidebar-engine/task-sidebar.store';
import { STEP_ICONS } from '../utils';

interface TaskSidebarLayoutProps {
  isOpen: boolean;
  zIndex?: number;
  onClose: () => void;
  panelId?: string;
  title: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  // --- Stepper Props ---
  activeStep: StepId;
  completedSteps: StepId[];
  steps: StepConfig[];
  onStepClick?: (stepId: StepId) => void;
}

export const TaskSidebarLayout: React.FC<TaskSidebarLayoutProps> = ({
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
  const position = usePanelPosition(panelId);
  const stepConfig = STEPS.map(step => ({ ...step, icon: STEP_ICONS[step.id] }));
  
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
        <div className="flex-1 flex flex-col min-h-0 h-full min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarShell>
  );
};
TaskSidebarLayout.displayName = 'TaskSidebarLayout';