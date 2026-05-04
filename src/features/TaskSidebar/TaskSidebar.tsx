// ──── src/features/TaskSidebar/TaskSidebar.tsx ────

import React, { useEffect, useRef, useState, memo, useMemo } from 'react';
import {
  Save, Edit3, Trash2, Calendar, Clock, FileText, Tag,
  CheckSquare, Eye, Plus, ListChecks, Layout, Flag,
  ArrowRight, ArrowLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge/Badge';
import { useTaskStore } from '@/stores/task.store';
import { cn } from '@/lib/utils';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { useLabelStore } from '@/stores/label.store';
import { useColumnStore } from '@/stores/column.store';
import { Task, TaskType, TaskPriority } from '@/types/task.types';

// UI Engine
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { SidebarTextarea } from '@/components/sidebar-ui-engine/SidebarTextarea';
import { SidebarSelect } from '@/components/sidebar-ui-engine/SidebarSelect';
import { SidebarActionBar, SidebarActionLeft, SidebarActionRight } from '@/components/sidebar-ui-engine/SidebarActionBar';
import { SidebarConfirmDialog } from '@/components/sidebar-ui-engine/SidebarConfirmDialog';
import { SidebarMetaInfo } from '@/components/sidebar-ui-engine/SidebarMetaInfo';
import { Stepper } from '@/components/sidebar-ui-engine/Stepper';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { LabelPicker } from '@/components/board/LabelPicker';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { getColumnLabel } from './utils';
import StatusIcon from './components/StatusIcon';
import PriorityBadge from './components/PriorityBadge';
import ViewField from './components/ViewField';
import { StepId, STEPS, useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { SubTaskList } from './components/SubTaskList';

// ──── Step Icons ────
const STEP_ICONS: Record<StepId, React.ReactNode> = {
  basic: <FileText size={14} />,
  classification: <Tag size={14} />,
  schedule: <Calendar size={14} />,
  breakdown: <ListChecks size={14} />,
};

// ──── Component ────

export const TaskSidebar: React.FC<PanelProps> = memo(({
  zIndex, onClose, isOpen: panelIsOpen, panelId, isDarkMode
}) => {
  const { addTask, updateTask, deleteTask, addLabel, removeLabel, addSubTask, removeSubTask, toggleSubTask } = useTaskStore();
  const { labels, getLabelById } = useLabelStore();
  const { columns } = useColumnStore();
  const {
    mode, selectedTask, formState, breadcrumbs,
    closeSidebar, updateFormField, openEditSidebar, parentTaskId,
    activeStep, completedSteps, goToStep, goNext, goBack, completeStep,
  } = useTaskSidebarStore();

  const position = usePanelPosition(panelId);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit' || mode === 'create';
  const isLastStep = activeStep === 'breakdown';
  const isFirstStep = activeStep === 'basic';
                    console.log('📍 activeStep:', activeStep, 'isLastStep:', isLastStep);

  // ──── Mode Icon ────
  const icon = useMemo(() => {
    switch (mode) {
      case 'create': return <Plus size={20} />;
      case 'view': return <Eye size={20} />;
      case 'edit': return <Edit3 size={20} />;
      default: return <CheckSquare size={20} />;
    }
  }, [mode]);

  // ──── Focus input ────
  useEffect(() => {
    if (panelIsOpen && mode === 'create' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [panelIsOpen, mode]);

  useEffect(() => {
    if (!panelIsOpen) setShowDeleteConfirm(false);
  }, [panelIsOpen]);

  // ──── Dynamic column options ────
  const dynamicColumnOptions = columns
    .sort((a, b) => a.order - b.order)
    .map(col => ({
      value: col.id,
      label: col.title,
      icon: <StatusIcon columnId={col.id} size={16} />,
    }));

  const typeOptions = [
    { value: 'task', label: 'Task' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'project', label: 'Project' },
    { value: 'epic', label: 'Epic' },
  ];

  // ──── Handlers ────
  const handleClose = () => {
    closeSidebar();
    onClose?.();
  };

  const handleNext = () => {
    completeStep(activeStep);
    goNext();
  };

  const handleBack = () => {
    if (isFirstStep) return;
    goBack();
  };

  const handleLabelToggle = (labelId: string) => {
    updateFormField('labels',
      formState.labels.includes(labelId)
        ? formState.labels.filter(id => id !== labelId)
        : [...formState.labels, labelId]
    );
  };


  const handleSubmit = () => {
    if (!formState.title.trim()) return;

    const baseData = {
      title: formState.title,
      description: formState.description,
      columnId: formState.columnId,
      priority: formState.priority,
      labels: formState.labels,
      dueDate: formState.dueDate,
      startDate: formState.startDate,
      type: formState.type,
      parentId: parentTaskId,
    };

    if (mode === 'create') {
      addTask(baseData);
    } else if (mode === 'edit' && selectedTask) {
      updateTask(selectedTask.id, baseData);
    }

    handleClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      handleClose();
    }
  };

  // ──── Derive title ────
  const title = mode === 'create'
    ? 'New Task'
    : mode === 'view'
      ? 'Task Details'
      : 'Edit Task';

  // ──── Stepper config ────
  const stepConfig = STEPS.map(step => ({
    ...step,
    icon: STEP_ICONS[step.id],
  }));

  // ──── Render Step Content ────
  const renderStepContent = () => {
    switch (activeStep) {
      case 'basic':
        return (
          <div className="space-y-4">
            <SidebarInput
              id="task-title"
              label="Title"
              value={formState.title}
              onChange={(v) => updateFormField('title', v)}
              placeholder="Task title..."
              disabled={isViewMode}
              inputRef={inputRef}
            />
            <SidebarTextarea
              id="task-description"
              label="Description"
              value={formState.description}
              onChange={(v) => updateFormField('description', v)}
              placeholder="Add a description..."
              disabled={isViewMode}
              rows={5}
            />
          </div>
        );

      case 'classification':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {isViewMode ? (
                <>
                  <ViewField label="Type" value={formState.type} />
                  <ViewField label="Priority" icon={<PriorityBadge priority={formState.priority} />} value={formState.priority} />
                  <ViewField label="Column" icon={<StatusIcon columnId={formState.columnId} size={16} />} value={getColumnLabel(formState.columnId)} />
                </>
              ) : (
                <>
                  <SidebarSelect
                    id="task-type"
                    label="Type"
                    value={formState.type}
                    onValueChange={(v) => updateFormField('type', v as TaskType)}
                    options={typeOptions}
                  />
                  <SidebarSelect
                    id="task-priority"
                    label="Priority"
                    value={formState.priority}
                    onValueChange={(v) => updateFormField('priority', v as TaskPriority)}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'high', label: 'High' },
                      { value: 'urgent', label: 'Urgent' },
                    ]}
                  />
                  <SidebarSelect
                    id="task-column"
                    label="Column"
                    value={formState.columnId}
                    onValueChange={(v) => updateFormField('columnId', v)}
                    options={dynamicColumnOptions}
                  />
                </>
              )}
            </div>

            {/* Labels */}
            <div>
              {isViewMode ? (
                <div className="flex flex-wrap gap-1.5">
                  {formState.labels.map(id => {
                    const label = getLabelById(id);
                    return label ? (
                      <span key={id} className="text-xs px-2.5 py-1 rounded-full text-white font-medium" style={{ backgroundColor: label.color }}>
                        {label.name}
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <LabelPicker
                  selectedLabels={formState.labels}
                  onToggle={handleLabelToggle}
                />
              )}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4">
            <DatePicker
              label="Start Date"
              value={formState.startDate}
              onChange={(d) => updateFormField('startDate', d)}
              disabled={isViewMode}
            />
            <DatePicker
              label="Due Date"
              value={formState.dueDate}
              onChange={(d) => updateFormField('dueDate', d)}
              disabled={isViewMode}
              includeTime
            />
            {formState.startDate && formState.dueDate && (
              <div className={cn(
                'p-3 rounded-lg text-xs space-y-1',
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              )}>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">
                    {Math.ceil((formState.dueDate.getTime() - formState.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </div>
            )}
          </div>
        );
            
      case 'breakdown':
        if (isViewMode && selectedTask) {
          return (
            <SubTaskList
              parentTaskId={selectedTask.id}
              subTaskIds={selectedTask.subTasks}
              disabled
            />
          );
        }
        // For create mode, sub-tasks can only be added AFTER task exists
        // So show message or persistent sub-task list if editing
        if (mode === 'create') {
          return (
            <div className="text-xs text-gray-400 text-center py-8 space-y-2">
              <p>Sub-tasks can be added after the task is created.</p>
              <p>Complete the wizard and then add sub-tasks from the task view.</p>
            </div>
          );
        }
      // Edit mode
        return (
          <SubTaskList
            parentTaskId={selectedTask!.id}
            subTaskIds={selectedTask!.subTasks}
          />
        );

      default:
        return null;
    }
  };

  // ──── Meta for view mode ────
  const metaItems = selectedTask ? [
    { icon: <Calendar size={14} />, label: 'Created', value: new Date(selectedTask.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { icon: <Clock size={14} />, label: 'Updated', value: new Date(selectedTask.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { label: 'Column', value: <Badge variant="secondary" className="text-xs">{getColumnLabel(selectedTask.columnId)}</Badge> },
  ] : [];

  // ──── Render ────
  return (
    <SidebarShell
      isOpen={panelIsOpen}
      zIndex={zIndex}
      onClose={handleClose}
      isDarkMode={isDarkMode}
      icon={icon}
      panelId={panelId}
      title={title}
      breadcrumbs={breadcrumbs}
      position={position}
      maxWidth="xl"
    >
      <div className="flex gap-6 h-full">
        {/* Stepper sidebar */}
        <div className="lg:w-40 flex-shrink-0 pt-2">
          <Stepper
            steps={stepConfig}
            activeStep={activeStep}
            completedSteps={isViewMode ? ['basic', 'classification', 'schedule', 'breakdown'] : completedSteps}
            onStepClick={isViewMode ? undefined : (stepId) => goToStep(stepId as StepId)}
          />
        </div>

        {/* Content */}
        <div className="flex-1 w-full m-2 overflow-x-visible flex flex-col min-h-0">
          <form className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto pb-4">
              {renderStepContent()}
            </div>

            {/* View mode: meta + actions */}
            {isViewMode && selectedTask && (
              <div className="space-y-4 mt-4">
                <SidebarMetaInfo items={metaItems} />
                <SidebarActionBar>
                  {!showDeleteConfirm ? (
                    <SidebarActionLeft>
                      <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 flex-1">
                        <Trash2 size={16} /> Delete
                      </Button>
                      <Button type="button" variant="outline" onClick={() => openEditSidebar(selectedTask)} className={cn("flex items-center gap-2 flex-1", isDarkMode && "border-gray-700 text-gray-300 hover:bg-gray-800")}>
                        <Edit3 size={16} /> Edit
                      </Button>
                    </SidebarActionLeft>
                  ) : (
                    <SidebarConfirmDialog
                      title="Delete task?"
                      message={`"${selectedTask.title}" will be permanently deleted.`}
                      confirmLabel="Delete"
                      cancelLabel="Cancel"
                      onConfirm={handleDeleteConfirm}
                      onCancel={() => setShowDeleteConfirm(false)}
                      icon={<Trash2 size={20} />}
                    />
                  )}
                </SidebarActionBar>
              </div>
            )}

            {/* Edit/Create mode: step navigation */}
            {isEditMode && (
              <div className="space-y-4 mt-4">
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={isFirstStep ? handleClose : handleBack}
                    className={cn("flex items-center gap-1", isDarkMode && "text-gray-300 hover:text-gray-100")}
                  >
                    <ArrowLeft size={14} />
                    {isFirstStep ? 'Cancel' : 'Back'}
                  </Button>

                  {!isLastStep ? (
                    // const isLastStep = activeStep === 'breakdown';
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleNext}
                      className={cn("flex items-center gap-1", isDarkMode && "border-gray-700 text-gray-300")}
                    >
                      Next
                      <ArrowRight size={14} />
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="success" 
                      onClick={handleSubmit}
                      className="flex items-center gap-2"
                    >
                      <Save size={16} />
                      {mode === 'create' ? 'Create Task' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </SidebarShell>
  );
});

TaskSidebar.displayName = 'TaskSidebar';