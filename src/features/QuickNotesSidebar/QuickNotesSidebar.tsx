// features/QuickNotesSidebar/QuickNotesSidebar.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Plus, Pin, Trash2, ExternalLink, 
  Calendar, Clock, ArrowLeft, Save, Edit3, 
  AlertCircle, CheckCircle2, Search, X
} from 'lucide-react';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { useQuickNotesStore } from '@/stores/quick-notes.store';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { useTaskStore } from '@/stores/task.store';
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { SidebarTextarea } from '@/components/sidebar-ui-engine/SidebarTextarea';
import { Tab } from '@/components/ui/tab/Tab';
import { Badge } from '@/components/ui/badge/Badge';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { usePanelIconComponent } from '@/hooks/usePanelIcon';

// آیکون اختصاصی برای Quick Notes (مشابه استایل پروژه)
const QuickNoteIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

// تعریف تب‌ها
type QuickNoteTab = 'new' | 'list';

export const QuickNotesSidebar: React.FC<PanelProps> = ({ 
  isOpen, 
  onClose, 
  panelId, 
  isDarkMode,
  metadata 
}) => {
  const {
    notes,
    currentNote,
    isEditing,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    linkToTask,
    setCurrentNote,
    setIsEditing,
    closeQuickNotes,
  } = useQuickNotesStore();
  
  const { openViewSidebar } = useTaskSidebarStore();
  const { tasks } = useTaskStore();
  const position = usePanelPosition(panelId);
  const icon = usePanelIconComponent(panelId);
  
  const [activeTab, setActiveTab] = useState<QuickNoteTab>('new');
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState(metadata?.taskId || '');
  
  // تنظیم taskId از metadata
  useEffect(() => {
    if (metadata?.taskId) {
      setLinkedTaskId(metadata.taskId);
    }
  }, [metadata?.taskId]);
  
  // فیلتر یادداشت‌ها
  const filteredNotes = useMemo(() => {
    let result = notes;
    
    // فیلتر با search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }
    
    // مرتب‌سازی: پین شده‌ها اول، سپس بر اساس تاریخ
    result = [...result].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    
    return result;
  }, [notes, searchQuery]);
  
  // نمایش یادداشت‌های لینک شده به تسک خاص
  const linkedNotes = useMemo(() => {
    if (!linkedTaskId) return [];
    return filteredNotes.filter(note => note.taskId === linkedTaskId);
  }, [filteredNotes, linkedTaskId]);
  
  // همه یادداشت‌ها
  const allNotes = linkedTaskId ? linkedNotes : filteredNotes;
  
  const handleSaveNewNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    
    addNote({
      title: newNoteTitle || 'Quick Note',
      content: newNoteContent,
      taskId: linkedTaskId || undefined,
      taskTitle: linkedTaskId 
        ? tasks.find(t => t.id === linkedTaskId)?.title 
        : undefined,
    });
    
    setNewNoteTitle('');
    setNewNoteContent('');
    setActiveTab('list');
  };
  
  const handleViewTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      openViewSidebar(task);
    }
  };
  
  const handleClose = () => {
    closeQuickNotes();
    onClose();
  };
  
  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), 'MMM d, HH:mm');
    } catch {
      return '';
    }
  };
  
  // تب: یادداشت جدید
  const newNoteTab = {
    id: 'new',
    label: 'New Note',
    icon: <Plus size={16} />,
    content: (
      <div className="space-y-4">
        <SidebarInput
          id="note-title"
          label="Title"
          value={newNoteTitle}
          onChange={setNewNoteTitle}
          placeholder="Note title..."
        />
        
        <SidebarTextarea
          id="note-content"
          label="Content"
          value={newNoteContent}
          onChange={setNewNoteContent}
          placeholder="Write your quick note here..."
          rows={8}
        />
        
        <div className="flex gap-2">
          <Button
            onClick={handleSaveNewNote}
            className="flex items-center gap-2 flex-1"
          >
            <Save size={16} />
            Save Note
          </Button>
          {newNoteTitle || newNoteContent ? (
            <Button
              variant="outline"
              onClick={() => {
                setNewNoteTitle('');
                setNewNoteContent('');
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
        
        {linkedTaskId && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            isDarkMode ? "bg-blue-900/20 text-blue-300" : "bg-blue-50 text-blue-700"
          )}>
            <div className="flex items-center gap-2">
              <ExternalLink size={14} />
              <span>Linked to: {tasks.find(t => t.id === linkedTaskId)?.title}</span>
            </div>
          </div>
        )}
      </div>
    ),
  };
  
  const listNotesTab = {
    id: 'list',
    label: 'My Notes',
    icon: <FileText size={16} />,
    content: (
      <div className="space-y-4">
        <SidebarInput
          id="search-notes"
          label="Search Notes"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search in notes..."
        />
        
        {allNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {linkedTaskId 
                ? "No notes linked to this task" 
                : searchQuery 
                  ? "No notes found" 
                  : "No notes yet"}
            </p>
            <p className={cn("text-xs mt-1", isDarkMode ? "text-gray-500" : "text-gray-400")}>
              {linkedTaskId 
                ? "Create a new note to link" 
                : "Create your first quick note"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {allNotes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200 group",
                  isDarkMode
                    ? "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    : "bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.isPinned && (
                        <Pin size={12} className="text-yellow-500 flex-shrink-0" />
                      )}
                      <h4 className={cn(
                        "font-medium text-sm truncate",
                        isDarkMode ? "text-gray-100" : "text-gray-900"
                      )}>
                        {note.title}
                      </h4>
                    </div>
                    
                    {note.content && (
                      <p className={cn(
                        "text-xs line-clamp-2 mb-2",
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      )}>
                        {note.content}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "text-[10px] flex items-center gap-1",
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      )}>
                        <Clock size={10} />
                        {formatDate(note.updatedAt)}
                      </span>
                      
                      {note.taskId && (
                        <button
                          onClick={() => handleViewTask(note.taskId!)}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1",
                            isDarkMode 
                              ? "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50" 
                              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                          )}
                        >
                          <ExternalLink size={10} />
                          Task
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => pinNote(note.id)}
                      className={cn(
                        "p-1 rounded transition-colors",
                        note.isPinned
                          ? "text-yellow-500 hover:text-yellow-600"
                          : isDarkMode
                            ? "text-gray-500 hover:text-gray-300"
                            : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Pin size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentNote(note);
                        setNewNoteTitle(note.title);
                        setNewNoteContent(note.content);
                        setActiveTab('new');
                      }}
                      className={cn(
                        "p-1 rounded transition-colors",
                        isDarkMode
                          ? "text-gray-500 hover:text-gray-300"
                          : "text-gray-400 hover:text-gray-600"
                      )}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this note?')) {
                          deleteNote(note.id);
                        }
                      }}
                      className={cn(
                        "p-1 rounded transition-colors",
                        isDarkMode
                          ? "text-gray-500 hover:text-red-400"
                          : "text-gray-400 hover:text-red-500"
                      )}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };
  
  const tabs = [newNoteTab, listNotesTab];
  
  return (
    <SidebarShell
      isOpen={isOpen}
      position={position}
      onClose={handleClose}
      isDarkMode={isDarkMode}
      panelId={panelId}
      title="Quick Notes"
      icon={<QuickNoteIcon size={20} />}
      breadcrumbs={[
        { label: 'Quick Notes' },
        ...(linkedTaskId ? [{ label: 'Linked to Task' }] : []),
      ]}
    >
      <div className="space-y-4">
        <Tab
          items={tabs}
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as QuickNoteTab)}
          isDarkMode={isDarkMode}
          variant="underline"
          size="sm"
        />
      </div>
    </SidebarShell>
  );
};

QuickNotesSidebar.displayName = 'QuickNotesSidebar';