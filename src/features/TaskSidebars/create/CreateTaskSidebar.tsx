import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { 
  Save, ArrowLeft, ArrowRight, AlertCircle, 
  Loader2, Sparkles, 
  Plus
} from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { TaskSidebarLayout } from '../layout/TaskSidebarLayout';
import { useCreateTaskFormRHF } from './hooks/useCreateTaskFormRHF';
import { BasicInfoStepRHF } from './steps/BasicInfoStepRHF';
import { DetailsStepRHF } from './steps/DetailsStepRHF';
import { ScheduleStepRHF } from './steps/ScheduleStepRHF';
import { MetaStepRHF } from './steps/MetaStepRHF';
import { StepId, STEPS } from '@/stores/sidebar-engine/task-sidebar.store';
import { STEP_ICONS } from '@/features/TaskSidebars/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const CreateTaskSidebar: React.FC<PanelProps> = memo(({
  zIndex, 
  onClose, 
  isOpen: panelIsOpen, 
  panelId, 
  isDarkMode 
}) => {
  // ──── Step State Machine ────
  const [activeStep, setActiveStep] = useState<StepId>('quick-create');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);

  const {
    form,
    errors,
    isSubmitting,
    isValid,
    validateStep,
    getStepErrors,
    submitForm,
    fileInputRef,
    handleAttachmentClick,
    handleFileSelect,
    handleAttachmentDrop,
    handleAttachmentRemove,
    reset,
  } = useCreateTaskFormRHF(() => {
    onClose?.();
  });

  // ──── Derived State ────
  const isFirstStep = activeStep === 'quick-create';
  const isLastStep = activeStep === 'meta';
  const currentStepIndex = STEPS.findIndex(s => s.id === activeStep);
  const totalSteps = STEPS.length;
  
  // Get errors for current step
  const stepErrors = getStepErrors(activeStep);
  const hasCurrentStepErrors = stepErrors !== null;
  const firstError = stepErrors ? Object.values(stepErrors)[0]?.message : null;

  // Can only navigate to completed steps or current
  const canNavigateToStep = useCallback((stepId: StepId) => {
    return completedSteps.includes(stepId) || stepId === activeStep;
  }, [completedSteps, activeStep]);

  // ──── Effects ────
  useEffect(() => {
    if (!panelIsOpen) {
      reset();
      setActiveStep('quick-create');
      setCompletedSteps([]);
    }
  }, [panelIsOpen, reset]);

  // ──── Navigation Handlers ────
  const handleClose = useCallback(() => {
    reset();
    setActiveStep('quick-create');
    setCompletedSteps([]);
    onClose?.();
  }, [reset, onClose]);

  const handleStepClick = useCallback((stepId: StepId) => {
    if (canNavigateToStep(stepId)) {
      setActiveStep(stepId);
    }
  }, [canNavigateToStep]);
  
  const handleNext = useCallback(async () => {
    const stepErrorFields: Record<StepId, Array<{ field: string; label: string }>> = {
      'quick-create': [
        { field: 'title', label: 'Title' },
        { field: 'shortDescription', label: 'Short Description' },
      ],
      'full-details': [],
      'schedule': [],
      'meta': [],
    };
  
    const stepFields = stepErrorFields[activeStep] || [];
    const fieldNames = stepFields.map(f => f.field);
  
    if (fieldNames.length === 0) {
      if (currentStepIndex < totalSteps - 1) {
        setCompletedSteps(prev => 
          prev.includes(activeStep) ? prev : [...prev, activeStep]
        );
        setActiveStep(STEPS[currentStepIndex + 1].id);
      }
      return;
    }
  
    const isValid = await form.trigger(fieldNames as any);
  
    if (!isValid) {
      const allErrors = form.formState.errors;
    
      const firstErrorField = stepFields.find(
        ({ field }) => !!allErrors[field as keyof typeof allErrors]
      );
    
      if (firstErrorField) {
        const errorMessage = allErrors[firstErrorField.field as keyof typeof allErrors]?.message;
      
        if (errorMessage) {
          toast.error(`${firstErrorField.label} is required`, {
            description: `Please fill in the ${firstErrorField.label.toLowerCase()} field in the ${STEPS[currentStepIndex].label} step`,
            duration: 3500,
            icon: <AlertCircle size={18} />,
          });
        }
      }
      return;
    }

    if (currentStepIndex < totalSteps - 1) {
      setCompletedSteps(prev => 
        prev.includes(activeStep) ? prev : [...prev, activeStep]
      );
      setActiveStep(STEPS[currentStepIndex + 1].id);
    }
  }, [activeStep, currentStepIndex, totalSteps, form, STEPS]);
  
  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setActiveStep(STEPS[currentStepIndex - 1].id);
    }
  }, [currentStepIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!panelIsOpen) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && isLastStep) {
        e.preventDefault();
        submitForm();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight' && !isLastStep) {
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
  }, [panelIsOpen, isLastStep, isFirstStep, submitForm, handleNext, handleBack]);

  // ──── Step Configuration ────
  const stepConfig = STEPS.map(step => ({
    ...step,
    icon: STEP_ICONS[step.id],
  }));

  // ──── Render ────
  return (
    <FormProvider {...form}>
      <TaskSidebarLayout
        isOpen={panelIsOpen}
        zIndex={zIndex}
        onClose={handleClose}
        panelId={panelId}
        title="Create New Task"
        icon={<Plus size={20} />}
        activeStep={activeStep}
        completedSteps={completedSteps}
        steps={stepConfig}
        onStepClick={handleStepClick}
      >
        <div className="flex flex-col h-full max-h-full min-h-0 w-full overflow-hidden">
          {/* Step Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-full pr-1">
              {activeStep === 'quick-create' && (
                <BasicInfoStepRHF isDarkMode={isDarkMode} />
              )}
              {activeStep === 'full-details' && (
                <DetailsStepRHF isDarkMode={isDarkMode} />
              )}
              {activeStep === 'schedule' && (
                <ScheduleStepRHF isDarkMode={isDarkMode} />
              )}
              {activeStep === 'meta' && (
                <MetaStepRHF 
                  isDarkMode={isDarkMode}
                  fileInputRef={fileInputRef}
                  onAttachmentClick={handleAttachmentClick}
                  onFileSelect={handleFileSelect}
                  onAttachmentDrop={handleAttachmentDrop}
                  onAttachmentRemove={handleAttachmentRemove}
                />
              )}
            </div>
          </div>
          {/* Footer Navigation */}
          <div className={cn(
            "flex-shrink-0 pt-3 mt-3 border-t",
            isDarkMode ? "border-gray-800" : "border-gray-200"
          )}>
            {/* (Same footer JSX as before) */}
            <div className="flex items-center justify-between gap-2">
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

              <span className={cn(
                "text-xs sm:hidden",
                isDarkMode ? "text-gray-500" : "text-gray-400"
              )}>
                {currentStepIndex + 1}/{totalSteps}
              </span>

              {!isLastStep ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    "border",
                    isDarkMode 
                      ? "border-gray-700 text-gray-300 hover:bg-gray-800" 
                      : "border-gray-300 text-gray-700 hover:bg-gray-50",
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
    </FormProvider>
  );
});

CreateTaskSidebar.displayName = 'CreateTaskSidebar';