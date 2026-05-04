// src/features/TaskSidebars/create/CreateTaskSidebar.tsx

import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { 
  Save, ArrowLeft, ArrowRight, AlertCircle, 
  Loader2, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { TaskSidebarLayout } from '../layout/TaskSidebarLayout';
import { useCreateTaskForm } from './hooks/useCreateTaskForm';
import { BasicInfoStep } from './steps/BasicInfoStep';
import { DetailsStep } from './steps/DetailsStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { MetaStep } from './steps/MetaStep';
import { StepId, STEPS } from '@/stores/sidebar-engine/task-sidebar.store';
import { STEP_ICONS } from '@/features/TaskSidebars/utils';
import { cn } from '@/lib/utils';

export const CreateTaskSidebar: React.FC<PanelProps> = memo(({
  zIndex, 
  onClose, 
  isOpen: panelIsOpen, 
  panelId, 
  isDarkMode 
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ──── Step State Machine ────
  const [activeStep, setActiveStep] = useState<StepId>('quick-create');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);

  const {
    formState,
    updateFormField,
    submitForm,
    resetForm,
    isValid,
    isStepValid,
    stepErrors,
    isSubmitting,
    fileInputRef,
    handleAttachmentClick,
    handleFileSelect,
    handleAttachmentDrop,
    handleAttachmentRemove,
  } = useCreateTaskForm(() => {
    onClose?.();
  });

  // ──── Derived State ────
  const isFirstStep = activeStep === 'quick-create';
  const isLastStep = activeStep === 'meta';
  const currentStepValid = isStepValid(activeStep);
  const currentStepError = stepErrors[activeStep];
  const currentStepIndex = STEPS.findIndex(s => s.id === activeStep);
  const totalSteps = STEPS.length;

  // Can only navigate to completed steps or current
  const canNavigateToStep = useCallback((stepId: StepId) => {
    return completedSteps.includes(stepId) || stepId === activeStep;
  }, [completedSteps, activeStep]);

  // ──── Effects ────
  useEffect(() => {
    if (panelIsOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [panelIsOpen]);

  useEffect(() => {
    if (!panelIsOpen) {
      resetForm();
      setActiveStep('quick-create');
      setCompletedSteps([]);
    }
  }, [panelIsOpen, resetForm]);

  // ──── Navigation Handlers ────
  const handleClose = useCallback(() => {
    resetForm();
    setActiveStep('quick-create');
    setCompletedSteps([]);
    onClose?.();
  }, [resetForm, onClose]);

  const handleStepClick = useCallback((stepId: StepId) => {
    if (canNavigateToStep(stepId)) {
      setActiveStep(stepId);
    }
  }, [canNavigateToStep]);

  const handleNext = useCallback(() => {
    if (!currentStepValid || isSubmitting) return;

    if (currentStepIndex < totalSteps - 1) {
      setCompletedSteps(prev => 
        prev.includes(activeStep) ? prev : [...prev, activeStep]
      );
      setActiveStep(STEPS[currentStepIndex + 1].id);
    }
  }, [activeStep, currentStepIndex, totalSteps, currentStepValid, isSubmitting]);

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setActiveStep(STEPS[currentStepIndex - 1].id);
    }
  }, [currentStepIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!panelIsOpen) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isLastStep && currentStepValid) {
        e.preventDefault();
        submitForm();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight' && !isLastStep && currentStepValid) {
        e.preventDefault();
        handleNext();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft' && !isFirstStep) {
        e.preventDefault();
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelIsOpen, isLastStep, isFirstStep, currentStepValid, submitForm, handleNext, handleBack]);

  // ──── Step Configuration ────
  const stepConfig = STEPS.map(step => ({
    ...step,
    icon: STEP_ICONS[step.id],
  }));

  // ──── Render ────
  return (
    <TaskSidebarLayout
      isOpen={panelIsOpen}
      zIndex={zIndex}
      onClose={handleClose}
      panelId={panelId}
      title="Create New Task"
      icon={<Sparkles size={20} className="text-blue-500" />}
      activeStep={activeStep}
      completedSteps={completedSteps}
      steps={stepConfig}
      onStepClick={handleStepClick}
    >
      {/* Main container - column layout that fills available space */}
      <div className="flex flex-col h-full max-h-full min-h-0 w-full overflow-hidden">
        
        {/* Step Content - takes all available space, scrolls if needed */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="w-full max-w-full pr-1">
            {/* Quick Create Step */}
            {activeStep === 'quick-create' && (
              <BasicInfoStep
                isViewMode={false}
                inputRef={inputRef}
                formState={{
                  title: formState.title,
                  shortDescription: formState.shortDescription,
                  type: formState.type,
                  priority: formState.priority,
                  columnId: formState.columnId,
                  labels: formState.labels,
                  milestoneIds: formState.milestoneIds,
                  projectIds: formState.projectIds,
                }}
                updateFormField={updateFormField as any}
              />
            )}

            {/* Full Details Step */}
            {activeStep === 'full-details' && (
              <DetailsStep
                value={formState.description}
                onChange={(v) => updateFormField('description', v)}
                disabled={false}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Schedule Step */}
            {activeStep === 'schedule' && (
              <ScheduleStep
                startDate={formState.startDate}
                dueDate={formState.dueDate}
                reminderDate={formState.reminderDate}
                onStartDateChange={(d) => updateFormField('startDate', d)}
                onDueDateChange={(d) => updateFormField('dueDate', d)}
                onReminderDateChange={(d) => updateFormField('reminderDate', d)}
                disabled={false}
                isDarkMode={isDarkMode}
              />
            )}

            {/* Meta Step */}
            {activeStep === 'meta' && (
              <MetaStep
                attachments={formState.attachments as any}
                estimatedHours={formState.estimatedHours}
                isViewMode={false}
                isDarkMode={isDarkMode}
                fileInputRef={fileInputRef}
                onAttachmentClick={handleAttachmentClick}
                onFileSelect={handleFileSelect}
                onAttachmentDrop={handleAttachmentDrop}
                onAttachmentRemove={handleAttachmentRemove}
                onEstimatedHoursChange={(v) => updateFormField('estimatedHours', v)}
              />
            )}
          </div>
        </div>

        {/* Error Message - collapses when empty */}
        {currentStepError && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 mx-1 mt-2 rounded-lg text-xs font-medium flex-shrink-0",
            isDarkMode
              ? "bg-red-900/30 text-red-300 border border-red-800/50"
              : "bg-red-50 text-red-600 border border-red-200"
          )}>
            <AlertCircle size={14} className="flex-shrink-0" />
            <span className="truncate">{currentStepError}</span>
          </div>
        )}

        {/* Footer Navigation - always at bottom */}
        <div className={cn(
          "flex-shrink-0 pt-3 mt-3 border-t",
          isDarkMode ? "border-gray-800" : "border-gray-200"
        )}>
          {/* Main button row */}
          <div className="flex items-center justify-between gap-2">
            {/* Cancel / Back */}
            <button
              type="button"
              onClick={isFirstStep ? handleClose : handleBack}
              disabled={isSubmitting}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                isDarkMode ? "text-gray-300" : "text-gray-600",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">
                {isFirstStep ? 'Cancel' : 'Back'}
              </span>
            </button>

            {/* Step Indicator (Mobile) */}
            <span className={cn(
              "text-xs sm:hidden",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              {currentStepIndex + 1}/{totalSteps}
            </span>

            {/* Next / Submit */}
            {!isLastStep ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!currentStepValid || isSubmitting}
                className={cn(
                  "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  "border",
                  isDarkMode 
                    ? "border-gray-700 text-gray-300 hover:bg-gray-800" 
                    : "border-gray-300 text-gray-700 hover:bg-gray-50",
                  currentStepValid 
                    ? "opacity-100 translate-x-0" 
                    : "opacity-0 pointer-events-none translate-x-4",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                <span className="hidden sm:inline">Next</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submitForm}
                disabled={!isValid || isSubmitting}
                className={cn(
                  "inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  "bg-green-600 hover:bg-green-700 text-white shadow-sm",
                  (!isValid || isSubmitting) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Create Task</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          {!isFirstStep && (
            <p className={cn(
              "text-[10px] text-center mt-1.5 opacity-50",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              {isLastStep 
                ? 'Ctrl+Enter to create' 
                : 'Ctrl+→ next · Ctrl+← back'
              }
            </p>
          )}
        </div>
      </div>
    </TaskSidebarLayout>
  );
});

CreateTaskSidebar.displayName = 'CreateTaskSidebar';