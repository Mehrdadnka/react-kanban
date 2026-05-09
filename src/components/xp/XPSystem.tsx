// components/xp/XPSystem.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Trophy, Star, TrendingUp, Award, 
  Flame, Target, Sparkles, ChevronUp, Gift,
  X, Crown, Shield, Swords
} from 'lucide-react';
import { useXPStore } from '@/stores/xp/xp.store';
import { useEventBus } from '@/stores/core/event-bus.store';
import { cn } from '@/lib/utils';
import { XPProgressRing } from './XPProgressRing';
import { XPFloatingNotification } from './XPFloatingNotification';
import { AchievementUnlockToast } from './AchievementUnlockToast';
import type { XPEvent } from '@/stores/xp/xp.types';

// ──── Types ────
interface XPFloatingXP {
  id: string;
  amount: number;
  action: string;
  x: number;
  y: number;
}

interface AchievementUnlock {
  id: string;
  achievementId: string;
  name: string;
  rewards: { xp: number; badge?: string; perk?: string };
}

// ──── XP Action Icons ────
const XP_ACTION_ICONS: Record<string, React.FC<{ size?: number }>> = {
  'task:created': Target,
  'task:completed': Trophy,
  'task:completed_early': Sparkles,
  'task:completed_on_time': Star,
  'task:moved_to_progress': TrendingUp,
  'board:created': Shield,
  'milestone:reached': Award,
  default: Zap,
};

// ──── Main Component ────
export const XPSystem: React.FC = () => {
  const { 
    totalXP, currentLevel, levelProgress, xpToNextLevel,
    streak, achievements 
  } = useXPStore();
  
  const [floatingXPs, setFloatingXPs] = useState<XPFloatingXP[]>([]);
  const [achievementQueue, setAchievementQueue] = useState<AchievementUnlock[]>([]);
  const [currentUnlock, setCurrentUnlock] = useState<AchievementUnlock | null>(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number; title: string } | null>(null);
  
  const floatingIdCounter = useRef(0);
  
  // ──── Event Listeners ────
  useEffect(() => {
    const eventBus = useEventBus.getState();
    
    const handleXPGained = (payload: any) => {
      // Add floating XP notification
      const id = `xp-float-${floatingIdCounter.current++}`;
      const randomX = Math.random() * 200 - 100; // -100 to 100px spread
      
      setFloatingXPs(prev => [...prev, {
        id,
        amount: payload.amount,
        action: payload.action,
        x: randomX,
        y: -60 - Math.random() * 40,
      }]);
      
      // Remove after animation
      setTimeout(() => {
        setFloatingXPs(prev => prev.filter(f => f.id !== id));
      }, 1500);
    };
    
    const handleLevelUp = (payload: any) => {
      setLevelUpData({
        oldLevel: payload.oldLevel,
        newLevel: payload.newLevel,
        title: payload.title,
      });
      setShowLevelUp(true);
      
      setTimeout(() => setShowLevelUp(false), 3000);
    };
    
    const handleAchievement = (payload: any) => {
      const unlock: AchievementUnlock = {
        id: `ach-${Date.now()}`,
        achievementId: payload.achievementId,
        name: payload.name,
        rewards: payload.rewards,
      };
      
      setAchievementQueue(prev => [...prev, unlock]);
      
      if (!currentUnlock) {
        setCurrentUnlock(unlock);
        setAchievementQueue(prev => prev.filter(a => a.id !== unlock.id));
      }
    };
    
    const listeners = [
      eventBus.on('xp:gained', handleXPGained, { priority: 0, scope: 'xp' }),
      eventBus.on('xp:level_up', handleLevelUp, { priority: 0, scope: 'xp' }),
      eventBus.on('xp:achievement_unlocked', handleAchievement, { priority: 0, scope: 'xp' }),
    ];
    
    return () => listeners.forEach(id => eventBus.off(id));
  }, [currentUnlock]);
  
  // ──── Achievement queue handler ────
  const handleAchievementDismiss = useCallback(() => {
    setCurrentUnlock(null);
    
    // Show next in queue after delay
    setTimeout(() => {
      setAchievementQueue(prev => {
        if (prev.length > 0) {
          setCurrentUnlock(prev[0]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 500);
  }, []);
  
  // ──── Level info ────
  const levelInfo = useXPStore.getState().calculateLevel(totalXP);
  const xpInLevel = totalXP - (() => {
    let xp = 0;
    for (let i = 1; i < currentLevel; i++) {
      xp += i * 100 + (i - 1) * 50;
    }
    return xp;
  })();
  
  return (
    <>
      {/* ──── Floating XP Notifications ──── */}
      <AnimatePresence>
        {floatingXPs.map(float => (
          <XPFloatingNotification
            key={float.id}
            amount={float.amount}
            action={float.action}
            style={{
              position: 'fixed',
              left: `calc(50% + ${float.x}px)`,
              bottom: '80px',
            }}
          />
        ))}
      </AnimatePresence>
      
      {/* ──── Level Up Celebration ──── */}
      <AnimatePresence>
        {showLevelUp && levelUpData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -20 }}
            className={cn(
              'fixed inset-0 z-50 flex items-center justify-center',
              'pointer-events-none'
            )}
          >
            <div className="text-center">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1.2, 1],
                }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-8xl mb-4"
              >
                {getLevelIcon(currentLevel)}
              </motion.div>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
              >
                LEVEL UP!
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-white/80 mt-2"
              >
                Level {levelUpData.oldLevel} → Level {levelUpData.newLevel}
              </motion.p>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/60 mt-1"
              >
                {levelUpData.title}
              </motion.p>
            </div>
            
            {/* Particle effects background */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    opacity: 0,
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    x: `${50 + (Math.random() - 0.5) * 80}%`,
                    y: `${50 + (Math.random() - 0.5) * 80}%`,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{ duration: 1.5 + Math.random(), delay: Math.random() * 0.5 }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: `hsl(${Math.random() * 60 + 30}, 100%, ${50 + Math.random() * 30}%)`,
                    boxShadow: `0 0 20px hsl(${Math.random() * 60 + 30}, 100%, 60%)`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ──── Achievement Toast ──── */}
      <AnimatePresence>
        {currentUnlock && (
          <AchievementUnlockToast
            achievement={currentUnlock}
            onDismiss={handleAchievementDismiss}
          />
        )}
      </AnimatePresence>
      
      {/* ──── XP Header Bar (in layout) ──── */}
      {/* This gets mounted in the header by the layout */}
    </>
  );
};

// ──── XP Header Bar Component ────
interface XPHeaderBarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const XPHeaderBar: React.FC<XPHeaderBarProps> = ({ collapsed = false, onToggle }) => {
  const { totalXP, currentLevel, levelProgress, xpToNextLevel, streak } = useXPStore();
  
  const xpInLevel = Math.round((levelProgress / 100) * xpToNextLevel);
  
  return (
    <div className="flex items-center gap-3">
      {/* Streak Fire */}
      {streak.current >= 3 && (
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
          'bg-gradient-to-r from-orange-500/20 to-red-500/20',
          'border border-orange-500/30',
        )}>
          <Flame size={14} className="text-orange-500" />
          <span className="text-orange-600 dark:text-orange-400">{streak.current}</span>
        </div>
      )}
      
      {/* Progress Ring */}
      <XPProgressRing
        progress={levelProgress}
        size={collapsed ? 36 : 44}
        strokeWidth={3}
      >
        <span className="text-lg">{getLevelIcon(currentLevel)}</span>
      </XPProgressRing>
      
      {/* Level Info */}
      {!collapsed && (
        <div className="flex flex-col min-w-[80px]">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Lvl {currentLevel}
            </span>
            <ChevronUp size={12} className="text-green-500" />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-400 tabular-nums">
              {xpInLevel}/{xpToNextLevel}
            </span>
          </div>
        </div>
      )}
      
      {/* Total XP */}
      {!collapsed && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Zap size={12} className="text-yellow-500" />
          <span className="font-mono tabular-nums">{totalXP.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
};

// ──── Helper: Level Icons ────
function getLevelIcon(level: number): string {
  if (level >= 100) return '🔮';
  if (level >= 75) return '👑';
  if (level >= 50) return '🏆';
  if (level >= 35) return '🎯';
  if (level >= 20) return '⚡';
  if (level >= 10) return '📚';
  return '🌱';
}