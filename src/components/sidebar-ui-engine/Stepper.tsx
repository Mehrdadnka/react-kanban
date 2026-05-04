// src/components/sidebar-ui-engine/Stepper.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { StepId } from '@/stores/sidebar-engine/task-sidebar.store';

export interface StepConfig {
  id: StepId;
  label: string;
}

interface StepperProps {
  steps: StepConfig[];
  activeStep: StepId;
  completedSteps: StepId[];
  onStepClick?: (stepId: StepId) => void;
  orientation?: 'vertical';
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  completedSteps,
  onStepClick,
  orientation = 'vertical',
  className,
}) => {
  const { isDarkMode } = useApp();

  const styles = {
    // Completed
    completedBorder: 'border-emerald-400',
    completedBg: isDarkMode ? 'bg-emerald-400/10' : 'bg-emerald-500/10',
    completedText: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
    completedHoverBg: isDarkMode ? 'hover:bg-emerald-400/20' : 'hover:bg-emerald-500/20',
    completedConnector: 'bg-emerald-400/40',
    
    // Active
    activeBorder: isDarkMode ? 'border-gray-200' : 'border-gray-900',
    activeBg: isDarkMode ? 'bg-gray-200/10' : 'bg-gray-900/10',
    activeText: isDarkMode ? 'text-gray-200' : 'text-gray-900',
    activeRing: isDarkMode ? 'ring-gray-200/20' : 'ring-gray-900/20',
    
    // Inactive
    inactiveBorder: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    inactiveText: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    inactiveConnector: isDarkMode ? 'bg-gray-600/40' : 'bg-gray-300/40',
    
    // Labels
    labelCompleted: isDarkMode ? 'text-emerald-400' : 'text-emerald-600',
    labelCompletedHover: isDarkMode ? 'hover:text-emerald-300' : 'hover:text-emerald-700',
    labelActive: isDarkMode ? 'text-gray-200' : 'text-gray-900',
    labelActiveHover: isDarkMode ? 'hover:text-gray-300' : 'hover:text-gray-700',
    labelInactive: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    labelInactiveHover: isDarkMode ? 'hover:text-gray-400' : 'hover:text-gray-600',
  };

  return (
    <nav className={cn('flex flex-col', className)} aria-label="Progress">
      <ol className="flex flex-col gap-0">
        {steps.map((step, index) => {
          const isActive = step.id === activeStep;
          const isCompleted = completedSteps.includes(step.id);
          const isLast = index === steps.length - 1;
          const isClickable = isCompleted || isActive;

          return (
            <li key={step.id} className="relative">
              <div className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      'relative z-10 flex items-center justify-center',
                      'w-7 h-7 rounded-full border-2 transition-all duration-200',
                      'flex-shrink-0',
                      isCompleted && [
                        styles.completedBorder,
                        styles.completedBg,
                        styles.completedText,
                        isClickable && styles.completedHoverBg,
                      ],
                      isActive && !isCompleted && [
                        styles.activeBorder,
                        styles.activeBg,
                        styles.activeText,
                        'ring-2',
                        styles.activeRing,
                      ],
                      !isCompleted && !isActive && [
                        styles.inactiveBorder,
                        styles.inactiveText,
                      ],
                      isClickable && 'cursor-pointer',
                      !isClickable && 'cursor-not-allowed opacity-40',
                    )}
                  >
                    {isCompleted ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <span className="text-[11px] font-medium tabular-nums">
                        {index + 1}
                      </span>
                    )}
                  </button>

                  {/* Connector line */}
                  {!isLast && (
                    <div
                      className={cn(
                        'w-px flex-1 min-h-[2rem]',
                        isCompleted ? styles.completedConnector : styles.inactiveConnector,
                      )}
                    />
                  )}
                </div>

                {/* Step label */}
                <div className="pb-6 pt-1">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      'text-sm font-medium transition-colors duration-200',
                      'text-left hidden sm:block',
                      isCompleted && [
                        styles.labelCompleted,
                        isClickable && styles.labelCompletedHover,
                      ],
                      isActive && !isCompleted && [
                        styles.labelActive,
                        isClickable && styles.labelActiveHover,
                      ],
                      !isActive && !isCompleted && [
                        styles.labelInactive,
                        isClickable && styles.labelInactiveHover,
                      ],
                      isClickable && 'cursor-pointer',
                      !isClickable && 'cursor-not-allowed',
                    )}
                  >
                    {step.label}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

Stepper.displayName = 'Stepper';