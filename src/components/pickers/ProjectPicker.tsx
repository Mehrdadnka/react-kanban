import React from 'react';
import { FolderKanban } from 'lucide-react';
import { EntityPicker } from '@/components/ui/EntityPicker/EntityPicker';
import { useProjectStore } from '@/stores/project.store';

interface ProjectPickerProps {
  selectedProjects: string[];
  onToggle: (projectId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const ProjectPicker: React.FC<ProjectPickerProps> = ({
  selectedProjects,
  onToggle,
  className,
  disabled = false,
}) => {
  const { projects, addProject, deleteProject } = useProjectStore();

  const items = projects.map(p => ({
    id: p.id,
    name: p.name,
    color: p.color,
    metadata: {
      description: p.description,
      status: p.status,
    },
  }));

  return (
    <EntityPicker
      items={items}
      selectedIds={selectedProjects}
      onToggle={onToggle}
      onCreate={(name, color) => addProject(name, color || '#3B82F6')}
      onDelete={deleteProject}
      icon={<FolderKanban size={12} />}
      label="Projects"
      placeholder="Select projects..."
      searchPlaceholder="Filter projects..."
      createPlaceholder="Project name..."
      showColorPicker={true}
      className={className}
      disabled={disabled}
      showAsSettingsButton
    />
  );
};

ProjectPicker.displayName = 'ProjectPicker';