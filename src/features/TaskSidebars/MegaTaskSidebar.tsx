import React, { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react';
import {
    Save, Edit3, Trash2, Calendar, Clock, FileText, Tag,
    CheckSquare, Eye, Plus, ListChecks, Flag,
  ArrowRight, ArrowLeft,
  Zap
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
import { LabelPicker } from '@/components/pickers/LabelPicker';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { StepId, STEPS, useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';

// Components
import { SubTaskList } from './components/SubTaskList';
import StatusIcon from './components/StatusIcon';
import PriorityBadge from './components/PriorityBadge';
import ViewField from './components/ViewField';
import { getColumnLabel } from './utils';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor/MarkdownEditor';
import { QuickCreate, QuickCreateFormState } from './components/quickCreate/QuickCreate';

const STEP_ICONS: Record<StepId, React.ReactNode> = {
  'quick-create': <Zap size={14} />,
  'full-details': <FileText size={14} />,
  'schedule': <Calendar size={14} />,
  'meta': <Tag size={14} />,
};
// ──── Component ────
export const MegaTaskSidebar: React.FC<PanelProps> = memo(({
    zIndex, onClose, isOpen: panelIsOpen, panelId, isDarkMode
}) => {
    const { addTask, updateTask, deleteTask } = useTaskStore();
    const { labels, getLabelById } = useLabelStore();
    const { columns } = useColumnStore();
    const {
        mode, selectedTask, formState, breadcrumbs,
        closeSidebar, updateFormField, openEditSidebar, parentTaskId,
        activeStep, completedSteps, goToStep, goNext, goBack, completeStep,
    } = useTaskSidebarStore();
    
    const position = usePanelPosition(panelId);
    const fileInputRef = useRef<HTMLInputElement>(null); 
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isViewMode = mode === 'view';
    const isEditMode = mode === 'edit' || mode === 'create';
    const isLastStep = activeStep === 'meta';       
    const isFirstStep = activeStep === 'quick-create'; 
    const icon = useMemo(() => {
      switch (mode) {
        case 'create': return <Plus size={20} />;
        case 'view': return <Eye size={20} />;
        case 'edit': return <Edit3 size={20} />;
        default: return <CheckSquare size={20} />;
      }
    }, [mode]);

    useEffect(() => {
      if (panelIsOpen && mode === 'create' && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }, [panelIsOpen, mode]);

    useEffect(() => {
      if (!panelIsOpen) setShowDeleteConfirm(false);
      }, [panelIsOpen]);

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
  const handleMilestoneToggle = useCallback((milestoneId: string) => {
      const current = formState.milestoneIds || [];
      updateFormField('milestoneIds',
        current.includes(milestoneId)
          ? current.filter(id => id !== milestoneId)
          : [...current, milestoneId]
      );
  }, [formState.milestoneIds, updateFormField]);

  const handleProjectToggle = useCallback((projectId: string) => {
    const current = formState.projectIds || [];
    updateFormField('projectIds',
      current.includes(projectId)
        ? current.filter(id => id !== projectId)
        : [...current, projectId]
      );
    }, [formState.projectIds, updateFormField]);

  const handleSubmit = useCallback(
  () => {
    if (!formState.title.trim() || !formState.shortDescription.trim()) return;
  
    const baseData = {
      title: formState.title,
      shortDescription: formState.shortDescription,
      description: formState.description,
      columnId: formState.columnId,
      priority: formState.priority,
      type: formState.type,
      labels: formState.labels,
      milestoneIds: formState.milestoneIds || [],
      project: formState.projectIds || [],
      dueDate: formState.dueDate,
      startDate: formState.startDate,
      reminderDate: formState.reminderDate,
      estimatedHours: formState.estimatedHours,
      attachments: formState.attachments as any,
      parentId: parentTaskId,
    };
  
    if (mode === 'create') addTask(baseData);
    else if (mode === 'edit' && selectedTask) updateTask(selectedTask.id, baseData);
    handleClose();
  }, [formState, mode, selectedTask, parentTaskId, addTask, updateTask, handleClose]);

  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      handleClose();
    }
  };

  const title = mode === 'create' ? 'New Task' : mode === 'view' ? 'Task Details' : 'Edit Task';

  const stepConfig = STEPS.map(step => ({ ...step, icon: STEP_ICONS[step.id] }));

  // ──── Dynamic options ────
  const dynamicColumnOptions = columns
    .sort((a, b) => a.order - b.order)
    .map(col => ({ value: col.id, label: col.title, icon: <StatusIcon columnId={col.id} size={16} /> }));

  const typeOptions = [
    { value: 'task', label: 'Task' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'project', label: 'Project' },
    { value: 'epic', label: 'Epic' },
  ];

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback(
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        updateFormField('attachments', [...formState.attachments, {
          id: crypto.randomUUID(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url,
        }]);
      };
      reader.readAsDataURL(file);
    });
    event.target.value = '';
  },  [formState.attachments, updateFormField]);

  const handleAttachmentDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files);
    
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const newAttachment = {
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' as const : 'file' as const,
            url,
          };
          updateFormField('attachments', [...formState.attachments, newAttachment]);
        };
        reader.readAsDataURL(file);
      });
    },
    [formState.attachments, updateFormField]
  );
  // ──── Render Step Content ────
  const renderStepContent = () => {
    switch (activeStep) {
      case 'quick-create':
        return <QuickCreate isViewMode={isViewMode} inputRef={inputRef} formState={undefined} updateFormField={function <K extends keyof QuickCreateFormState>(field: K, value: QuickCreateFormState[K]): void {
          throw new Error('Function not implemented.');
        } } />;

      case 'full-details':
    return (
        <div className="flex-1 lg:max-h-[600px] max-h-[400px] flex flex-col min-h-0">
        <MarkdownEditor
            value={formState.description}
            onChange={(v) => updateFormField('description', v)}
            placeholder="Detailed task description with Markdown support..."
            disabled={isViewMode}
            // minHeight="300px"
            className="flex-1 h-full"
        />
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
            <DatePicker
                label="Reminder"
                value={formState.reminderDate}
                onChange={(d) => updateFormField('reminderDate', d)}
                disabled={isViewMode}
                includeTime
            />
            
            {/* Duration calculation */}
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

      case 'meta':
        return (
          <div className="space-y-4">
            <div>
              <label 
                className={cn(
                  "text-sm mb-2 block font-medium",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                Attachments
              </label>
              <div
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center', 'transition-colors cursor-pointer',
                  isDarkMode
                    ? 'border-gray-700 hover:border-gray-600'
                    : 'border-gray-300 hover:border-gray-400',
                  isViewMode && 'opacity-50'
                )}
                onDrop={handleAttachmentDrop}
                onDragOver={(e: React.DragEvent) => e.preventDefault()}
                onClick={handleAttachmentClick}
              >
                {isViewMode ? (
                  <p className="text-sm text-gray-400">No attachments</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-1">
                      Drop files, images, or code snippets here
                    </p>
                    <p className="text-xs text-gray-500">or click to browse</p>
                  </>
                )}
              </div>
<input
  ref={fileInputRef}
  type="file"
  multiple
  onChange={handleFileSelect}
  className="hidden"
  accept="image/*,.pdf,.doc,.docx,.txt,.md,.js,.ts,.jsx,.tsx,.json,.csv"
/>
{formState.attachments.length > 0 && (
  <div className="mt-3 space-y-1.5">
    {formState.attachments.map(att => (
      <div
        key={att.id}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-xs group',
          isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
        )}
      >
        {att.type === 'image' ? (
          <img src={att.url} alt={att.name} className="w-8 h-8 rounded object-cover" />
        ) : (
          <FileText size={14} className="text-gray-400" />
        )}
        <span className="flex-1 truncate">{att.name}</span>
        <span className="text-gray-500 text-[10px] uppercase">{att.type}</span>
        {!isViewMode && (
          <button
            onClick={() => updateFormField('attachments', formState.attachments.filter(a => a.id !== att.id))}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    ))}
  </div>
)}
            </div>

            {/* Estimated Hours */}
            <SidebarInput
                id="estimated-hours"
                label="Estimated Hours"
                value={formState.estimatedHours?.toString() || ''}
                onChange={(v) => updateFormField('estimatedHours', v ? parseInt(v) : undefined)}
                placeholder="0"
                disabled={isViewMode}
            />

            {/* Related Tasks placeholder */}
            <div>
                <label className={cn(
                "text-sm mb-1.5 block",
                isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                Related Tasks
                </label>
                <p className="text-xs text-gray-400 italic">Task linking coming soon</p>
            </div>
            </div>
        );
      
      default:
        return null;
    }
  };

  const metaItems = selectedTask ? [
    { icon: <Calendar size={14} />, label: 'Created', value: new Date(selectedTask.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { icon: <Clock size={14} />, label: 'Updated', value: new Date(selectedTask.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) },
    { label: 'Column', value: <Badge variant="secondary" className="text-xs">{getColumnLabel(selectedTask.columnId)}</Badge> },
  ] : [];

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
      maxWidth="full"
    >
      <div className="flex gap-6 h-full max-h-[calc(100vh-12rem)]">
        {/* Stepper Sidebar */}
        <div className="lg:w-40 flex-shrink-0 pt-2 border-r border-gray-200 dark:border-gray-800 pr-4">
          <Stepper
            steps={stepConfig}
            activeStep={activeStep}
            completedSteps={isViewMode ? ['quick-create', 'full-details', 'schedule', 'meta'] : completedSteps}
            onStepClick={isViewMode ? undefined : (stepId) => goToStep(stepId as StepId)}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <form className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              {renderStepContent()}
            </div>

            {/* View Mode Actions */}
            {isViewMode && selectedTask && (
              <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <SidebarMetaInfo items={metaItems} />
                <SidebarActionBar>
                  {!showDeleteConfirm ? (
                    <SidebarActionLeft>
                      <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="flex items-center gap-2 flex-1"><Trash2 size={16} /> Delete</Button>
                      <Button type="button" variant="outline" onClick={() => openEditSidebar(selectedTask)} className={cn("flex items-center gap-2 flex-1", isDarkMode && "border-gray-700 text-gray-300 hover:bg-gray-800")}><Edit3 size={16} /> Edit</Button>
                    </SidebarActionLeft>
                  ) : (
                    <SidebarConfirmDialog title="Delete task?" message={`"${selectedTask.title}" will be permanently deleted.`} confirmLabel="Delete" cancelLabel="Cancel" onConfirm={handleDeleteConfirm} onCancel={() => setShowDeleteConfirm(false)} icon={<Trash2 size={20} />} />
                  )}
                </SidebarActionBar>
              </div>
            )}

            {/* Edit/Create Navigation */}
            {isEditMode && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
                <div className="flex items-center justify-between">
                  <Button type="button" variant="ghost" onClick={isFirstStep ? handleClose : handleBack} className={cn("flex items-center gap-1", isDarkMode && "text-gray-300 hover:text-gray-100")}><ArrowLeft size={14} />{isFirstStep ? 'Cancel' : 'Back'}</Button>
                  {!isLastStep ? (
                    <Button type="button" variant="outline" onClick={handleNext} className={cn("flex items-center gap-1", isDarkMode && "border-gray-700 text-gray-300")}>Next<ArrowRight size={14} /></Button>
                  ) : (
                    <Button type="button" variant="success" onClick={handleSubmit} className="flex items-center gap-2"><Save size={16} />{mode === 'create' ? 'Create Task' : 'Save Changes'}</Button>
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

MegaTaskSidebar.displayName = 'MegaTaskSidebar';