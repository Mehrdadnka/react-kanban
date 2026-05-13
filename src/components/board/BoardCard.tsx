import React from 'react';
import { IconButton } from '@radix-ui/themes';
import { Card, CardContent } from '@/components/ui/card/Card';
import { Board, useBoardStore } from '@/stores/board.store';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import {
  MoreHorizontal, Clock,
  Rocket, Code2, Palette, Layout, Briefcase, Target,
  Zap, Star, Heart, Crown, Flame, Globe, Lightbulb,
  Megaphone, Puzzle, Shield, Sparkles, Sword, Trophy, Wand,
  FolderKanban, CheckSquare, LayoutDashboard
} from 'lucide-react';

interface BoardCardProps {
  board: Board;
  onClick?: (board: Board) => void;
}

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Rocket,
  Code2,
  Palette,
  Layout,
  Briefcase,
  Target,
  Zap,
  Star,
  Heart,
  Crown,
  Flame,
  Globe,
  Lightbulb,
  Megaphone,
  Puzzle,
  Shield,
  Sparkles,
  Sword,
  Trophy,
  Wand,
  FolderKanban,
  LayoutDashboard,
  CheckSquare,
};

export const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  const { isDarkMode } = useApp();
  const getBoardStats = useBoardStore((state) => state.getBoardStats);
  const stats = getBoardStats(board.id);
  const IconComponent = ICON_MAP[board.icon] || Layout;

  const progressPercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <Card
      className={cn(
        'group cursor-pointer min-h-[200px] transition-all duration-300',
        'hover:shadow-2xl hover:-translate-y-1',
        'border border-opacity-50',
        isDarkMode
          ? 'bg-gray-900/80 border-gray-800 hover:bg-gray-800/80'
          : 'bg-white/80 border-gray-200 hover:bg-white',
        'backdrop-blur-sm'
      )}
      onClick={() => onClick?.(board)}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header with icon and menu */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon with gradient wrapper */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${board.color}20, ${board.color}30)`,
                boxShadow: `0 4px 14px ${board.color}30`,
                color: board.color,
              }}
            >
              <IconComponent size={24} />
            </div>

            {/* Title and description */}
            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-base truncate">{board.title}</h3>
              {board.description && (
                <p className={cn(
                  'text-xs mt-0.5 line-clamp-2',
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {board.description}
                </p>
              )}
            </div>
          </div>

          <IconButton
            variant="ghost"
            size="1"
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Add board menu dropdown
            }}
          >
            <MoreHorizontal size={16} />
          </IconButton>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className={cn(isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
              Progress
            </span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="relative h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
        </div>

{stats.columns && stats.columns.length > 0 ? (
  // Dynamic columns
  <div className="flex items-center gap-3">
    {stats.columns.map(col => (
      <div key={col.id} className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
        <span className="text-xs font-medium">{col.count}</span>
      </div>
    ))}
  </div>
) : (
  // Fallback to old format
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-blue-400" />
      <span className="text-xs font-medium">{stats.todo}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-amber-400" />
      <span className="text-xs font-medium">{stats.doing}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-green-400" />
      <span className="text-xs font-medium">{stats.done}</span>
    </div>
  </div>
)}
      </CardContent>
    </Card>
  );
};