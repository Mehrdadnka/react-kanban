// src/features/TaskSidebar/components/QuickCreate.tsx
import React from 'react';
import { 
  AlertCircle, FileText, Flag, Target, Zap 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useColumnStore } from '@/stores/column.store';
import { TaskType, TaskPriority } from '@/types/task.types';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { SidebarSelect } from '@/components/sidebar-ui-engine/SidebarSelect';
import StatusIcon from './StatusIcon';
import { LabelPicker } from '@/components/pickers/LabelPicker';
import { MilestonePicker } from '@/components/pickers/MilestonePicker';
import { ProjectPicker } from '@/components/pickers/ProjectPicker';

export interface QuickCreateFormState {
  title: string;
  shortDescription: string;
  type: TaskType;
  priority: TaskPriority;
  columnId: string;
  labels: string[];
  milestoneIds: string[];
  projectIds: string[];
}

interface QuickCreateProps {
  isViewMode: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  formState: QuickCreateFormState;
  updateFormField: <K extends keyof QuickCreateFormState>(field: K, value: QuickCreateFormState[K]) => void;
}

export const QuickCreate: React.FC<QuickCreateProps> = ({ 
  isViewMode, 
  inputRef, 
  formState, 
  updateFormField 
}) => {
  const { isDarkMode } = useApp();
  const { columns } = useColumnStore();

  const dynamicColumnOptions = columns
    .sort((a, b) => a.order - b.order)
    .map(col => ({
      value: col.id,
      label: col.title,
      icon: <StatusIcon columnId={col.id} size={16} />,
    }));

  return (
    <div className="space-y-4">
      <div className="relative">
        <SidebarInput
          id="task-title"
          required={true}
          label="Title"
          value={formState.title}
          onChange={(v) => updateFormField('title', v)}
          placeholder="Enter task title..."
          disabled={isViewMode}
          inputRef={inputRef}
        />
      </div>

      <div>
        <SidebarInput
          required={true}
          id="short-desc"
          label="Short Description"
          value={formState.shortDescription}
          onChange={(v) => updateFormField('shortDescription', v)}
          placeholder="Brief summary in one line..."
          disabled={isViewMode}
        />
        <p className={cn(
          "text-xs mt-1",
          isDarkMode ? "text-gray-500" : "text-gray-400"
        )}>
          {formState.shortDescription.length}/200 characters
        </p>
      </div>

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

      <SidebarSelect
        id="task-column"
        label="Status"
        value={formState.columnId}
        onValueChange={(v) => updateFormField('columnId', v)}
        options={dynamicColumnOptions}
        disabled={isViewMode}
      />

      <div>
        <label className={cn(
          "text-sm mb-1.5 block",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          Labels
        </label>
        <LabelPicker
          selectedLabels={formState.labels}
          onToggle={(labelId) => {
            const newLabels = formState.labels.includes(labelId)
              ? formState.labels.filter(id => id !== labelId)
              : [...formState.labels, labelId];
            updateFormField('labels', newLabels);
          }}
          disabled={isViewMode}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={cn(
            "text-sm mb-1.5 block",
            isDarkMode ? "text-gray-300" : "text-gray-700"
          )}>
            Milestones
          </label>
          <MilestonePicker
            selectedMilestones={formState.milestoneIds}
            onToggle={(milestoneId) => {
              const newMilestones = formState.milestoneIds.includes(milestoneId)
                ? formState.milestoneIds.filter(id => id !== milestoneId)
                : [...formState.milestoneIds, milestoneId];
              updateFormField('milestoneIds', newMilestones);
            }}
            disabled={isViewMode}
          />
        </div>
        <div>
          <label className={cn(
            "text-sm mb-1.5 block",
            isDarkMode ? "text-gray-300" : "text-gray-700"
          )}>
            Projects
          </label>
          <ProjectPicker
            selectedProjects={formState.projectIds}
            onToggle={(projectId) => {
              const newProjects = formState.projectIds.includes(projectId)
                ? formState.projectIds.filter(id => id !== projectId)
                : [...formState.projectIds, projectId];
              updateFormField('projectIds', newProjects);
            }}
            disabled={isViewMode}
          />
        </div>
      </div>
    </div>
  );
};

QuickCreate.displayName = 'QuickCreate';