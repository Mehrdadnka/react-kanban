// components/xp/DailyChallengesWidget.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Target, Gift, ChevronRight } from 'lucide-react';
import { useChallengeStore } from '@/stores/xp/challenges.store';
import { useXPStore } from '@/stores/xp/xp.store';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

export const DailyChallengesWidget: React.FC = () => {
  const { isDarkMode } = useApp();
  const { challenges, claimReward } = useChallengeStore();
  const activeChallenges = challenges.filter(c => {
    const now = new Date();
    return c.expiresAt > now && !c.claimed;
  });

  if (activeChallenges.length === 0) {
    return (
      <div className={cn(
        'rounded-xl border p-4 text-center',
        isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
      )}>
        <Target size={24} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">No active challenges</p>
        <p className="text-xs text-gray-400 mt-1">Come back tomorrow!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Target size={14} className="text-green-500" />
          Daily Challenges
        </h3>
        <span className="text-xs text-gray-400">
          {activeChallenges.filter(c => c.completed).length}/{activeChallenges.length}
        </span>
      </div>

      {activeChallenges.map((challenge) => (
        <motion.div
          key={challenge.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border p-3 transition-all',
            challenge.completed 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : isDarkMode 
                ? 'bg-gray-800/50 border-gray-700' 
                : 'bg-gray-50 border-gray-200',
            challenge.claimed && 'opacity-50'
          )}
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">{challenge.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{challenge.title}</span>
                <span className="text-[10px] text-yellow-600 font-bold">
                  +{challenge.reward} XP
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="mt-1.5 space-y-1">
                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      challenge.completed 
                        ? 'bg-green-500' 
                        : 'bg-blue-500'
                    )}
                    style={{ 
                      width: `${Math.min(100, (challenge.current / challenge.target) * 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>{challenge.current}/{challenge.target}</span>
                  {challenge.completed && !challenge.claimed && (
                    <span className="text-green-500">Ready!</span>
                  )}
                </div>
              </div>
              
              {/* Claim button */}
              {challenge.completed && !challenge.claimed && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => claimReward(challenge.id)}
                  className="mt-2 w-full py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 
                    text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1"
                >
                  <Gift size={12} />
                  Claim Reward
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};