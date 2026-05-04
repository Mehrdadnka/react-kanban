// src/features/TaskSidebar/components/QuickCreate.tsx

import React from 'react';
import { 
  AlertCircle, Hash, FileText, Tag, Flag, 
  Target, Layout, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { useColumnStore } from '@/stores/column.store';
import { TaskType, TaskPriority } from '@/types/task.types';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { SidebarSelect } from '@/components/sidebar-ui-engine/SidebarSelect';
import StatusIcon from './StatusIcon';
import PriorityBadge from './PriorityBadge';
import { getColumnLabel } from '../utils';

interface QuickCreateProps {
  isViewMode: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export const QuickCreate: React.FC<QuickCreateProps> = ({ isViewMode, inputRef }) => {
  const { isDarkMode } = useApp();
  const { columns } = useColumnStore();
  const { formState, updateFormField } = useTaskSidebarStore();

  const dynamicColumnOptions = columns
    .sort((a, b) => a.order - b.order)
    .map(col => ({
      value: col.id,
      label: col.title,
      icon: <StatusIcon columnId={col.id} size={16} />,
    }));

  return (
    <div className="space-y-4">
      {/* Title - الزامی با آیکون خطا اگه خالی باشه */}
      <div className="relative">
        <SidebarInput
          id="task-title"
          label={
            <span className="flex items-center gap-1">
              Title <span className="text-red-500">*</span>
            </span>
          }
          value={formState.title}
          onChange={(v) => updateFormField('title', v)}
          placeholder="Enter task title..."
          disabled={isViewMode}
          inputRef={inputRef}
        />
        {!formState.title && !isViewMode && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            Title is required
          </p>
        )}
      </div>

      {/* Short Description - الزامی */}
      <div>
        <SidebarInput
          id="short-desc"
          label={
            <span className="flex items-center gap-1">
              Short Description <span className="text-red-500">*</span>
            </span>
          }
          value={formState.shortDescription}
          onChange={(v) => updateFormField('shortDescription', v)}
          placeholder="Brief summary in one line..."
          disabled={isViewMode}
        />
        <p className="text-xs text-gray-400 mt-1">
          {formState.shortDescription.length}/200 characters
        </p>
      </div>

      {/* ۲ ستونه: Type + Priority */}
      <div className="grid grid-cols-2 gap-4">
        <SidebarSelect
          id="task-type"
          label="Type"
          value={formState.type}
          onValueChange={(v) => updateFormField('type', v as TaskType)}
          options={[
            { value: 'task', label: 'Task', icon: <FileText size={16} /> },
            { value: 'bug', label: 'Bug', icon: <AlertCircle size={16} /> },
            { value: 'milestone', label: 'Milestone', icon: <Target size={16} /> },
            { value: 'epic', label: 'Epic', icon: <Zap size={16} /> },
          ]}
          disabled={isViewMode}
        />
        <SidebarSelect
          id="task-priority"
          label="Priority"
          value={formState.priority}
          onValueChange={(v) => updateFormField('priority', v as TaskPriority)}
          options={[
            { value: 'low', label: 'Low', icon: <Flag size={16} className="text-gray-400" /> },
            { value: 'medium', label: 'Medium', icon: <Flag size={16} className="text-blue-400" /> },
            { value: 'high', label: 'High', icon: <Flag size={16} className="text-orange-400" /> },
            { value: 'urgent', label: 'Urgent', icon: <Flag size={16} className="text-red-500" /> },
          ]}
          disabled={isViewMode}
        />
      </div>

      {/* Status (Column) */}
      <SidebarSelect
        id="task-column"
        label="Status"
        value={formState.columnId}
        onValueChange={(v) => updateFormField('columnId', v)}
        options={dynamicColumnOptions}
        disabled={isViewMode}
      />

      {/* Labels - بعداً LabelPicker اضافه می‌کنیم */}
      <div>
        <label className={cn(
          "text-sm mb-1.5 block",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          Labels
        </label>
        {/* اینجا LabelPicker قرار می‌گیره */}
        <p className="text-xs text-gray-400 italic">Label picker coming soon</p>
      </div>

      {/* Milestone & Project */}
      <div className="grid grid-cols-2 gap-4">
<SidebarSelect
  id="milestone"
  label="Milestone"
  value={formState.milestone || 'none'}  // ← به جای '' از 'none' استفاده کن
  onValueChange={(v) => updateFormField('milestone', v === 'none' ? undefined : v)}
  options={[
    { value: 'none', label: 'None' },  // ← اینجا
    { value: 'm1', label: 'Sprint 1' },
    { value: 'm2', label: 'Sprint 2' },
  ]}
  disabled={isViewMode}
/>
<SidebarSelect
  id="project"
  label="Project"
  value={formState.project || 'none'}  // ← به جای '' از 'none' استفاده کن
  onValueChange={(v) => updateFormField('project', v === 'none' ? undefined : v)}
  options={[
    { value: 'none', label: 'None' },  // ← اینجا
    { value: 'p1', label: 'Frontend' },
    { value: 'p2', label: 'Backend' },
  ]}
  disabled={isViewMode}
/>
      </div>
    </div>
  );
};