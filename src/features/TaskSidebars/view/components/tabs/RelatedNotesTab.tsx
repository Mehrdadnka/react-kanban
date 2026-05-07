// features/TaskSidebars/view/components/tabs/RelatedNotesTab.tsx
import React from 'react';
import { StickyNote, Plus, ExternalLink, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { SectionHeader } from '../shared/SectionHeader';
import { EmptyState } from '../shared/EmptyState';

interface RelatedNotesTabProps {
  task: Task;
  isDarkMode?: boolean;
}

// Note: This assumes relatedNotes would be stored in customFields
// You can adjust based on your actual data structure
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RelatedNotesTab: React.FC<RelatedNotesTabProps> = ({ task, isDarkMode }) => {
  // Placeholder for future implementation
  const notes: Note[] = task.customFields?.relatedNotes || [];

  if (notes.length === 0) {
    return (
      <EmptyState
        icon={StickyNote}
        title="No related notes"
        description="Quick notes will appear here once added"
        isDarkMode={isDarkMode}
        action={
          <button
            disabled
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg",
              "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
              "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus size={12} />
            Add Note (Coming Soon)
          </button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={StickyNote}
        title="Related Notes"
        description={`${notes.length} note${notes.length > 1 ? 's' : ''}`}
        isDarkMode={isDarkMode}
      />

      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "p-4 rounded-xl border transition-all duration-200",
              "hover:shadow-sm",
              isDarkMode
                ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                : "bg-gray-50 border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className={cn(
                "text-sm font-semibold",
                isDarkMode ? "text-gray-200" : "text-gray-800"
              )}>
                {note.title}
              </h4>
              <button
                className={cn(
                  "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                  isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-200 text-gray-500"
                )}
              >
                <ExternalLink size={12} />
              </button>
            </div>
            
            <p className={cn(
              "text-xs line-clamp-3 mb-3",
              isDarkMode ? "text-gray-400" : "text-gray-500"
            )}>
              {note.content}
            </p>
            
            <div className={cn(
              "flex items-center gap-1 text-[10px]",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              <Clock size={10} />
              <span>
                Updated {new Date(note.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};