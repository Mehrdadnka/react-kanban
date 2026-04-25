import React, { useState, useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X } from 'lucide-react';
import { useTaskStore } from '@/stores/task.store';
import { useRouter } from '@/router';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({ open, onOpenChange }) => {
  const { tasks } = useTaskStore();
  const { navigate } = useRouter();
  const { isDarkMode } = useApp();
  const [query, setQuery] = useState('');

  const filteredResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm) ||
      task.status.toLowerCase().includes(searchTerm)
    ).slice(0, 8); // Limit to 8 results for performance
  }, [tasks, query]);

  const handleSelect = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
    onOpenChange(false);
  };

  return (
    <Dialog.Root 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
        setQuery('');
      }
      onOpenChange(isOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]" />
        <Dialog.Content 
          className={cn(
            'fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[9999]',
            'rounded-xl shadow-2xl border',
            'animate-in fade-in-0 zoom-in-95',
            isDarkMode 
              ? 'bg-gray-900 border-gray-700' 
              : 'bg-white border-gray-200'
          )}
        >
          {/* Search Input */}
          <div className={cn(
            'flex items-center gap-3 p-4 border-b',
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          )}>
            <Search size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks, descriptions, status..."
              className={cn(
                'flex-1 bg-transparent outline-none text-sm',
                isDarkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
              )}
            />
            <Dialog.Close asChild>
              <button className={cn(
                'p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )}>
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto p-2">
            {query.trim() === '' ? (
              <div className={cn(
                'text-center py-8 text-sm',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )}>
                Start typing to search...
              </div>
            ) : filteredResults.length === 0 ? (
              <div className={cn(
                'text-center py-8 text-sm',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )}>
                No results found
              </div>
            ) : (
              filteredResults.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelect(task.id)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg mb-1 transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  )}
                >
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      task.status === 'todo' && 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                      task.status === 'in-progress' && 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
                      task.status === 'done' && 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
                    )}>
                      {task.status}
                    </span>
                    {task.priority && (
                      <span className="text-xs text-gray-500">
                        {task.priority}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Keyboard hint */}
          <div className={cn(
            'px-4 py-2 text-[10px] text-center border-t',
            isDarkMode ? 'border-gray-700 text-gray-600' : 'border-gray-200 text-gray-400'
          )}>
            Press ESC to close • ↑↓ to navigate
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};