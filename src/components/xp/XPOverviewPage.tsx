// components/xp/XPOverviewPage.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap, Trophy, Target, ShoppingBag, TrendingUp,
  Clock, Star, Gift, ChevronRight, Sparkles, Flame
} from 'lucide-react';
import { useXPStore } from '@/stores/xp/xp.store';
import { useChallengeStore } from '@/stores/xp/challenges.store';
import { usePowerUpStore } from '@/stores/xp/powerups.store';
import { useSessionStore } from '@/stores/xp/session.store';
import { XPProgressRing } from './XPProgressRing';
import { DailyChallengesWidget } from './DailyChallengesWidget';
import { SessionRecap } from './SessionRecap';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { Tab, TabItem } from '../ui/tab/Tab';

export const XPOverviewPage: React.FC = () => {
  const { isDarkMode } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'shop'>('overview');
  
  const xpStore = useXPStore();
  const challengeStore = useChallengeStore();
  const powerUpStore = usePowerUpStore();
  const sessionStore = useSessionStore();
  
  const levelInfo = xpStore.getLevelInfo();
  const achievements = xpStore.getAchievements();
  const unlockedAchievements = achievements.filter(a => a.completed);
  const shopItems = powerUpStore.getShopPowerUps();
  const activeChallenges = challengeStore.challenges.filter(c => !c.claimed);
  

const tabItems: TabItem[] = [
  {
    id: 'overview',
    label: 'Achievements',
    icon: <Trophy size={16} />,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
           {achievements.slice(0, 9).map(ach => (
                <div
                  key={ach.id}
                  className={cn(
                    'rounded-xl border p-4 text-center transition-all',
                    ach.completed
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                  )}
                >
                  <div className="text-3xl mb-2">{ach.icon}</div>
                  <div className="text-sm font-medium">{ach.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {ach.currentCount}/{ach.requiredCount}
                  </div>
                  {ach.completed && (
                    <div className="text-[10px] text-green-600 font-medium mt-1">
                      ✅ Unlocked
                    </div>
                  )}
                </div>
              ))}
        </div>
      </div>
    ),
  },
  {
    id: 'challenges',
    label: 'Challenges',
    icon: <Target size={16} />,
    content: (
      <div className="space-y-4">
        <DailyChallengesWidget />
        {activeChallenges.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock size={12} />
            <span>Resets in {formatTimeRemaining(activeChallenges[0].expiresAt)}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    id: 'shop',
    label: 'Shop',
    icon: <ShoppingBag size={16} />,
    content: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <ShoppingBag size={16} className="text-blue-500" />
            PowerUp Shop
          </h3>
          <span className="text-sm text-gray-500">
            Balance: <span className="font-bold text-yellow-600">{xpStore.totalXP} XP</span>
          </span>
        </div>
        <div className="grid gap-3">
          {shopItems.map(item => {
            const canAfford = xpStore.totalXP >= item.price;
                
            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-xl border p-4 flex items-center gap-4',
                  isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200',
                  !canAfford && 'opacity-50'
                )}
              >
                <span className="text-3xl">{item.icon}</span>
                    
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.description}</div>
                      {item.quantity > 0 && (
                        <div className="text-xs text-blue-500 mt-1">
                          Owned: {item.quantity}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-sm font-bold text-yellow-600">
                        {item.price} XP
                      </span>
                      
                      {item.quantity > 0 ? (
                        <button
                          onClick={() => powerUpStore.usePowerUp(item.id)}
                          className="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg font-medium hover:bg-green-600"
                        >
                          Use
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            const result = powerUpStore.purchasePowerUp(item.id);
                            if (!result.success) {
                              alert(result.message);
                            }
                          }}
                          disabled={!canAfford}
                          className={cn(
                            'px-3 py-1.5 text-xs rounded-lg font-medium',
                            canAfford
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          )}
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    ),
  },
];

  return (
    <div className="max-w-full h-[calc(100vh-100px)] mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">XP Center</h1>
          <p className="text-sm text-gray-500">Level up, complete challenges, earn rewards</p>
        </div>
      </div>

      {/* XP Progress Card */}
      <div className={cn(
        'rounded-2xl border p-6',
        isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'
      )}>
        <div className="flex items-center gap-6">
          <XPProgressRing progress={levelInfo.progress} size={80} strokeWidth={4}>
            <motion.span
              className="text-3xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getLevelIcon(levelInfo.level)}
            </motion.span>
          </XPProgressRing>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-bold">Level {levelInfo.level}</span>
              <span className="text-sm text-gray-500">{levelInfo.title}</span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1">
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{xpStore.totalXP.toLocaleString()} XP</span>
                <span>{levelInfo.nextLevelXP.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-xs">
                <Flame size={12} className="text-orange-500" />
                <span className="font-bold">{xpStore.streak.current}</span>
                <span className="text-gray-500">days</span>
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

      {/* Session Recap */}
      <SessionRecap />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
       

<Tab
  items={tabItems}
  defaultValue="overview"
  value={activeTab}
  onValueChange={(value) => setActiveTab(value as any)}
  isDarkMode={isDarkMode}
  size="default"
  variant="underline" // یا 'underline' بسته به طراحی
/>
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

function formatTimeRemaining(expiresAt: Date): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}