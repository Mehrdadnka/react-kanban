import React, { useState } from 'react';
import { FileText, Flag, Tag, Milestone, FolderKanban, Columns3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useColumnStore } from '@/stores/column.store';
import { useLabelStore } from '@/stores/label.store';
import { useMilestoneStore } from '@/stores/milestone.store';
import { useProjectStore } from '@/stores/project.store';
import { TaskType, TaskPriority } from '@/types/task.types';
import { EntityPicker } from '@/components/ui/EntityPicker/EntityPicker';
import StatusIcon from '../StatusIcon';
import { PRIORITY_CONFIG, TYPE_CONFIG } from './config/config';
import MetaRow from '../metaRow/MetaRow';
import MainInput from './components/MainInput';

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

// ──── Component ────
export const QuickCreate: React.FC<QuickCreateProps> = ({ 
  inputRef, 
  formState, 
  updateFormField 
}) => {
  const { isDarkMode } = useApp();
  const { columns } = useColumnStore();
  const { labels, addLabel, deleteLabel } = useLabelStore();
  const { milestones, addMilestone, deleteMilestone } = useMilestoneStore();
  const { projects, addProject, deleteProject } = useProjectStore();

  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ──── EntityPicker items ────
  const typeItems = Object.entries(TYPE_CONFIG).map(([value, config]) => ({
    id: value,
    name: config.label,
    icon: config.icon,
    color: value === formState.type ? '#3B82F6' : undefined,
  }));

  const priorityItems = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
    id: value,
    name: config.label,
    color: config.color,
    icon: config.icon,
  }));

  const columnItems = columns
    .sort((a, b) => a.order - b.order)
    .map(col => ({
      id: col.id,
      name: col.title,
      color: col.color,
      icon: <StatusIcon columnId={col.id} size={12} />,
    }));

  const labelItems = labels.map(l => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));

  const milestoneItems = milestones.map(m => ({
    id: m.id,
    name: m.name,
    color: m.color,
  }));

  const projectItems = projects.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
  }));

  // ──── Selected display ────
  function isValidType(type: string): type is keyof typeof TYPE_CONFIG {
    return type in TYPE_CONFIG;
  }

  const selectedType = isValidType(formState.type) 
  ? TYPE_CONFIG[formState.type] 
  : TYPE_CONFIG.task; // fallback to task if invalid


  return (
    <div className="space-y-5">
      {/* ──── Main Inputs (Always visible, prominent) ──── */}
      <div className="space-y-4">
        {/* Title */}
        <MainInput 
          id="task-title"
          label="Title"
          title={formState.title}
          onChange={(v) => updateFormField('title', v)}
          placeholder="Enter task title..."
          inputRef={inputRef}
          titleLen={100}
        />
        {/* Short Description */}
        <MainInput 
          id="short-desc"
          label="Short Description"
          title={formState.shortDescription}
          onChange={(v) => updateFormField('shortDescription', v)}
          placeholder="Brief summary in one line..." 
          titleLen={200}        
        />
      </div>

      {/* ──── Divider ──── */}
      <div className={cn(
        "border-t",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )} />

      {/* ──── Metadata Section ──── */}
      <div className="space-y-0">
        <div className="grid grid-cols-2 gap-2 ">
          {/* Type */}
          <MetaRow icon={<FileText size={14} />} label="Type" isDarkMode={isDarkMode}>
            <EntityPicker
              items={typeItems}
              selectedIds={[formState.type]}
              onToggle={(id) => {
                updateFormField('type', id as TaskType);
                setOpenDropdown(null);
              }}
              label="Type"
              cardPlaceholder="Select type"
              searchPlaceholder="Filter types..."
              compact  
              className="flex-1"
            />
          </MetaRow>

          <MetaRow icon={<Columns3 size={14} />} label="Status" isDarkMode={isDarkMode}>
            <EntityPicker
              items={columnItems}
              selectedIds={[formState.columnId]}
              onToggle={(id) => {
                updateFormField('columnId', id);
                setOpenDropdown(null);
              }}
              label="Status"
              cardPlaceholder="Select status"
              searchPlaceholder="Filter columns..."
              compact
              className="flex-1"
            />
          </MetaRow>

          <MetaRow icon={<Flag size={14} />} label="Priority" isDarkMode={isDarkMode}>
            <EntityPicker
              items={priorityItems}
              selectedIds={[formState.priority]}
              onToggle={(id) => {
                updateFormField('priority', id as TaskPriority);
                setOpenDropdown(null);
              }}
              label="Priority"
              cardPlaceholder="Select priority"
              searchPlaceholder="Filter..."
              compact
              className="flex-1"
            />
          </MetaRow>

          {/* Labels */}
          <MetaRow icon={<Tag size={14} />} label="Labels" isDarkMode={isDarkMode}>
            <EntityPicker
              items={labelItems}
              selectedIds={formState.labels}
              onToggle={(id) => {
                updateFormField('labels',
                  formState.labels.includes(id)
                    ? formState.labels.filter(l => l !== id)
                    : [...formState.labels, id]
                );
              }}
              onCreate={(name, color) => addLabel(name, color || '#6B7280')}
              onDelete={deleteLabel}
              label="Labels"
              cardPlaceholder="Add labels"
              searchPlaceholder="Filter labels..."
              createPlaceholder="Label name..."
              showColorPicker
              compact
              className="flex-1"
            />
          </MetaRow>

          {/* Milestone */}
          <MetaRow icon={<Milestone size={14} />} label="Milestone" isDarkMode={isDarkMode}>
            <EntityPicker
              items={milestoneItems}
              selectedIds={formState.milestoneIds}
              onToggle={(id) => {
                updateFormField('milestoneIds',
                  formState.milestoneIds.includes(id)
                    ? formState.milestoneIds.filter(m => m !== id)
                    : [...formState.milestoneIds, id]
                );
              }}
              onCreate={(name, color) => addMilestone(name, color || '#6B7280')}
              onDelete={deleteMilestone}
              placeholder="Add milestone"
              searchPlaceholder="Filter milestones..."
              createPlaceholder="Milestone name..."
              label='Milestone'
              showColorPicker
              compact
              className="flex-1"
            />
          </MetaRow>

          {/* Project */}
          <MetaRow icon={<FolderKanban size={14} />} label="Project" isDarkMode={isDarkMode}>
            <EntityPicker
              items={projectItems}
              selectedIds={formState.projectIds}
              onToggle={(id) => {
                updateFormField('projectIds',
                  formState.projectIds.includes(id)
                    ? formState.projectIds.filter(p => p !== id)
                    : [...formState.projectIds, id]
                );
              }}
              onCreate={(name, color) => addProject(name, color || '#3B82F6')}
              onDelete={deleteProject}
              label='Project'
              placeholder="Add project"
              searchPlaceholder="Filter projects..."
              createPlaceholder="Project name..."
              showColorPicker
              compact
              className="flex-1"
            />
          </MetaRow>
        </div>

      </div>
    </div>
  );
};

QuickCreate.displayName = 'QuickCreate';