// features/BoardSidebars/create/CreateBoardSidebar.tsx
import React, { useEffect, useState, memo, useCallback } from 'react';
import { 
  Save, ArrowLeft, ArrowRight, AlertCircle, 
  Loader2, Sparkles, Plus, Layout
} from 'lucide-react';
import { FormProvider } from 'react-hook-form';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { BoardSidebarLayout } from './layout/BoardSidebarLayout';
import { BasicInfoStepRHF } from './steps/BasicInfoStepRHF';
import { AppearanceStepRHF } from './steps/AppearanceStepRHF';
import { BoardStepId, BOARD_STEPS } from '@/stores/sidebar-engine/board-sidebar.store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const CreateBoardSidebar: React.FC<PanelProps> = memo(({
  zIndex, 
  onClose, 
  isOpen: panelIsOpen, 
  panelId, 
  isDarkMode 
}) => {
  // Step State Machine
  const [activeStep, setActiveStep] = useState<BoardStepId>('basic-info');
  const [completedSteps, setCompletedSteps] = useState<BoardStepId[]>([]);

  const {
    form,
    errors,
    isSubmitting,
    isValid,
    validateStep,
    getStepErrors,
    submitForm,
    reset,
  } = useCreateBoardFormRHF(() => {
    onClose?.();
  });

  // Derived State
  const isFirstStep = activeStep === 'basic-info';
  const isLastStep = activeStep === 'settings';
  const currentStepIndex = BOARD_STEPS.findIndex(s => s.id === activeStep);
  const totalSteps = BOARD_STEPS.length;
  
  const stepErrors = getStepErrors(activeStep);
  const hasCurrentStepErrors = stepErrors !== null;

  // Can only navigate to completed steps or current
  const canNavigateToStep = useCallback((stepId: BoardStepId) => {
    return completedSteps.includes(stepId) || stepId === activeStep;
  }, [completedSteps, activeStep]);

  // Effects
  useEffect(() => {
    if (!panelIsOpen) {
      reset();
      setActiveStep('basic-info');
      setCompletedSteps([]);
    }
  }, [panelIsOpen, reset]);

  // Navigation Handlers
  const handleClose = useCallback(() => {
    reset();
    setActiveStep('basic-info');
    setCompletedSteps([]);
    onClose?.();
  }, [reset, onClose]);

  const handleStepClick = useCallback((stepId: BoardStepId) => {
    if (canNavigateToStep(stepId)) {
      setActiveStep(stepId);
    }
  }, [canNavigateToStep]);
  
  const handleNext = useCallback(async () => {
    const stepErrorFields: Record<BoardStepId, Array<{ field: string; label: string }>> = {
      'basic-info': [
        { field: 'title', label: 'Board Name' },
      ],
      'appearance': [],
      'settings': [],
    };
  
    const stepFields = stepErrorFields[activeStep] || [];
    const fieldNames = stepFields.map(f => f.field);
  
    if (fieldNames.length === 0) {
      if (currentStepIndex < totalSteps - 1) {
        setCompletedSteps(prev => 
          prev.includes(activeStep) ? prev : [...prev, activeStep]
        );
        setActiveStep(BOARD_STEPS[currentStepIndex + 1].id);
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
            description: `Please fill in the ${firstErrorField.label.toLowerCase()} field in the ${BOARD_STEPS[currentStepIndex].label} step`,
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
      setActiveStep(BOARD_STEPS[currentStepIndex + 1].id);
    }
  }, [activeStep, currentStepIndex, totalSteps, form]);
  
  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setActiveStep(BOARD_STEPS[currentStepIndex - 1].id);
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

  // Step Configuration
  const stepConfig = BOARD_STEPS.map(step => ({
    ...step,
    icon: null, // Will be set by layout
  }));

  return (
    <FormProvider {...form}>
      <BoardSidebarLayout
        isOpen={panelIsOpen}
        zIndex={zIndex}
        onClose={handleClose}
        panelId={panelId}
        title="Create New Board"
        icon={<Layout size={20} />}
        activeStep={activeStep}
        completedSteps={completedSteps}
        steps={stepConfig}
        onStepClick={handleStepClick}
      >
        <div className="flex flex-col h-full max-h-full min-h-0 w-full overflow-hidden">
          {/* Step Content */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-full px-4">
              {activeStep === 'basic-info' && (
                <BasicInfoStepRHF isDarkMode={isDarkMode} />
              )}
              {activeStep === 'appearance' && (
                <AppearanceStepRHF isDarkMode={isDarkMode} />
              )}
              {activeStep === 'settings' && (
                <div className={cn(
                  'rounded-xl p-6 text-center border-2 border-dashed',
                  isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-300 text-gray-500'
                )}>
                  <Settings size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium">Advanced Settings</p>
                  <p className="text-xs mt-1">Coming soon...</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Navigation */}
          <div className={cn(
            "flex-shrink-0 pt-3 mt-3 border-t",
            isDarkMode ? "border-gray-800" : "border-gray-200"
          )}>
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
                    "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-sm",
                    (!isValid || isSubmitting) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Create Board</span>
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
      </BoardSidebarLayout>
    </FormProvider>
  );
});

CreateBoardSidebar.displayName = 'CreateBoardSidebar';

// Need to import Settings for the settings step
import { Settings } from 'lucide-react';
// Add FileText and Palette imports at the top of the layout file
import { FileText, Palette } from 'lucide-react';
import { useCreateBoardFormRHF } from '../hooks/useCreateBoardFormRHF';
