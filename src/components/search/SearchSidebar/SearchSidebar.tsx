import React, { useEffect, useRef, memo } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { useTaskStore } from '@/stores/task.store';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { useRouter } from '@/router';

import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { SidebarTaskCard } from '@/components/sidebar-ui-engine/SidebarTaskCard';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { useSearchSidebarStore } from '@/stores/sidebar-engine/search-sidebar.store';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { usePanelIconComponent } from '@/hooks/usePanelIcon';

export const SearchSidebar: React.FC<PanelProps> = memo(({ isOpen, onClose, panelId }) => {
  const { query, results, setQuery, search, closeSearch } = useSearchSidebarStore();
  const { tasks } = useTaskStore();
  const { navigate } = useRouter();
  const { openViewSidebar } = useTaskSidebarStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const icon = usePanelIconComponent(panelId);
  const position = usePanelPosition(panelId); 
  

  // Focus on open
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search on query change
  useEffect(() => {
    search(query, tasks);
  }, [query, tasks, search]);

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      onClose();
      openViewSidebar(task);
    }
  };

  const handleNavigateToBoard = () => {
    closeSearch();
    navigate('/tasks');
  };

  const handleClose = () => {
    closeSearch(); 
    onClose();
  };

  const groupedResults = results.reduce((acc, task) => {
    if (!acc[task.status]) acc[task.status] = [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof results>);

  const statusLabels: Record<string, string> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Done',
  };

  return (
    <SidebarShell
      isOpen={isOpen}
      position={position}
      onClose={handleClose}
      panelId={panelId}
      title="Search Tasks"
      icon={icon}
      breadcrumbs={[{ label: 'Search' }]}
    >
      <div className="space-y-6">
        <SidebarInput
          id="search-query"
          label="Search"
          value={query}
          onChange={setQuery}
          placeholder="Search tasks, status, priority..."
          inputRef={inputRef}
        />

        {query.trim() === '' ? (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm text-gray-400">
              Start typing to search across all tasks
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Search in titles, descriptions, status, and priority
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <X size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-sm text-gray-400">No tasks found</p>
            <p className="text-xs text-gray-400 mt-1">
              Try different keywords
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {results.length} task{results.length !== 1 ? 's' : ''} found
              </span>
              {results.length > 0 && (
                <button
                  onClick={handleNavigateToBoard}
                  className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  View in Board <ArrowRight size={12} />
                </button>
              )}
            </div>

            {Object.entries(groupedResults).map(([status, statusTasks]) => (
              <div key={status}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  {statusLabels[status] || status}
                </h3>
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <SidebarTaskCard
                      key={task.id}
                      task={task}
                      onClick={() => handleTaskClick(task.id)}
                      variant="detailed"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {query.trim() !== '' && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>ESC to close</span>
              <span>↑↓ to navigate</span>
            </div>
          </div>
        )}
      </div>
    </SidebarShell>
  );
});

SearchSidebar.displayName = 'SearchSidebar';