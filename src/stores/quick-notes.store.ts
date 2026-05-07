// stores/quick-notes.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QuickNote, QuickNoteCreateInput } from '@/types/quick-note.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

interface QuickNotesState {
  notes: QuickNote[];
  currentNote: QuickNote | null;
  isEditing: boolean;
  
  // Actions
  addNote: (input: QuickNoteCreateInput) => string;
  updateNote: (id: string, updates: Partial<QuickNote>) => void;
  deleteNote: (id: string) => void;
  pinNote: (id: string) => void;
  linkToTask: (noteId: string, taskId: string, taskTitle: string) => void;
  unlinkFromTask: (noteId: string) => void;
  
  // UI Actions
  setCurrentNote: (note: QuickNote | null) => void;
  setIsEditing: (editing: boolean) => void;
  
  // Sidebar Actions
  openQuickNotes: (taskId?: string, taskTitle?: string) => void;
  closeQuickNotes: () => void;
  
  // Queries
  getNotesByTask: (taskId: string) => QuickNote[];
  getPinnedNotes: () => QuickNote[];
}

export const useQuickNotesStore = create<QuickNotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      currentNote: null,
      isEditing: false,
      
      addNote: (input) => {
        const id = crypto.randomUUID();
        const now = new Date();
        const note: QuickNote = {
          id,
          title: input.title || 'Untitled Note',
          content: input.content,
          createdAt: now,
          updatedAt: now,
          taskId: input.taskId,
          taskTitle: input.taskTitle,
          color: input.color || '#3B82F6',
          isPinned: input.isPinned || false,
        };
        
        set(state => ({
          notes: [...state.notes, note],
          currentNote: note,
          isEditing: false,
        }));
        
        return id;
      },
      
      updateNote: (id, updates) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
          currentNote: state.currentNote?.id === id
            ? { ...state.currentNote, ...updates, updatedAt: new Date() }
            : state.currentNote,
        }));
      },
      
      deleteNote: (id) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== id),
          currentNote: state.currentNote?.id === id ? null : state.currentNote,
        }));
      },
      
      pinNote: (id) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === id
              ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
              : note
          ),
        }));
      },
      
      linkToTask: (noteId, taskId, taskTitle) => {
        get().updateNote(noteId, { taskId, taskTitle });
      },
      
      unlinkFromTask: (noteId) => {
        get().updateNote(noteId, { taskId: undefined, taskTitle: undefined });
      },
      
      setCurrentNote: (note) => set({ currentNote: note, isEditing: !!note }),
      setIsEditing: (editing) => set({ isEditing: editing }),
      
      openQuickNotes: (taskId, taskTitle) => {
        const engine = useSidebarEngineStore.getState();
        engine.open('quick-notes-sidebar', { 
          taskId, 
          taskTitle 
        });
      },
      
      closeQuickNotes: () => {
        const engine = useSidebarEngineStore.getState();
        engine.close('quick-notes-sidebar');
        set({ currentNote: null, isEditing: false });
      },
      
      getNotesByTask: (taskId) => {
        return get().notes.filter(note => note.taskId === taskId);
      },
      
      getPinnedNotes: () => {
        return get().notes.filter(note => note.isPinned);
      },
    }),
    {
      name: 'quick-notes-storage',
      partialize: (state) => ({
        notes: state.notes,
      }),
    }
  )
);