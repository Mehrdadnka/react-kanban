import React, { useState } from 'react';
import { Filter, X, Tag, Flag, Layout } from 'lucide-react';
import { useLabelStore } from '@/stores/label.store';
import { useColumnStore } from '@/stores/column.store';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { TaskPriority, TaskType } from '@/types/task.types';

export interface FilterState {
  labels: string[];
  priorities: TaskPriority[];
  columns: string[];
  types: TaskType[];
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  className?: string;
  variant?: 'inline' | 'sidebar' | 'mobile';

}

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'low', label: 'Low', color: 'bg-gray-400' },
];

const TYPES: { value: TaskType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'project', label: 'Project' },
  { value: 'epic', label: 'Epic' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  className,
}) => {
  const { isDarkMode } = useApp();
  const { labels } = useLabelStore();
  const { columns } = useColumnStore();
  const [openSection, setOpenSection] = useState<string | null>(null);

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  const activeFilterCount =
    filters.labels.length +
    filters.priorities.length +
    filters.columns.length +
    filters.types.length +
    (filters.search ? 1 : 0);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const clearAll = () => {
    onFilterChange({ labels: [], priorities: [], columns: [], types: [], search: '' });
  };

  const toggleInArray = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const filterButton = (section: string, icon: React.ReactNode, label: string, count: number) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
        openSection === section
          ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
          : isDarkMode
            ? 'border-gray-700 text-gray-300 hover:border-gray-600 bg-gray-800'
            : 'border-gray-300 text-gray-600 hover:border-gray-400 bg-white'
      )}
    >
      {icon}
      {label}
      {count > 0 && (
        <span className={cn(
          'px-1.5 py-0.5 rounded-full text-[10px]',
          openSection === section
            ? 'bg-blue-200 dark:bg-blue-800'
            : 'bg-gray-200 dark:bg-gray-700'
        )}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className={cn('space-y-2', className, 'min-h-[400px]')}>
      {/* Search + Filter toggle row */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search tasks..."
            className={cn(
              'w-full pl-8 pr-8 py-2 rounded-lg border text-xs transition-colors',
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 hover:border-gray-600'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 hover:border-gray-400'
            )}
          />
          <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={12} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className={cn(
              'text-xs px-2 py-1.5 rounded-lg font-medium transition-colors',
              isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            )}
          >
            Clear ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filterButton('priority', <Flag size={12} />, 'Priority', filters.priorities.length)}
        {filterButton('labels', <Tag size={12} />, 'Labels', filters.labels.length)}
        {filterButton('columns', <Layout size={12} />, 'Status', filters.columns.length)}
        {filterButton('types', <Filter size={12} />, 'Type', filters.types.length)}
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-1 flex-wrap pt-1">
          {filters.priorities.map(p => (
            <span key={p} className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITIES.find(pr => pr.value === p)?.color)} />
              {p}
              <button onClick={() => onFilterChange({ ...filters, priorities: filters.priorities.filter(f => f !== p) })}>
                <X size={10} />
              </button>
            </span>
          ))}
          {filters.labels.map(l => {
            const label = labels.find(lb => lb.id === l);
            return (
              <span
                key={l}
                className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium flex items-center gap-1"
                style={{ backgroundColor: label?.color || '#6B7280' }}
              >
                {label?.name || l}
                <button onClick={() => onFilterChange({ ...filters, labels: filters.labels.filter(f => f !== l) })}>
                  <X size={10} />
                </button>
              </span>
            );
          })}
          {filters.columns.map(c => {
            const col = columns.find(cl => cl.id === c);
            return (
              <span key={c} className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
                'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              )}>
                {col?.title || c}
                <button onClick={() => onFilterChange({ ...filters, columns: filters.columns.filter(f => f !== c) })}>
                  <X size={10} />
                </button>
              </span>
            );
          })}
          {filters.types.map(t => (
            <span key={t} className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1',
              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            )}>
              {t}
              <button onClick={() => onFilterChange({ ...filters, types: filters.types.filter(f => f !== t) })}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown sections */}
      <div className="relative">
        {openSection === 'priority' && (
          <div className={cn(
            'absolute top-full mt-1 left-0 w-48 rounded-xl shadow-xl border z-50 p-2 space-y-0.5',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            {PRIORITIES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => onFilterChange({ ...filters, priorities: toggleInArray(filters.priorities, p.value) })}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors',
                  filters.priorities.includes(p.value)
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span className={cn('w-2.5 h-2.5 rounded-full', p.color)} />
                {p.label}
              </button>
            ))}
          </div>
        )}

        {openSection === 'labels' && (
          <div className={cn(
            'absolute top-full mt-1 left-0 w-56 rounded-xl shadow-xl border z-50 p-2 space-y-0.5 max-h-48 overflow-y-auto',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            {labels.map(l => (
              <button
                key={l.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, labels: toggleInArray(filters.labels, l.id) })}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors',
                  filters.labels.includes(l.id)
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: l.color }} />
                {l.name}
              </button>
            ))}
          </div>
        )}

        {openSection === 'columns' && (
          <div className={cn(
            'absolute top-full mt-1 left-0 w-48 rounded-xl shadow-xl border z-50 p-2 space-y-0.5',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            {sortedColumns.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onFilterChange({ ...filters, columns: toggleInArray(filters.columns, c.id) })}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors',
                  filters.columns.includes(c.id)
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <StatusDot color={c.color} />
                {c.title}
              </button>
            ))}
          </div>
        )}

        {openSection === 'types' && (
          <div className={cn(
            'absolute top-full mt-1 left-0 w-44 rounded-xl shadow-xl border z-50 p-2 space-y-0.5',
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          )}>
            {TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => onFilterChange({ ...filters, types: toggleInArray(filters.types, t.value) })}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors capitalize',
                  filters.types.includes(t.value)
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Tiny status dot for filter dropdown
const StatusDot: React.FC<{ color: string }> = ({ color }) => (
  <span
    className="w-3 h-3 rounded-full border border-black/10 flex-shrink-0"
    style={{ backgroundColor: color }}
  />
);

FilterBar.displayName = 'FilterBar';