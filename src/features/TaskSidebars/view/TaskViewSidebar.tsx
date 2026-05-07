// features/TaskSidebars/view/TaskViewSidebar.tsx
import React, { useState, useEffect, memo, useCallback } from 'react';
import { 
  Eye, Edit2, Trash2, MoreHorizontal 
} from 'lucide-react';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { useTaskStore } from '@/stores/task.store';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { useTaskViewTabs } from './hooks/useTaskViewTabs';
import { TaskViewLayout } from './TaskViewLayout';
import { OverviewTab } from './components/tabs/OverviewTab';
import { DescriptionTab } from './components/tabs/DescriptionTab';
import { ScheduleTab } from './components/tabs/ScheduleTab';
import { MetaDocsTab } from './components/tabs/MetaDocsTab';
import { RelatedTasksTab } from './components/tabs/RelatedTasksTab';
import { RelatedNotesTab } from './components/tabs/RelatedNotesTab';
import { EmptyState } from './components/shared/EmptyState';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';

export const TaskViewSidebar: React.FC<PanelProps> = memo(({
  zIndex,
  onClose,
  isOpen: panelIsOpen,
  panelId,
  isDarkMode,
  metadata,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const taskId = metadata?.taskId;
  const { getTaskById, deleteTask } = useTaskStore();
  const { openEditSidebar } = useTaskSidebarStore();
  
  const task: Task | null | undefined = taskId ? (getTaskById(taskId) ?? null) : null;
  const tabs = useTaskViewTabs(task);

  // Reset active tab when task changes
  useEffect(() => {
    if (task && tabs.length > 0) {
      const tabExists = tabs.some(t => t.id === activeTab);
      if (!tabExists) {
        setActiveTab(tabs[0].id);
      }
    } else {
      setActiveTab('overview');
      setShowDeleteConfirmation(false);
    }
  }, [task?.id, tabs.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!panelIsOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteConfirmation) {
          setShowDeleteConfirmation(false);
        } else {
          handleClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [panelIsOpen, showDeleteConfirmation]);

  const handleEdit = useCallback(() => {
    if (task) {
      openEditSidebar(task);
    }
  }, [task, openEditSidebar]);

  const handleClose = useCallback(() => {
    setActiveTab('overview');
    setShowDeleteConfirmation(false);
    onClose?.();
  }, [onClose]);

  // ──── Delete Handler ────
  const handleDelete = useCallback(async () => {
    if (!task) return;
    
    setIsDeleting(true);
    
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const taskTitle = task.title;
      deleteTask(task.id);
      
      // Close the sidebar first
      handleClose();
      
      // Show success toast
      toast.success('Task Deleted', {
        description: `"${taskTitle}" has been permanently deleted.`,
        duration: 4000,
        icon: <Trash2 size={18} />,
        action: {
          label: 'Undo',
          onClick: () => {
            toast.info('Undo not available', {
              description: 'This feature will be available in a future update.',
            });
          },
        },
      });
    } catch (error) {
      toast.error('Failed to delete', {
        description: 'An error occurred while deleting the task. Please try again.',
      });
      console.error('Failed to delete task:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [task, deleteTask, handleClose]);

  // Render task not found state
  if (!task) {
    return (
      <TaskViewLayout
        isOpen={panelIsOpen}
        zIndex={zIndex}
        onClose={handleClose}
        panelId={panelId}
        taskTitle="Task Not Found"
        icon={<Eye size={20} />}
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
      >
        <EmptyState
          icon={AlertCircle}
          title="Task Not Found"
          description="This task may have been deleted or you don't have access to it."
          isDarkMode={isDarkMode}
        />
      </TaskViewLayout>
    );
  }

  const renderTabContent = () => {
    // Show delete confirmation overlay
    if (showDeleteConfirmation) {
      return (
        <DeleteConfirmDialog
          taskTitle={task.title}
          isDarkMode={isDarkMode}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirmation(false)}
          isDeleting={isDeleting}
        />
      );
    }

    switch (activeTab) {
      case 'overview':
        return <OverviewTab task={task} isDarkMode={isDarkMode} />;
      case 'description':
        return <DescriptionTab task={task} isDarkMode={isDarkMode} />;
      case 'schedule':
        return <ScheduleTab task={task} isDarkMode={isDarkMode} />;
      case 'meta-docs':
        return <MetaDocsTab task={task} isDarkMode={isDarkMode} />;
      case 'related-tasks':
        return <RelatedTasksTab task={task} isDarkMode={isDarkMode} />;
      case 'related-notes':
        return <RelatedNotesTab task={task} isDarkMode={isDarkMode} />;
      default:
        return null;
    }
  };

  return (
    <TaskViewLayout
      isOpen={panelIsOpen}
      zIndex={zIndex}
      onClose={handleClose}
      panelId={panelId}
      taskTitle={task.title}
      icon={<Eye size={20} />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Action Buttons */}
      <div className={cn(
        "flex items-center justify-between mb-4 pb-3 border-b",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}>
        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
              "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20",
              "dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30",
              "shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
            )}
          >
            <Edit2 size={14} />
            Edit Task
          </button>

          {/* Delete Button */}
          {!showDeleteConfirmation && (
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                "bg-red-500/10 text-red-600 hover:bg-red-500/20",
                "dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30",
                "shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
              )}
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>

        {/* Task Status Badge */}
        <div className={cn(
          "px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider",
          isDarkMode ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
        )}>
          {task.status}
        </div>
      </div>

      {renderTabContent()}
    </TaskViewLayout>
  );
});

TaskViewSidebar.displayName = 'TaskViewSidebar';