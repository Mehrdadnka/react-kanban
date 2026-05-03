// ──── src/components/sidebar-ui-engine/Stepper.tsx ────

import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

export interface StepConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface StepperProps {
  steps: StepConfig[];
  activeStep: string;
  completedSteps: string[];
  onStepClick?: (stepId: string) => void;
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

  return (
    <div className={cn('flex border-r w-fit h-full flex-col', className)}>
      {steps.map((step, index) => {
        const isActive = step.id === activeStep;
        const isCompleted = completedSteps.includes(step.id);
        const isLast = index === steps.length - 1;
        const isClickable = isCompleted || isActive;

        return (
          <div key={step.id} className="flex items-start gap-3 h-full w-fit p-0 lg:pr-2">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 flex-shrink-0',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  isActive && !isCompleted && 'bg-blue-500 border-blue-500 text-white',
                  !isCompleted && !isActive && 'border-gray-300 dark:border-gray-600 text-gray-400',
                  isClickable && 'cursor-pointer hover:scale-110',
                  !isClickable && 'cursor-not-allowed opacity-50'
                )}
              >
                {isCompleted ? (
                  <Check size={14} strokeWidth={3} />
                ) : step.icon ? (
                  step.icon
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </button>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-32',
                    isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              )}
            </div>
            <div className="pb-4 pt-1.5">
              <p
                className={cn(
                  'text-xs font-medium hidden lg:flex transition-colors cursor-pointer',
                  isActive && 'text-blue-600 dark:text-blue-400',
                  isCompleted && 'text-green-600 dark:text-green-400',
                  !isActive && !isCompleted && 'text-gray-400 dark:text-gray-500',
                  isClickable && 'hover:underline'
                )}
                onClick={() => isClickable && onStepClick?.(step.id)}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

Stepper.displayName = 'Stepper';