import React from 'react';
import { Milestone } from 'lucide-react';
import { EntityPicker } from '@/components/ui/EntityPicker/EntityPicker';
import { useMilestoneStore } from '@/stores/milestone.store';

interface MilestonePickerProps {
  selectedMilestones: string[];
  onToggle: (milestoneId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const MilestonePicker: React.FC<MilestonePickerProps> = ({
  selectedMilestones,
  onToggle,
  className,
  disabled = false,
}) => {
  const { milestones, addMilestone, deleteMilestone } = useMilestoneStore();

  const items = milestones.map(m => ({
    id: m.id,
    name: m.name,
    color: m.color,
    metadata: {
      description: m.description,
      dueDate: m.dueDate,
    },
  }));

  return (
    <EntityPicker
      items={items}
      selectedIds={selectedMilestones}
      onToggle={onToggle}
      onCreate={(name, color) => addMilestone(name, color || '#6B7280')}
      onDelete={deleteMilestone}
      icon={<Milestone size={12} />}
      label="Milestones"
      placeholder="Select milestones..."
      searchPlaceholder="Filter milestones..."
      createPlaceholder="Milestone name..."
      showColorPicker={true}
      className={className}
      disabled={disabled}
      showAsSettingsButton={true}
    />
  );
};

MilestonePicker.displayName = 'MilestonePicker';