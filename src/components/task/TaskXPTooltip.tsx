// components/task/TaskXPTooltip.tsx
import React from 'react';
import { Zap, Clock, Star } from 'lucide-react';
import { Task } from '@/types/task.types';
import { XP_VALUES } from '@/stores/xp/xp.types';

interface TaskXPTooltipProps {
  task: Task;
  action: 'complete' | 'start';
}

export const TaskXPTooltip: React.FC<TaskXPTooltipProps> = ({ task, action }) => {
  const calculateXP = (): { base: number; bonuses: { label: string; amount: number }[]; total: number } => {
    let base = action === 'complete' ? XP_VALUES['task:completed'] : XP_VALUES['task:moved_to_progress'];
    const bonuses: { label: string; amount: number }[] = [];
    
    if (action === 'complete') {
      // Priority bonus
      if (task.priority === 'urgent') {
        bonuses.push({ label: 'Urgent Bonus', amount: XP_VALUES['task:priority_urgent_completed'] });
      } else if (task.priority === 'high') {
        bonuses.push({ label: 'High Priority', amount: XP_VALUES['task:priority_high_completed'] });
      }
      
      // Early/on-time bonus
      if (task.dueDate) {
        const now = new Date();
        const dueDate = new Date(task.dueDate);
        
        if (now < dueDate) {
          bonuses.push({ label: 'Early Bird', amount: XP_VALUES['task:completed_early'] - base });
        } else if (now.toDateString() === dueDate.toDateString()) {
          bonuses.push({ label: 'On Time', amount: XP_VALUES['task:completed_on_time'] - base });
        }
      }
    }
    
    const total = base + bonuses.reduce((sum, b) => sum + b.amount, 0);
    return { base, bonuses, total };
  };
  
  const xp = calculateXP();
  
  return (
    <div className="bg-gray-900 text-white rounded-xl p-3 shadow-xl min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        <Zap size={14} className="text-yellow-400" />
        <span className="text-sm font-bold">XP Preview</span>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">Base XP</span>
          <span>+{xp.base}</span>
        </div>
        
        {xp.bonuses.map((bonus, i) => (
          <div key={i} className="flex justify-between">
            <span className="text-gray-400 flex items-center gap-1">
              <Star size={10} className="text-yellow-400" />
              {bonus.label}
            </span>
            <span className="text-green-400">+{bonus.amount}</span>
          </div>
        ))}
        
        <div className="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-yellow-400">+{xp.total} XP</span>
        </div>
      </div>
    </div>
  );
};