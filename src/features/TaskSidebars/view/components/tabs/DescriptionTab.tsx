import React, { useState, useCallback } from 'react';
import { 
  FileText, Eye, Pencil, Maximize2, Minimize2, 
  Save, X, Check, Copy, Clock 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { SectionHeader } from '../shared/SectionHeader';
import { EmptyState } from '../shared/EmptyState';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor/MarkdownEditor';
import { useTaskStore } from '@/stores/task.store';
import { toast } from 'sonner';

interface DescriptionTabProps {
  task: Task;
  isDarkMode?: boolean;
  editable?: boolean; // برای آینده: فعال/غیرفعال کردن ویرایش
}

export const DescriptionTab: React.FC<DescriptionTabProps> = ({ 
  task, 
  isDarkMode,
  editable = true // پیش‌فرض: قابل ویرایش
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editorContent, setEditorContent] = useState(task.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const { updateTask } = useTaskStore();

  // ──── Save Handler ────
  const handleSave = useCallback(async () => {
    if (!editable) return;
    
    setIsSaving(true);
    try {
      updateTask(task.id, { description: editorContent });
      toast.success('Description saved', {
        description: 'Task description has been updated successfully.',
        icon: <Check size={16} />,
      });
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save', {
        description: 'Could not save the description. Please try again.',
      });
      console.error('Failed to save description:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editorContent, task.id, updateTask, editable]);

  // ──── Cancel Handler ────
  const handleCancel = useCallback(() => {
    setEditorContent(task.description || '');
    setIsEditing(false);
  }, [task.description]);

  // ──── Toggle Edit/Preview ────
  const toggleEditMode = useCallback(() => {
    if (isEditing) {
      // Going to preview mode - show current content
      setIsEditing(false);
    } else {
      // Going to edit mode - sync content
      setEditorContent(task.description || '');
      setIsEditing(true);
    }
  }, [isEditing, task.description]);

  // ──── Keyboard Shortcuts ────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isEditing) {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    }
  }, [isEditing, handleSave, handleCancel]);

  // ──── Copy to Clipboard ────
  const handleCopyDescription = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(task.description || '');
      toast.success('Copied to clipboard', {
        description: 'Description has been copied to your clipboard.',
      });
    } catch (error) {
      toast.error('Failed to copy');
    }
  }, [task.description]);

  // ──── Content Stats ────
  const getContentStats = (content: string) => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    const lines = content.split('\n').length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed
    
    return { words, chars, lines, readTime };
  };

  const stats = getContentStats(task.description || '');

  // ──── اگر توضیحی وجود نداره و در حالت ویرایش نیستیم ────
  if (!task.description && !isEditing) {
    return (
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        <SectionHeader
          icon={FileText}
          title="Description"
          description="No description yet. Add one to provide more context."
          isDarkMode={isDarkMode}
        />
        
        <EmptyState
          icon={FileText}
          title="No description"
          description="Add a detailed description using our rich text editor with markdown support."
          isDarkMode={isDarkMode}
          action={
            editable && (
              <button
                onClick={() => {
                  setEditorContent('');
                  setIsEditing(true);
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                  "bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow-md",
                  "transform hover:scale-105 active:scale-95"
                )}
              >
                <Pencil size={14} />
                Add Description
              </button>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      {/* ──── Header with Actions ──── */}
      <SectionHeader
        icon={FileText}
        title="Description"
        description={
          isEditing 
            ? "Edit your description with rich text and markdown" 
            : "Full task description with markdown support"
        }
        isDarkMode={isDarkMode}
        action={
          <div className="flex items-center gap-1">
            {/* Copy Button (Preview Mode) */}
            {!isEditing && task.description && (
              <button
                onClick={handleCopyDescription}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                )}
                title="Copy description"
              >
                <Copy size={14} />
              </button>
            )}

            {/* Expand/Collapse Button */}
            {!isEditing && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDarkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                )}
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            )}

            {/* Edit/Save/Cancel Buttons */}
            {editable && (
              <>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                        "bg-green-500 hover:bg-green-600 text-white",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={12} />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className={cn(
                        "p-1.5 rounded-lg transition-colors",
                        isDarkMode
                          ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                          : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                      )}
                      title="Cancel (Esc)"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={toggleEditMode}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                      isDarkMode
                        ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
                      "shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                    )}
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* ──── Content Area ──── */}
      <div className={cn(
        "rounded-xl transition-all duration-300 overflow-hidden",
        isDarkMode ? "border border-gray-800" : "border border-gray-200",
        isEditing && "ring-2 ring-blue-500/20"
      )}>
        {isEditing ? (
          // ──── Edit Mode: Full Markdown Editor ────
          <div className="min-h-[400px]">
            <MarkdownEditor
              value={editorContent}
              onChange={setEditorContent}
              placeholder="Write a detailed description...&#10;&#10;## Overview&#10;Describe the task overview here.&#10;&#10;## Acceptance Criteria&#10;- [ ] Criterion 1&#10;- [ ] Criterion 2&#10;&#10;## Notes&#10;Any additional information..."
              disabled={!editable}
              className="!border-0 !rounded-none"
              minHeight="400px"
            />
          </div>
        ) : (
          // ──── Preview Mode: Render Content ────
          <div className={cn(
            "p-6 transition-all duration-300",
            isExpanded ? "max-h-none" : "max-h-[600px] overflow-y-auto",
            isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50"
          )}>
            {/* Rich Text Content */}
            <div 
              className={cn(
                "prose prose-sm max-w-none",
                isDarkMode ? "prose-invert" : "",
                // TipTap specific styles
                "prose-headings:font-semibold prose-headings:tracking-tight",
                "prose-h1:text-2xl prose-h1:mt-8 prose-h1:mb-4",
                "prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4",
                "prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-3",
                "prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2",
                "prose-p:text-sm prose-p:leading-relaxed prose-p:my-2",
                "prose-code:text-xs prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md",
                "prose-code:bg-gray-200 dark:prose-code:bg-gray-700",
                "prose-code:text-pink-600 dark:prose-code:text-pink-400",
                "prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950",
                "prose-pre:text-gray-100 prose-pre:text-xs prose-pre:rounded-xl",
                "prose-pre:shadow-lg prose-pre:border prose-pre:border-gray-800",
                "prose-ul:text-sm prose-ul:my-2 prose-ul:list-disc",
                "prose-ol:text-sm prose-ol:my-2 prose-ol:list-decimal",
                "prose-li:my-1 prose-li:leading-relaxed",
                "prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:py-1",
                "prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400",
                "prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400",
                "prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10",
                "prose-blockquote:rounded-r-lg",
                "prose-a:text-blue-500 hover:prose-a:text-blue-600 prose-a:underline",
                "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
                "prose-strong:font-semibold",
                "prose-img:rounded-xl prose-img:shadow-md",
                "prose-hr:border-gray-200 dark:prose-hr:border-gray-700",
                // Table styles
                "prose-table:text-xs",
                "prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:font-semibold",
                "prose-th:px-3 prose-th:py-2 prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700",
                "prose-td:px-3 prose-td:py-2 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700",
                // Task lists
                "prose-ul:list-none prose-ul:pl-0",
                "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0",
                "[&_li[data-type='taskItem']]:flex [&_li[data-type='taskItem']]:items-start [&_li[data-type='taskItem']]:gap-2",
                "[&_li[data-type='taskItem']>label]:mt-1",
              )}
              dangerouslySetInnerHTML={{ __html: task.description || '' }}
            />
          </div>
        )}
      </div>

      {/* ──── Stats Bar (Preview Mode) ──── */}
      {!isEditing && task.description && (
        <div className={cn(
          "flex items-center gap-4 px-4 py-2 rounded-lg text-xs",
          isDarkMode ? "bg-gray-800/50 text-gray-500" : "bg-gray-50 text-gray-400"
        )}>
          <div className="flex items-center gap-1.5">
            <FileText size={12} />
            <span>{stats.chars.toLocaleString()} chars</span>
          </div>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
          <span>{stats.words.toLocaleString()} words</span>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
          <span>{stats.lines} lines</span>
          <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>~{stats.readTime} min read</span>
          </div>
          {isExpanded && (
            <>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
              <button
                onClick={() => setIsExpanded(false)}
                className={cn(
                  "hover:text-blue-500 transition-colors",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}
              >
                Collapse
              </button>
            </>
          )}
        </div>
      )}

      {/* ──── Editing Tips (Edit Mode) ──── */}
      {isEditing && (
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg text-xs",
          isDarkMode ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-600"
        )}>
          <div className="flex items-center gap-3">
            <span className="font-medium">Pro tips:</span>
            <span>Use <kbd className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-mono",
              isDarkMode ? "bg-blue-800/50 border border-blue-700" : "bg-blue-100 border border-blue-200"
            )}>#</kbd> for headings</span>
            <span>Use <kbd className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-mono",
              isDarkMode ? "bg-blue-800/50 border border-blue-700" : "bg-blue-100 border border-blue-200"
            )}>- [ ]</kbd> for tasks</span>
            <span><kbd className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-mono",
              isDarkMode ? "bg-blue-800/50 border border-blue-700" : "bg-blue-100 border border-blue-200"
            )}>Ctrl+S</kbd> to save</span>
          </div>
        </div>
      )}
    </div>
  );
};