// components/xp/XPDashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Zap, TrendingUp, Star, Flame,
  Calendar, Target, Award, Crown
} from 'lucide-react';
import { useXPStore } from '@/stores/xp/xp.store';
import { XPProgressRing } from './XPProgressRing';
import { XPWidget } from './XPWidget';
import { useXPAnalytics } from '@/stores/xp/xp-analytics';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

export const XPDashboard: React.FC = () => {
  const { isDarkMode } = useApp();
  const { totalXP, currentLevel, levelProgress, achievements, streak, events } = useXPStore();
  const analytics = useXPAnalytics();
  
  const recentEvents = events.slice(-10).reverse();
  const unlockedAchievements = achievements.filter(a => a.completed);
  const productivity = analytics.getProductivityTrend();
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              XP Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">Your progression journey</p>
          </div>
          
          {/* Total XP Badge */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl',
            'bg-gradient-to-r from-yellow-500/10 to-orange-500/10',
            'border border-yellow-500/20'
          )}>
            <Zap size={20} className="text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 tabular-nums">
              {totalXP.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-3 gap-4 max-w-5xl">
          {/* Level Card - spans 2 columns */}
          <div className={cn(
            'col-span-2 rounded-2xl border p-6',
            isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
          )}>
            <div className="flex items-center gap-6">
              <XPProgressRing progress={levelProgress} size={80} strokeWidth={4}>
                <motion.span 
                  className="text-3xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {getLevelIcon(currentLevel)}
                </motion.span>
              </XPProgressRing>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold">Level {currentLevel}</span>
                  <Crown size={18} className="text-yellow-500" />
                </div>
                <p className="text-sm text-gray-500">
                  {getLevelTitle(currentLevel)}
                </p>
                
                {/* Mini stats */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Flame size={12} className="text-orange-500" />
                    <span className="font-bold">{streak.current}</span>
                    <span className="text-gray-500">day streak</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Trophy size={12} className="text-yellow-500" />
                    <span className="font-bold">{unlockedAchievements.length}</span>
                    <span className="text-gray-500">achievements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* XP Widget - 1 column */}
          <div className="col-span-1">
            <XPWidget />
          </div>
          
          {/* Activity Feed */}
          <div className={cn(
            'col-span-2 rounded-2xl border',
            isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
          )}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar size={14} className="text-blue-500" />
                Recent Activity
              </h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {recentEvents.length === 0 ? (
                <div className="p-8 text-center">
                  <Target size={32} className="mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No activity yet. Start completing tasks!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <span className="text-lg">
                        {getActionIcon(event.action)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {formatActionName(event.action)}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <span className={cn(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        'bg-yellow-100 text-yellow-700',
                        'dark:bg-yellow-900/30 dark:text-yellow-400'
                      )}>
                        +{event.finalAmount} XP
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Achievements Grid */}
          <div className={cn(
            'col-span-1 rounded-2xl border',
            isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
          )}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Award size={14} className="text-yellow-500" />
                Achievements
              </h3>
            </div>
            
            <div className="max-h-[300px] overflow-y-auto p-3">
              <div className="grid grid-cols-2 gap-2">
                {achievements.slice(0, 8).map((ach) => (
                  <div
                    key={ach.id}
                    className={cn(
                      'p-2 rounded-lg text-center transition-all',
                      ach.completed
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'
                    )}
                  >
                    <div className="text-2xl mb-1">{ach.icon}</div>
                    <div className="text-[10px] font-medium truncate">
                      {ach.name}
                    </div>
                    <div className="text-[9px] text-gray-400">
                      {ach.currentCount}/{ach.requiredCount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helpers
function getLevelIcon(level: number): string {
  if (level >= 100) return '🔮';
  if (level >= 75) return '👑';
  if (level >= 50) return '🏆';
  if (level >= 35) return '🎯';
  if (level >= 20) return '⚡';
  if (level >= 10) return '📚';
  return '🌱';
}

function getLevelTitle(level: number): string {
  if (level >= 100) return 'Transcendent';
  if (level >= 75) return 'Grandmaster';
  if (level >= 50) return 'Master';
  if (level >= 35) return 'Expert';
  if (level >= 20) return 'Practitioner';
  if (level >= 10) return 'Learner';
  return 'Beginner';
}

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    'task:created': '📝',
    'task:completed': '✅',
    'task:completed_early': '⏰',
    'task:completed_on_time': '🎯',
    'task:completed_overdue': '😅',
    'task:moved_to_progress': '🚀',
    'task:priority_urgent_completed': '🔥',
    'task:priority_high_completed': '⚡',
    'subtask:completed': '✔️',
    'board:created': '📋',
    'board:streak_daily': '🔥',
    'board:streak_weekly': '💪',
    'label:organized': '🏷️',
    'attachment:added': '📎',
    'time:logged': '⏱️',
    'milestone:reached': '🏆',
    'collaboration:assigned': '👥',
  };
  return icons[action] || '✨';
}

function formatActionName(action: string): string {
  return action
    .split(':')
    .pop()
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) || action;
}