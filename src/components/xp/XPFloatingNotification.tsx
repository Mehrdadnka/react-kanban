// components/xp/XPFloatingNotification.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Star, Target, Sparkles, TrendingUp, Award, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPFloatingNotificationProps {
  amount: number;
  action: string;
  style?: React.CSSProperties;
}

const ACTION_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'task:created': Target,
  'task:completed': Trophy,
  'task:completed_early': Sparkles,
  'task:completed_on_time': Star,
  'task:moved_to_progress': TrendingUp,
  'board:created': Shield,
  'milestone:reached': Award,
  default: Zap,
};

const ACTION_LABELS: Record<string, string> = {
  'task:created': 'Task Created',
  'task:completed': 'Task Done!',
  'task:completed_early': 'Early Bird!',
  'task:completed_on_time': 'On Time!',
  'task:moved_to_progress': 'Started!',
  'board:created': 'Board Created',
  'milestone:reached': 'Milestone!',
  default: 'XP Gained',
};

export const XPFloatingNotification: React.FC<XPFloatingNotificationProps> = ({
  amount,
  action,
  style,
}) => {
  const Icon = ACTION_ICONS[action] || ACTION_ICONS.default;
  const label = ACTION_LABELS[action] || `+XP`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -80, scale: 1 }}
      exit={{ opacity: 0, y: -120, scale: 0.8 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={style}
      className="pointer-events-none z-[100]"
    >
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl',
        'bg-gradient-to-r from-yellow-400/90 to-orange-500/90',
        'shadow-lg shadow-orange-500/20',
        'backdrop-blur-sm',
      )}>
        <Icon size={16} className="text-white" />
        <div className="flex flex-col">
          <span className="text-xs font-medium text-white/90">{label}</span>
          <span className="text-lg font-bold text-white leading-tight">
            +{amount} XP
          </span>
        </div>
      </div>
    </motion.div>
  );
};