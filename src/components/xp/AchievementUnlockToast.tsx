// components/xp/AchievementUnlockToast.tsx
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Gift, Shield, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface AchievementUnlockToastProps {
  achievement: {
    id: string;
    name: string;
    rewards: { xp: number; badge?: string; perk?: string };
  };
  onDismiss: () => void;
}

export const AchievementUnlockToast: React.FC<AchievementUnlockToastProps> = ({
  achievement,
  onDismiss,
}) => {
  const { isDarkMode } = useApp();
  
  // Auto dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      className="fixed top-4 right-4 z-[100]"
    >
      <div className={cn(
        'relative w-80 rounded-2xl overflow-hidden',
        'border shadow-2xl',
        isDarkMode 
          ? 'bg-gray-900 border-yellow-500/30' 
          : 'bg-white border-yellow-300'
      )}>
        {/* Shine effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              x: ['-100%', '200%'],
              opacity: [0, 0.5, 0],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="w-20 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </div>
        
        {/* Content */}
        <div className="p-4 relative">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3, repeatDelay: 1 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-yellow-500/30"
              >
                <Trophy size={24} className="text-white" />
              </motion.div>
              <Sparkles size={12} className="absolute -top-1 -right-1 text-yellow-400" />
            </div>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500">
                  Achievement Unlocked!
                </span>
              </div>
              <h4 className="font-bold text-sm mb-2">{achievement.name}</h4>
              
              {/* Rewards */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-bold',
                  'bg-gradient-to-r from-yellow-100 to-orange-100',
                  'text-orange-700',
                  'dark:from-yellow-900/30 dark:to-orange-900/30',
                  'dark:text-yellow-400'
                )}>
                  +{achievement.rewards.xp} XP
                </span>
                
                {achievement.rewards.badge && (
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                    'bg-blue-100 text-blue-700',
                    'dark:bg-blue-900/30 dark:text-blue-400'
                  )}>
                    <Gift size={10} className="inline mr-1" />
                    {achievement.rewards.badge} Badge
                  </span>
                )}
                
                {achievement.rewards.perk && (
                  <span className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-medium',
                    'bg-purple-100 text-purple-700',
                    'dark:bg-purple-900/30 dark:text-purple-400'
                  )}>
                    <Shield size={10} className="inline mr-1" />
                    {achievement.rewards.perk}
                  </span>
                )}
              </div>
            </div>
            
            {/* Close */}
            <button
              onClick={onDismiss}
              className={cn(
                'p-1 rounded-lg transition-colors',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'text-gray-400'
              )}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        
        {/* Progress bar (auto-dismiss timer) */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 4, ease: 'linear' }}
          className="h-1 bg-gradient-to-r from-yellow-400 to-orange-500 origin-left"
        />
      </div>
    </motion.div>
  );
};