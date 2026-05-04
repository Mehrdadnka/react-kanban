// src/features/TaskSidebars/create/steps/MetaStep.tsx
import React from 'react';
import { FileText, Trash2, Upload, Tag } from 'lucide-react';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
}

interface MetaStepProps {
  attachments: Attachment[];
  estimatedHours: number | undefined;
  isViewMode: boolean;
  isDarkMode?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAttachmentClick: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAttachmentDrop: (event: React.DragEvent) => void;
  onAttachmentRemove: (attachmentId: string) => void;
  onEstimatedHoursChange: (hours: number | undefined) => void;
}

export const MetaStep: React.FC<MetaStepProps> = ({
  attachments,
  estimatedHours,
  isViewMode,
  isDarkMode = false,
  fileInputRef,
  onAttachmentClick,
  onFileSelect,
  onAttachmentDrop,
  onAttachmentRemove,
  onEstimatedHoursChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Tag size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Meta Information
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Add attachments and estimates. All fields are optional.
          </p>
        </div>
      </div>

      {/* File Upload Area */}
      <div>
        <label className={cn(
          "text-sm mb-2 block font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          Attachments
        </label>

        <div
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center',
            'transition-all duration-200 cursor-pointer group',
            isDarkMode
              ? 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30',
            isViewMode && 'opacity-50 cursor-not-allowed pointer-events-none'
          )}
          onDrop={(e) => {
            if (!isViewMode) onAttachmentDrop(e);
          }}
          onDragOver={(e) => {
            if (!isViewMode) e.preventDefault();
          }}
          onClick={() => {
            if (!isViewMode) onAttachmentClick();
          }}
        >
          <Upload
            size={28}
            className={cn(
              "mx-auto mb-3 transition-transform group-hover:scale-110",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}
          />
          <p className={cn("text-sm mb-1", isDarkMode ? "text-gray-300" : "text-gray-600")}>
            Drop files, images, or documents here
          </p>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            PDF, DOC, TXT, MD, JS/TS, JSON, CSV, Images
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.md,.js,.ts,.jsx,.tsx,.json,.csv"
        />

        {/* Attachment List */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs group transition-all',
                  isDarkMode
                    ? 'bg-gray-800/70 hover:bg-gray-800 border border-gray-700/50'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200/50'
                )}
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-sm"
                  />
                ) : (
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  )}>
                    <FileText size={16} className="text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isDarkMode ? "text-gray-200" : "text-gray-700"
                  )}>
                    {att.name}
                  </p>
                  <p className={cn(
                    "text-[10px] uppercase tracking-wider mt-0.5",
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  )}>
                    {att.type}
                  </p>
                </div>

                {!isViewMode && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAttachmentRemove(att.id);
                    }}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      "opacity-0 group-hover:opacity-100",
                      "text-red-400 hover:text-red-600",
                      "hover:bg-red-50 dark:hover:bg-red-900/30"
                    )}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estimated Hours */}
      <SidebarInput
        id="estimated-hours"
        label="Estimated Hours"
        value={estimatedHours?.toString() || ''}
        onChange={(v) => {
          const num = v ? parseInt(v, 10) : undefined;
          onEstimatedHoursChange(num && !isNaN(num) && num > 0 ? num : undefined);
        }}
        placeholder="e.g., 4"
        disabled={isViewMode}
      />

      {/* Related Tasks (placeholder for future) */}
      <div>
        <label className={cn(
          "text-sm mb-1.5 block font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          Related Tasks
        </label>
        <div className={cn(
          "p-4 rounded-lg border border-dashed text-center",
          isDarkMode ? "border-gray-700" : "border-gray-300"
        )}>
          <p className={cn(
            "text-xs italic",
            isDarkMode ? "text-gray-500" : "text-gray-400"
          )}>
            Task linking coming soon...
          </p>
        </div>
      </div>
    </div>
  );
};

MetaStep.displayName = 'MetaStep';