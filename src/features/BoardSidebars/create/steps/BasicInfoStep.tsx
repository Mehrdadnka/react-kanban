// features/BoardSidebars/create/steps/BasicInfoStep.tsx
import React from 'react';
import { FileText } from 'lucide-react';
import { SidebarInput, SidebarTextarea } from '@/components/sidebar-ui-engine';
import { cn } from '@/lib/utils';

interface BasicInfoStepProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isDarkMode?: boolean;
  disabled?: boolean;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  isDarkMode = false,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Basic Information
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Give your board a name and description.
          </p>
        </div>
      </div>

      <SidebarInput
        id="board-title"
        label="Board Name"
        value={title}
        onChange={onTitleChange}
        placeholder="e.g., Marketing Campaign, Sprint 24..."
        required
        disabled={disabled}
      />

      <SidebarTextarea
        id="board-description"
        label="Description"
        value={description}
        onChange={onDescriptionChange}
        placeholder="What's this board about?"
        rows={4}
        disabled={disabled}
      />
    </div>
  );
};