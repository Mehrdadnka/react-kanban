import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Board, useBoardStore } from '@/stores/board.store';
import { useApp } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Eye, Pencil, Trash2, Search, ArrowUpDown,
  Clock, ChevronLeft, ChevronRight,
  Rocket, Code2, Palette, Briefcase, Target,
  Zap, Star, Heart, Crown, Flame, Globe,
  Lightbulb, Megaphone, Puzzle, Shield, Sparkles,
  Sword, Trophy, Wand, FolderKanban, CheckSquare,
  LayoutDashboard, Layout
} from 'lucide-react';

interface BoardTableProps {
  boards: Board[];
  progressPercent: number;
  onViewBoard: (board: Board) => void;
  onEditBoard: (board: Board) => void;
  onDeleteBoard: (board: Board) => void;

}

const columnHelper = createColumnHelper<Board>();

const BoardTitleCell: React.FC<{ board: Board, progressPercent: number }> = React.memo(({ board }) => {
  const IconComponent = ICON_MAP[board.icon] || Layout;

  const getBoardStats = useBoardStore((state) => state.getBoardStats);
  const stats = getBoardStats(board.id);
  
  const total = stats.done + stats.doing + stats.todo;
  const progressPercent = total > 0 ? Math.round((stats.done / total) * 100) : 0;
  
  
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${board.color}15, ${board.color}25)`,
          color: board.color,
        }}
      >
        <IconComponent size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{board.title}</span>
          {board.description && (
            <span className="text-xs text-gray-400 truncate hidden md:inline">
              • {board.description}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-2">
   <div className="flex-1 relative h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
            <div
              className={cn(
                'absolute left-0 top-0 h-full rounded-full transition-all duration-500',
                progressPercent === 100
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : progressPercent > 50
                    ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400">{progressPercent}%</span>
        </div>
      </div>
    </div>
  );
});

const BoardStatsCell: React.FC<{ boardId: string }> = React.memo(({ boardId }) => {
  const getBoardStats = useBoardStore((state) => state.getBoardStats);
  const stats = getBoardStats(boardId);
  
  return (
    <div className="flex items-center gap-4">
      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm font-medium tabular-nums">{stats.done}</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border bg-white dark:bg-gray-800">
            Completed Tasks
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-sm font-medium tabular-nums">{stats.doing}</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border bg-white dark:bg-gray-800">
            In Progress
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>

      <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <div className="flex items-center gap-1.5 cursor-default">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-sm font-medium tabular-nums">{stats.todo}</span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border bg-white dark:bg-gray-800">
            To Do
            <Tooltip.Arrow />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </div>
  );
});

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Rocket, Code2, Palette, Layout, Briefcase, Target,
  Zap, Star, Heart, Crown, Flame, Globe,
  Lightbulb, Megaphone, Puzzle, Shield, Sparkles,
  Sword, Trophy, Wand, FolderKanban, CheckSquare, LayoutDashboard,
};

export const BoardTable: React.FC<BoardTableProps> = ({
  boards,
  progressPercent,
  onViewBoard,
  onEditBoard,
  onDeleteBoard,
}) => {
  const { isDarkMode } = useApp();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  
  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 3;
  const prevBoardsLengthRef = useRef(boards.length);
  
  useEffect(() => {
    if (boards.length < prevBoardsLengthRef.current) {
      const maxPage = Math.max(0, Math.ceil(boards.length / pageSize) - 1);
      if (pageIndex > maxPage) {
        setPageIndex(maxPage);
      }
    }
    prevBoardsLengthRef.current = boards.length;
  }, [boards.length]);

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Board Name',
      cell: (info) => <BoardTitleCell progressPercent={progressPercent} board={info.row.original} />,
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Last Updated',
      cell: (info) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock size={13} />
          <span>
            {new Date(info.getValue()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'stats',
      header: 'Tasks',
      cell: (info) => <BoardStatsCell boardId={info.row.original.id} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); onViewBoard(info.row.original); }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Eye size={15} className="text-gray-400 hover:text-blue-500" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border bg-white dark:bg-gray-800">
                View Board
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); onEditBoard(info.row.original); }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Pencil size={15} className="text-gray-400 hover:text-amber-500" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border bg-white dark:bg-gray-800">
                Edit Board
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteBoard(info.row.original); }}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 size={15} className="text-gray-400 hover:text-red-500" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border bg-white dark:bg-gray-800">
                Delete Board
                <Tooltip.Arrow />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      ),
    }),
  ], [onViewBoard, onEditBoard, onDeleteBoard]);

  const table = useReactTable({
    data: boards,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // حذف onPaginationChange
  });

  const totalPages = table.getPageCount();

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className={cn(
        'rounded-xl border overflow-hidden',
        isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white'
      )}>
        <div className="overflow-auto" style={{ maxHeight: '520px' }}>
          <table className="w-full">
            <thead className={cn(
              'sticky top-0 z-10',
              isDarkMode ? 'bg-gray-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm',
              'border-b', isDarkMode ? 'border-gray-800' : 'border-gray-200'
            )}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        'px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider',
                        isDarkMode ? 'text-gray-400' : 'text-gray-500',
                        header.column.getCanSort() && 'cursor-pointer select-none'
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} className="opacity-40" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'group transition-colors duration-150 border-t',
                    isDarkMode ? 'hover:bg-gray-800/50 border-gray-800/50' : 'hover:bg-gray-50 border-gray-100'
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-3.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <Search className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No boards found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={cn(
            'flex items-center justify-between px-6 py-3 border-t',
            isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'
          )}>
            <span className="text-sm text-gray-500">
              Page {pageIndex + 1} of {totalPages} • {boards.length} boards
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i;
                else if (pageIndex < 3) pageNum = i;
                else if (pageIndex > totalPages - 4) pageNum = totalPages - 5 + i;
                else pageNum = pageIndex - 2 + i;
                
                return (
                  <button
                    key={`p-${pageNum}`}
                    onClick={() => setPageIndex(pageNum)}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                      pageNum === pageIndex
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))}
                disabled={pageIndex >= totalPages - 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};