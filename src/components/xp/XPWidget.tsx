// components/xp/XPWidget.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Trophy, TrendingUp, Zap, Star, Flame, 
  Target, Award, ChevronRight, Gift,
  Calendar, Clock, X
} from 'lucide-react';
import { useXPStore } from '@/stores/xp/xp.store';
import { XPProgressRing } from './XPProgressRing';
import { useXPAnalytics } from '@/stores/xp/xp-analytics';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

type PanelPosition = 'left' | 'right' | 'top' | 'bottom';

interface XPWidgetProps {
  panelPosition?: PanelPosition;
  panelOffset?: number;
  panelWidth?: number;
  panelHeight?: number;
}

export const XPWidget: React.FC<XPWidgetProps> = ({
  panelPosition = 'right',
  panelOffset = 8,
  panelWidth = 280,
  panelHeight = 400,
}) => {
  const { isDarkMode } = useApp();
  const { 
    totalXP, currentLevel, levelProgress, xpToNextLevel,
    streak, achievements 
  } = useXPStore();
  
  const analytics = useXPAnalytics();
  const [expanded, setExpanded] = useState(false);
  const [animating, setAnimating] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const unlockedAchievements = achievements.filter(a => a.completed);
  const nextAchievement = achievements.find(a => !a.completed);
  
  const prediction = analytics.predictNextLevel();
  const topActions = analytics.getMostValuableActions();
  
  // Handle open/close with animation
  const togglePanel = () => {
    if (expanded) {
      setAnimating(false);
      setTimeout(() => setExpanded(false), 200);
    } else {
      setExpanded(true);
      setTimeout(() => setAnimating(true), 10);
    }
  };
  
  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expanded &&
        widgetRef.current &&
        panelRef.current &&
        !widgetRef.current.contains(event.target as Node) &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setAnimating(false);
        setTimeout(() => setExpanded(false), 200);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);
  
  // Calculate panel position styles
  const getPanelStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 9999,
      width: panelWidth,
    };
    
    switch (panelPosition) {
      case 'right':
        return {
          ...baseStyles,
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginLeft: panelOffset,
        };
      case 'left':
        return {
          ...baseStyles,
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          marginRight: panelOffset,
        };
      case 'bottom':
        return {
          ...baseStyles,
          top: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginTop: panelOffset,
        };
      case 'top':
        return {
          ...baseStyles,
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: panelOffset,
        };
      default:
        return baseStyles;
    }
  };
  
  // Get animation classes based on position
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-out';
    
    if (!animating) {
      switch (panelPosition) {
        case 'right':
          return `${baseClasses} opacity-0 translate-x-2 scale-95`;
        case 'left':
          return `${baseClasses} opacity-0 -translate-x-2 scale-95`;
        case 'top':
          return `${baseClasses} opacity-0 -translate-y-2 scale-95`;
        case 'bottom':
          return `${baseClasses} opacity-0 translate-y-2 scale-95`;
      }
    }
    
    return `${baseClasses} opacity-100 translate-x-0 translate-y-0 scale-100`;
  };
  
  // Progress bar animation
  const [progressWidth, setProgressWidth] = useState(0);
  useEffect(() => {
    if (expanded) {
      setTimeout(() => setProgressWidth(levelProgress), 100);
    } else {
      setProgressWidth(0);
    }
  }, [expanded, levelProgress]);
  
  return (
    <div ref={widgetRef} className="relative">
      <div className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200',
        'shadow-sm hover:shadow-md',
      )}>
        {/* Toggle Button */}
        <button
          onClick={togglePanel}
          className="w-full p-2 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        >
          <XPProgressRing progress={levelProgress} size={24} strokeWidth={2}>
            <span className="text-xs">{getLevelEmoji(currentLevel)}</span>
          </XPProgressRing>
        </button>
      </div>
      
      {/* Side Panel */}
      {expanded && (
        <div
          ref={panelRef}
          style={getPanelStyles()}
          className={cn(
            getAnimationClasses(),
            'rounded-2xl shadow-xl overflow-hidden border',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
          )}
        >
          <div 
            className="p-4 space-y-4 overflow-y-auto"
            style={{ maxHeight: panelHeight }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <XPProgressRing progress={levelProgress} size={36} strokeWidth={3}>
                  <span className="text-base">{getLevelEmoji(currentLevel)}</span>
                </XPProgressRing>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">Level {currentLevel}</span>
                    {streak.current >= 3 && (
                      <span className="flex items-center gap-0.5 text-xs text-orange-500 font-bold">
                        <Flame size={12} />
                        {streak.current}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Zap size={12} className="text-yellow-500" />
                    <span>{totalXP.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
              <button
                onClick={togglePanel}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            
            {/* Progress Details */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Progress to Level {currentLevel + 1}</span>
                <span className="font-mono font-bold">{levelProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressWidth}%` }}
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
                      className="h-full rounded-full bg-blue-500 transition-all duration-500"
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
        </div>
      )}
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