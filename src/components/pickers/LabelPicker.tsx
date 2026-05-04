import React from 'react';
import { Tag } from 'lucide-react';
import { EntityPicker } from '@/components/ui/EntityPicker/EntityPicker';
import { useLabelStore } from '@/stores/label.store';

interface LabelPickerProps {
  selectedLabels: string[];
  onToggle: (labelId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const LabelPicker: React.FC<LabelPickerProps> = ({
  selectedLabels,
  onToggle,
  className,
  disabled = false,
}) => {
  const { labels, addLabel, deleteLabel } = useLabelStore();

  const items = labels.map(l => ({
    id: l.id,
    name: l.name,
    color: l.color,
  }));

  return (
    <EntityPicker
      items={items}
      selectedIds={selectedLabels}
      onToggle={onToggle}
      onCreate={(name, color) => addLabel(name, color || '#6B7280')}
      onDelete={deleteLabel}
      icon={<Tag size={12} />}
      label="Labels"
      placeholder="Select labels..."
      searchPlaceholder="Filter labels..."
      createPlaceholder="Label name..."
      showColorPicker={true}
      className={className}
      disabled={disabled}
    />
  );
};

LabelPicker.displayName = 'LabelPicker';