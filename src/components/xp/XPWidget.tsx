// components/xp/XPWidget.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingUp, Zap, Star, Flame, 
  Target, Award, ChevronRight, Gift,
  Calendar, Clock
} from 'lucide-react';
import { useXPStore } from '@/stores/xp/xp.store';
import { XPProgressRing } from './XPProgressRing';
import { useXPAnalytics } from '@/stores/xp/xp-analytics';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

// مینی ویجت برای استفاده در sidebar یا dashboard
export const XPWidget: React.FC = () => {
  const { isDarkMode } = useApp();
  const { 
    totalXP, currentLevel, levelProgress, xpToNextLevel,
    streak, achievements 
  } = useXPStore();
  
  const analytics = useXPAnalytics();
  const [expanded, setExpanded] = useState(false);
  
  const unlockedAchievements = achievements.filter(a => a.completed);
  const nextAchievement = achievements.find(a => !a.completed);
  
  const prediction = analytics.predictNextLevel();
  const topActions = analytics.getMostValuableActions();
  
  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden transition-all duration-300',
      isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200',
      expanded ? 'shadow-xl' : 'shadow-sm hover:shadow-md',
    )}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <XPProgressRing progress={levelProgress} size={48} strokeWidth={3}>
          <span className="text-xl">{getLevelEmoji(currentLevel)}</span>
        </XPProgressRing>
        
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">Level {currentLevel}</span>
            {streak.current >= 3 && (
              <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-bold">
                <Flame size={10} />
                {streak.current}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Zap size={10} className="text-yellow-500" />
            <span>{totalXP.toLocaleString()} XP</span>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className="text-gray-400" />
        </motion.div>
      </button>
      
      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Progress Details */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Progress to Level {currentLevel + 1}</span>
                  <span className="font-mono font-bold">{levelProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{(totalXP - (totalXP % xpToNextLevel)).toLocaleString()}</span>
                  <span>{(totalXP - (totalXP % xpToNextLevel) + xpToNextLevel).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Prediction */}
              {prediction.daysRemaining > 0 && (
                <div className={cn(
                  'flex items-center gap-2 p-2 rounded-lg',
                  isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                )}>
                  <Clock size={14} className="text-blue-500" />
                  <span className="text-xs text-gray-500">
                    ~{prediction.daysRemaining} days to level up
                  </span>
                </div>
              )}
              
              {/* Recent Achievements */}
              {unlockedAchievements.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Recent Achievements
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {unlockedAchievements.slice(-3).map(ach => (
                      <span
                        key={ach.id}
                        className="text-xl cursor-help"
                        title={ach.name}
                      >
                        {ach.icon}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Next Achievement */}
              {nextAchievement && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Next Achievement
                  </h4>
                  <div className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
                  )}>
                    <span className="text-lg">{nextAchievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{nextAchievement.name}</div>
                      <div className="text-[10px] text-gray-500">
                        {nextAchievement.currentCount}/{nextAchievement.requiredCount}
                      </div>
                    </div>
                    <div className="w-10 h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${(nextAchievement.currentCount / nextAchievement.requiredCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Top Actions */}
              {topActions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Top XP Sources
                  </h4>
                  <div className="space-y-1">
                    {topActions.slice(0, 3).map((action, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                          {action.action}
                        </span>
                        <span className="font-mono font-bold text-yellow-600">
                          {action.totalXP}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getLevelEmoji(level: number): string {
  if (level >= 100) return '🔮';
  if (level >= 75) return '👑';
  if (level >= 50) return '🏆';
  if (level >= 35) return '🎯';
  if (level >= 20) return '⚡';
  if (level >= 10) return '📚';
  return '🌱';
}