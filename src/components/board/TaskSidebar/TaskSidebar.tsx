import React, { useEffect, useRef, useState, memo } from 'react';
import { 
    X, Save, Edit3, 
    Trash2, Calendar, Clock, AlertTriangle,
    CheckCircle2,
    Zap,
    ArrowDown,
    Minus,
    ArrowUp,
    ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Label } from '@/components/ui/label/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/Select';
import { Badge } from '@/components/ui/badge/Badge';
import { useTaskSidebarStore } from '@/stores/task-sidebar.store';
import { useTaskStore, Task } from '@/stores/task.store';
import { useApp } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { Breadcrumb } from '@/components/ui/breadcrumb/Breadcrumb';

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const statusLabels = {
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'done': 'Done',
};
const StatusIcon = ({ status, size = 20 }: { status: Task['status'], size?: number }) => {
  const iconProps = { size };
  
  switch (status) {
    case 'todo':
      return <ClipboardList {...iconProps} className="text-blue-500" />;
    case 'in-progress':
      return <Zap {...iconProps} className="text-yellow-500" />;
    case 'done':
      return <CheckCircle2 {...iconProps} className="text-green-500" />;
    default:
      return null;
  }
};

const PriorityIcon = ({ priority, size = 16 }: { priority: Task['priority'], size?: number }) => {
  const iconProps = { size };
  
  switch (priority) {
    case 'low':
      return <ArrowDown {...iconProps} className="text-green-500" />;
    case 'medium':
      return <Minus {...iconProps} className="text-yellow-500" />;
    case 'high':
      return <ArrowUp {...iconProps} className="text-red-500" />;
    default:
      return null;
  }
};
export const TaskSidebar: React.FC<PanelProps> = memo(({ 
  zIndex, 
  onClose, 
  isOpen: panelIsOpen,
  metadata 
}) => {
  const { isDarkMode } = useApp();
  const { addTask, updateTask, deleteTask } = useTaskStore();
  const {
    mode,
    selectedTask,
    formState,
    breadcrumbs,
    closeSidebar,
    updateFormField,
    openEditSidebar,
  } = useTaskSidebarStore();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle open/close animations
  useEffect(() => {
    if (panelIsOpen) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready before animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [panelIsOpen]);

  useEffect(() => {
    if (panelIsOpen && mode === 'create' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [panelIsOpen, mode]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSidebar();
        onClose?.();
      }
    };
    
    if (panelIsOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [panelIsOpen, closeSidebar, onClose]);

  const handleClose = () => {
    closeSidebar();
    onClose?.();
  };

  // Reset confirm state
  useEffect(() => {
    if (!panelIsOpen) {
      setShowDeleteConfirm(false);
    }
  }, [panelIsOpen]);

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
        priority: formState.priority,
      });
    }
    
    handleClose();
  };

  const handleDeleteClick = () => setShowDeleteConfirm(true);
  const handleDeleteCancel = () => setShowDeleteConfirm(false);
  const handleDeleteConfirm = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      handleClose();
    }
  };

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit' || mode === 'create';

  if (!shouldRender) return null;

  return (
    <>
      {/* Sidebar */}
      <div
        style={{ zIndex: zIndex || 50 }}
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-lg',
          'shadow-2xl border-l',
          'transform transition-transform duration-300 ease-in-out',
          isDarkMode
            ? 'bg-gray-900 border-gray-800 text-gray-100'
            : 'bg-white border-gray-200 text-gray-900',
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b",
          isDarkMode ? "border-gray-800" : "border-gray-200"
        )}>
          <h2 className="text-lg font-semibold">
            {mode === 'create' && 'New Task'}
            {mode === 'view' && 'Task Details'}
            {mode === 'edit' && 'Edit Task'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isDarkMode
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                  : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
              )}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} isDarkMode={isDarkMode} />
        )}

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100vh-130px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="task-title" className={cn(
                isDarkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Title
              </Label>
              <Input
                ref={inputRef}
                id="task-title"
                value={formState.title}
                onChange={(e) => updateFormField('title', e.target.value)}
                placeholder="Task title..."
                disabled={isViewMode}
                className={cn(
                  'mt-1.5 text-base',
                  isViewMode && 'bg-transparent border-transparent px-0',
                  isDarkMode && !isViewMode && 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
                )}
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="task-description" className={cn(
                isDarkMode ? "text-gray-300" : "text-gray-700"
              )}>
                Description
              </Label>
              <Textarea
                id="task-description"
                value={formState.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Add a description..."
                disabled={isViewMode}
                className={cn(
                  'mt-1.5 min-h-[100px]',
                  isViewMode && 'bg-transparent border-transparent px-0 resize-none',
                  isDarkMode && !isViewMode && 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
                )}
                rows={5}
              />
            </div>

            {/* Status & Priority Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-status" className={cn(
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Status
                </Label>
                {isViewMode ? (
                  <div className="mt-1.5 flex items-center gap-2 py-2 px-3 rounded-md border border-transparent">
                    <StatusIcon status={formState.status} />
                    <span className="text-sm font-medium">
                      {statusLabels[formState.status]}
                    </span>
                  </div>
                ) : (
                  <Select
                    value={formState.status}
                    onValueChange={(value: Task['status']) => 
                      updateFormField('status', value)
                    }
                  >
                    <SelectTrigger 
                      id="task-status"
                      className={cn(
                        "mt-1.5",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-700 text-gray-100" 
                          : "bg-white border-gray-300 text-gray-900"
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className={cn(
                        'z-[9999]',
                        isDarkMode 
                          ? "bg-gray-800 border-gray-700 text-gray-100" 
                          : "bg-white border-gray-200 text-gray-900"
                      )}
                    >
                      <SelectItem 
                        value="todo"
                        className={cn(
                          "cursor-pointer",
                          isDarkMode 
                            ? "hover:bg-gray-700 focus:bg-gray-700" 
                            : "hover:bg-gray-100 focus:bg-gray-100"
                        )}
                      >
                        <div className='flex items-center gap-2'>
                          <ClipboardList size={16} className="text-blue-500" />
                          Todo
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="in-progress"
                        className={cn(
                          "cursor-pointer",
                          isDarkMode 
                            ? "hover:bg-gray-700 focus:bg-gray-700" 
                            : "hover:bg-gray-100 focus:bg-gray-100"
                        )}
                      >
                        <div className='flex items-center gap-2'>
                          <Zap size={16} className="text-yellow-500" />
                        In Progress
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="done"
                        className={cn(
                          "cursor-pointer",
                          isDarkMode 
                            ? "hover:bg-gray-700 focus:bg-gray-700" 
                            : "hover:bg-gray-100 focus:bg-gray-100"
                        )}
                      >
                        <div className='flex items-center gap-2'>
                          <CheckCircle2 size={16} className="text-green-500" />
                        Done
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="task-priority" className={cn(
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}>
                  Priority
                </Label>
                {isViewMode ? (
                  <div className="mt-1.5 flex items-center gap-2 py-2 px-3 rounded-md border border-transparent">
                    <PriorityIcon priority={formState.priority} />
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs capitalize", priorityColors[formState.priority])}
                    >
                      {formState.priority}
                    </Badge>
                  </div>
                ) : (
                  <Select
                    value={formState.priority}
                    onValueChange={(value: Task['priority']) => 
                    updateFormField('priority', value)
                    }
                >
                    <SelectTrigger 
                      id="task-priority"
                      className={cn(
                        "mt-1.5",
                        isDarkMode 
                          ? "bg-gray-800 border-gray-700 text-gray-100" 
                          : "bg-white border-gray-300 text-gray-900"
                      )}
                    >
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                    className={cn(
                        "z-[9999]",
                        isDarkMode 
                        ? "bg-gray-800 border-gray-700 text-gray-100" 
                        : "bg-white border-gray-200 text-gray-900"
                    )}
                    >
                    <SelectItem 
                        value="low"
                        className={cn(
                        "cursor-pointer",
                        isDarkMode 
                            ? "hover:bg-gray-700 focus:bg-gray-700" 
                            : "hover:bg-gray-100 focus:bg-gray-100"
                        )}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDown size={16} className="text-green-500" />
                        Low
                      </div>
                    </SelectItem>
                    <SelectItem 
                        value="medium"
                        className={cn(
                        "cursor-pointer",
                        isDarkMode 
                            ? "hover:bg-gray-700 focus:bg-gray-700" 
                            : "hover:bg-gray-100 focus:bg-gray-100"
                        )}
                    >
                      <div className="flex items-center gap-2">
                        <Minus size={16} className="text-yellow-500" />
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem 
                        value="high"
                        className={cn(
                        "cursor-pointer",
                        isDarkMode 
                            ? "hover:bg-gray-700 focus:bg-gray-700" 
                            : "hover:bg-gray-100 focus:bg-gray-100"
                        )}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUp size={16} className="text-red-500" />
                        High
                      </div>
                    </SelectItem>
                    </SelectContent>
                </Select>
                )}
              </div>
            </div>

            {/* Meta Information (View Mode) */}
            {isViewMode && selectedTask && (
              <div className={cn(
                "space-y-3 pt-4 border-t",
                isDarkMode ? "border-gray-800" : "border-gray-200"
              )}>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Created</span>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    {new Date(selectedTask.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Last Updated</span>
                  <span className="flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(selectedTask.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>Status</span>
                  <Badge variant="secondary" className="text-xs">
                    {statusLabels[selectedTask.status]}
                  </Badge>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className={cn(
              "flex justify-between items-center pt-4 border-t",
              isDarkMode ? "border-gray-800" : "border-gray-200"
            )}>
              {isViewMode && selectedTask && (
                <div className="flex gap-2 w-full">
                  {!showDeleteConfirm ? (
                    <div className="flex gap-2 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteClick}
                        className="flex items-center gap-2 flex-1"
                      >
                        <Trash2 size={16} />
                        Delete Task
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
                        <Edit3 size={16} />
                        Edit Task
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className={cn(
                        "p-4 rounded-lg border-2 mb-4",
                        isDarkMode
                          ? "bg-red-900/20 border-red-800/50 text-red-300"
                          : "bg-red-50 border-red-200 text-red-700"
                      )}>
                        <div className="flex items-start gap-3">
                          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-sm mb-1">Are you sure?</p>
                            <p className="text-xs opacity-80">
                              This action cannot be undone. The task "{selectedTask.title}" will be permanently deleted.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDeleteConfirm}
                          className="flex items-center gap-2 flex-1 bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                        >
                          <Trash2 size={16} />
                          Yes, Delete
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDeleteCancel}
                          className={cn(
                            "flex items-center gap-2 flex-1",
                            isDarkMode && "border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                          )}
                        >
                          No, Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
                    
              {isEditMode && (
                <div className="flex gap-2 ml-auto">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleClose}
                    className={cn(
                      isDarkMode && "text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                    )}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="success" className="flex items-center gap-2">
                    <Save size={16} />
                    {mode === 'create' ? 'Create Task' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
});