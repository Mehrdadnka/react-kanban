// components/xp/XPProgressBar.tsx
import React from 'react';
import { useXPStore } from '@/stores/xp/xp.store';
import { cn } from '@/lib/utils';

export const XPProgressBar: React.FC = () => {
  const { totalXP, currentLevel, levelProgress, xpToNextLevel } = useXPStore();
  const levelInfo = useXPStore.getState().calculateLevel(totalXP);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getLevelIcon(currentLevel)}</span>
          <div>
            <span className="font-bold text-lg">Level {currentLevel}</span>
            <span className="text-sm text-gray-500 ml-2">{levelInfo.title}</span>
          </div>
        </div>
        <span className="text-sm font-medium">
          {totalXP.toLocaleString()} XP
        </span>
      </div>
      
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${levelProgress}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Level {currentLevel}</span>
        <span>{xpToNextLevel - (xpToNextLevel * (100 - levelProgress) / 100)} / {xpToNextLevel} XP</span>
        <span>Level {currentLevel + 1}</span>
      </div>
    </div>
  );
};

function getLevelIcon(level: number): string {
  if (level >= 100) return '🔮';
  if (level >= 75) return '👑';
  if (level >= 50) return '🏆';
  if (level >= 35) return '🎯';
  if (level >= 20) return '⚡';
  if (level >= 10) return '📚';
  return '🌱';
}