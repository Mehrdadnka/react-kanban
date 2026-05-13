// features/TaskSidebars/view/components/tabs/MetaDocsTab.tsx
import React, { useState } from 'react';
import { 
  FileText, Image, FileCode, Download, ExternalLink, 
  Clock, Paperclip, Trash2, Eye, File
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task, Attachment } from '@/types/task.types';
import { SectionHeader } from '../shared/SectionHeader';
import { EmptyState } from '../shared/EmptyState';
import { useTaskStore } from '@/stores/task.store';

interface MetaDocsTabProps {
  task: Task;
  isDarkMode?: boolean;
}

const FileIconMap: Record<string, React.ElementType> = {
  image: Image,
  video: File,
  document: FileText,
  file: File,
  code: FileCode,
  other: File,
};

const getFileIcon = (type: string) => FileIconMap[type] || File;

export const MetaDocsTab: React.FC<MetaDocsTabProps> = ({ task, isDarkMode }) => {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const { removeAttachment } = useTaskStore();

  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasEstimatedHours = task.estimatedHours !== undefined && task.estimatedHours > 0;
  const hasTimeSpent = task.timeSpent !== undefined && task.timeSpent > 0;

  if (!hasAttachments && !hasEstimatedHours) {
    return (
      <EmptyState
        icon={Paperclip}
        title="No attachments or meta data"
        description="Add files, images, or documents to this task"
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Attachments Section */}
      {hasAttachments && (
        <div>
          <SectionHeader
            icon={Paperclip}
            title="Attachments"
            description={`${task.attachments.length} file${task.attachments.length > 1 ? 's' : ''} attached`}
            isDarkMode={isDarkMode}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {task.attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.type);
              const isImage = attachment.type === 'image';
              
              return (
                <div
                  key={attachment.id}
                  className={cn(
                    "group relative rounded-xl border transition-all duration-200",
                    isDarkMode
                      ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                      : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  )}
                >
                  {/* Image Preview */}
                  {isImage && attachment.thumbnailUrl ? (
                    <div className="relative h-32 rounded-t-xl overflow-hidden">
                      <img
                        src={attachment.thumbnailUrl || attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewAttachment(attachment)}
                      />
                      <div className={cn(
                        "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors",
                        "flex items-center justify-center"
                      )}>
                        <button
                          onClick={() => setPreviewAttachment(attachment)}
                          className={cn(
                            "p-2 rounded-full bg-black/50 text-white",
                            "opacity-0 group-hover:opacity-100 transition-opacity",
                            "hover:bg-black/70"
                          )}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={cn(
                      "flex items-center gap-3 p-4",
                      isImage && "h-32 rounded-t-xl"
                    )}>
                      <div className={cn(
                        "p-2.5 rounded-lg flex-shrink-0",
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      )}>
                        <Icon size={20} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
                      </div>
                    </div>
                  )}
                  
                  {/* File Info */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <p className={cn(
                      "text-xs font-medium truncate",
                      isDarkMode ? "text-gray-200" : "text-gray-700"
                    )}>
                      {attachment.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="uppercase">{attachment.type}</span>
                        {attachment.size && (
                          <>
                            <span>•</span>
                            <span>{formatFileSize(attachment.size)}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          )}
                          title="Download"
                        >
                          <Download size={12} />
                        </a>
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                            isDarkMode ? "text-gray-400" : "text-gray-500"
                          )}
                          title="Open in new tab"
                        >
                          <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => removeAttachment(task.id, attachment.id)}
                          className={cn(
                            "p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30",
                            "text-red-400 hover:text-red-600"
                          )}
                          title="Remove"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Time Tracking Section */}
      {(hasEstimatedHours || hasTimeSpent) && (
        <div>
          <SectionHeader
            icon={Clock}
            title="Time Tracking"
            description="Estimated and logged hours"
            isDarkMode={isDarkMode}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasEstimatedHours && (
              <div className={cn(
                "p-4 rounded-xl text-center",
                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
              )}>
                <p className={cn(
                  "text-xs font-medium mb-2 uppercase tracking-wider",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Estimated
                </p>
                <p className={cn(
                  "text-3xl font-bold",
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                )}>
                  {task.estimatedHours}h
                </p>
              </div>
            )}
            
            {hasTimeSpent && (
              <div className={cn(
                "p-4 rounded-xl text-center",
                isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
              )}>
                <p className={cn(
                  "text-xs font-medium mb-2 uppercase tracking-wider",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  Time Spent
                </p>
                <p className={cn(
                  "text-3xl font-bold",
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                )}>
                  {task.timeSpent}h
                </p>
                {hasEstimatedHours && (
                  <p className={cn(
                    "text-xs mt-1",
                    task.timeSpent! > task.estimatedHours!
                      ? "text-red-400"
                      : "text-green-400"
                  )}>
                    {task.timeSpent! > task.estimatedHours!
                      ? `${Math.round((task.timeSpent! - task.estimatedHours!) / task.estimatedHours! * 100)}% over`
                      : `${Math.round((task.timeSpent! / task.estimatedHours!) * 100)}% of estimate`
                    }
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {hasEstimatedHours && hasTimeSpent && (
            <div className="mt-4">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    task.timeSpent! > task.estimatedHours!
                      ? "bg-red-500"
                      : "bg-gradient-to-r from-blue-500 to-green-500"
                  )}
                  style={{
                    width: `${Math.min((task.timeSpent! / task.estimatedHours!) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      {previewAttachment && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewAttachment(null)}
        >
          <img
            src={previewAttachment.url}
            alt={previewAttachment.name}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
};

// Helper function
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}