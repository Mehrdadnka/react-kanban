// src/features/TaskSidebars/create/steps/DetailsStep.tsx
import React from 'react';
import { FileText } from 'lucide-react';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor/MarkdownEditor';
import { cn } from '@/lib/utils';

interface DetailsStepProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  isDarkMode?: boolean;
  placeholder?: string;
}

export const DetailsStep: React.FC<DetailsStepProps> = ({
  value,
  onChange,
  disabled = false,
  isDarkMode = false,
  placeholder = 'Detailed task description with Markdown support...\n\n## Overview\nDescribe what this task is about.\n\n## Acceptance Criteria\n- [ ] Criterion 1\n- [ ] Criterion 2\n\n## Notes\nAny additional information...',
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-3">
      <div className="flex items-center gap-2">
        <FileText size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Full Description
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Use Markdown to format your description. This step is optional.
          </p>
        </div>
      </div>

      <div className={cn(
        "flex-1 min-h-[300px] lg:min-h-[500px] rounded-xl overflow-hidden border",
        isDarkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <MarkdownEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="h-full"
        />
      </div>
    </div>
  );
};

DetailsStep.displayName = 'DetailsStep';