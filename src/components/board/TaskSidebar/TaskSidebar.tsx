import React, { useEffect, useRef, useState, memo } from 'react';
import { 
  Save, Edit3, Trash2, Calendar, Clock, 
  CheckCircle2, Zap, ClipboardList 
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Badge } from '@/components/ui/badge/Badge';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { useTaskStore } from '@/stores/task.store';
import { cn } from '@/lib/utils';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { PriorityColors } from '@/components/ui/PriorityColors';
import { Task } from '@/types/task.types';
import { usePanelIcon, usePanelIconComponent } from '@/hooks/usePanelIcon';

// Need useApp for ViewField
import { useApp } from '@/providers/AppProvider';

// UI Engine
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { SidebarTextarea } from '@/components/sidebar-ui-engine/SidebarTextarea';
import { SidebarSelect } from '@/components/sidebar-ui-engine/SidebarSelect';
import { SidebarActionBar, SidebarActionLeft, SidebarActionRight } from '@/components/sidebar-ui-engine/SidebarActionBar';
import { SidebarConfirmDialog } from '@/components/sidebar-ui-engine/SidebarConfirmDialog';
import { SidebarMetaInfo } from '@/components/sidebar-ui-engine/SidebarMetaInfo';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';

// ---------- Local Helpers ----------

const statusLabels: Record<Task['status'], string> = {
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const statusOptions = [
  { value: 'todo', label: 'Todo', icon: <ClipboardList size={16} className="text-blue-500" /> },
  { value: 'in-progress', label: 'In Progress', icon: <Zap size={16} className="text-yellow-500" /> },
  { value: 'done', label: 'Done', icon: <CheckCircle2 size={16} className="text-green-500" /> },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const StatusIcon: React.FC<{ status: Task['status']; size?: number }> = ({ status, size = 20 }) => {
  const props = { size };
  switch (status) {
    case 'todo': return <ClipboardList {...props} className="text-blue-500" />;
    case 'in-progress': return <Zap {...props} className="text-yellow-500" />;
    case 'done': return <CheckCircle2 {...props} className="text-green-500" />;
  }
};

const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => (
  <Badge variant="secondary" className={cn("text-xs capitalize", PriorityColors[priority])}>
    {priority}
  </Badge>
);

// ViewField component
const ViewField: React.FC<{ label: string; icon?: React.ReactNode; value: React.ReactNode }> = ({ label, icon, value }) => {
  const { isDarkMode } = useApp();
  return (
    <div>
      <label className={cn("text-sm mb-1.5 block", isDarkMode ? "text-gray-300" : "text-gray-700")}>
        {label}
      </label>
      <div className="mt-1.5 flex items-center gap-2 py-2 px-3 rounded-md border border-transparent">
        {icon}
        <span className="text-sm font-medium">
          {typeof value === 'string' ? statusLabels[value as Task['status']] || value : value}
        </span>
      </div>
    </div>
  );
};

// ---------- Main Component ----------

export const TaskSidebar: React.FC<PanelProps> = memo(({ zIndex, onClose, isOpen: panelIsOpen, panelId }) => {
  const { isDarkMode } = useApp();
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const {
    mode, selectedTask, formState, breadcrumbs,
    closeSidebar, updateFormField, openEditSidebar,
  } = useTaskSidebarStore();
  const icon = usePanelIconComponent(panelId);
  const position = usePanelPosition(panelId); 
  
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Focus on input when creating
  useEffect(() => {
    if (panelIsOpen && mode === 'create' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [panelIsOpen, mode]);

  // Reset confirm state on close
  useEffect(() => {
    if (!panelIsOpen) setShowDeleteConfirm(false);
  }, [panelIsOpen]);

  const handleClose = () => { 
    closeSidebar(); 
    onClose?.(); 
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) return;
    
    if (mode === 'create') {
      addTask({ 
        title: formState.title, 
        description: formState.description, 
        status: formState.status, 
        priority: formState.priority, 
        updatedAt: new Date().toISOString() 
      });
    } else if (mode === 'edit' && selectedTask) {
      updateTask(selectedTask.id, { 
        title: formState.title, 
        description: formState.description, 
        status: formState.status, 
        priority: formState.priority 
      });
    }
    
    handleClose();
  };

  const handleDeleteConfirm = () => {
    if (selectedTask) { 
      deleteTask(selectedTask.id); 
      handleClose(); 
    }
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit' || mode === 'create';
  
  const title = mode === 'create' 
    ? 'New Task' 
    : mode === 'view' 
      ? 'Task Details' 
      : 'Edit Task';

  const metaItems = selectedTask ? [
    { 
      icon: <Calendar size={14} />, 
      label: 'Created', 
      value: new Date(selectedTask.createdAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }) 
    },
    { 
      icon: <Clock size={14} />, 
      label: 'Last Updated', 
      value: new Date(selectedTask.updatedAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
      }) 
    },
    { 
      label: 'Status', 
      value: <Badge variant="secondary" className="text-xs">{statusLabels[selectedTask.status]}</Badge> 
    },
  ] : [];

  return (
    <SidebarShell 
      isOpen={panelIsOpen} 
      zIndex={zIndex} 
      onClose={handleClose}
      icon={icon}
      panelId={panelId}  
      title={title} 
      breadcrumbs={breadcrumbs}
      position={position}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <SidebarInput 
          id="task-title" 
          label="Title" 
          value={formState.title} 
          onChange={(v) => updateFormField('title', v)} 
          placeholder="Task title..." 
          disabled={isViewMode} 
          inputRef={inputRef}
        />

        {/* Description Textarea */}
        <SidebarTextarea 
          id="task-description" 
          label="Description" 
          value={formState.description} 
          onChange={(v) => updateFormField('description', v)} 
          placeholder="Add a description..." 
          disabled={isViewMode} 
        />

        {/* Status & Priority Grid */}
        <div className="grid grid-cols-2 gap-4">
          {isViewMode ? (
            <>
              <ViewField 
                label="Status" 
                icon={<StatusIcon status={formState.status} size={16} />} 
                value={formState.status} 
              />
              <ViewField 
                label="Priority" 
                icon={<PriorityBadge priority={formState.priority} />} 
                value={formState.priority} 
              />
            </>
          ) : (
            <>
              <SidebarSelect 
                id="task-status" 
                label="Status" 
                value={formState.status} 
                onValueChange={(v) => updateFormField('status', v as Task['status'])} 
                options={statusOptions} 
              />
              <SidebarSelect 
                id="task-priority" 
                label="Priority" 
                value={formState.priority} 
                onValueChange={(v) => updateFormField('priority', v as Task['priority'])} 
                options={priorityOptions} 
              />
            </>
          )}
        </div>

        {/* Meta Info (View Mode) */}
        {isViewMode && selectedTask && (
          <SidebarMetaInfo items={metaItems} />
        )}

        {/* Actions */}
        <SidebarActionBar>
          {/* View Mode Actions */}
          {isViewMode && selectedTask && !showDeleteConfirm && (
            <SidebarActionLeft>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)} 
                className="flex items-center gap-2 flex-1"
              >
                <Trash2 size={16} /> Delete Task
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => openEditSidebar(selectedTask)} 
                className={cn(
                  "flex items-center gap-2 flex-1",
                  isDarkMode && "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                )}
              >
                <Edit3 size={16} /> Edit Task
              </Button>
            </SidebarActionLeft>
          )}
          
          {/* Delete Confirmation */}
          {isViewMode && selectedTask && showDeleteConfirm && (
            <SidebarConfirmDialog
              title="Are you sure?"
              message={`This action cannot be undone. The task "${selectedTask.title}" will be permanently deleted.`}
              confirmLabel="Yes, Delete"
              cancelLabel="No, Cancel"
              onConfirm={handleDeleteConfirm}
              onCancel={() => setShowDeleteConfirm(false)}
              icon={<Trash2 size={20} />}
            />
          )}
          
          {/* Edit/Create Mode Actions */}
          {isEditMode && (
            <SidebarActionRight>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose}
                className={cn(isDarkMode && "text-gray-300 hover:text-gray-100 hover:bg-gray-800")}
              >
                Cancel
              </Button>
              <Button type="submit" variant="success" className="flex items-center gap-2">
                <Save size={16} /> 
                {mode === 'create' ? 'Create Task' : 'Save Changes'}
              </Button>
            </SidebarActionRight>
          )}
        </SidebarActionBar>
      </form>
    </SidebarShell>
  );
});

TaskSidebar.displayName = 'TaskSidebar';
