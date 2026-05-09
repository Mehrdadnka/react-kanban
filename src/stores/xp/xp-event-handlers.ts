// stores/xp/xp-event-handlers.ts
import { useEffect } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';
import { useXPStore } from './xp.store';
import { useTaskStore } from '@/stores/task.store';

export const useXPEventHandlers = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState();
    const xpStore = useXPStore.getState();
    
    const handlers = [
      // Task Created
      eventBus.on('task:created', ({ id, boardId, columnId }) => {
        xpStore.addXP('task:created', { taskId: id, boardId });
        
        if (columnId === 'in-progress') {
          xpStore.addXP('task:moved_to_progress', { taskId: id, boardId });
        }
      }, { priority: 50 }),
      
      // Task Completed (with all the fancy checks)
      eventBus.on('task:completed', ({ id, boardId }) => {
        const taskStore = useTaskStore.getState();
        const task = taskStore.getTaskById(id);
        
        // Base completion XP
        xpStore.addXP('task:completed', { 
          taskId: id, 
          boardId, 
          taskPriority: task?.priority 
        });
        
        // Priority bonuses
        if (task?.priority === 'urgent') {
          xpStore.addXP('task:priority_urgent_completed', { taskId: id, boardId });
        } else if (task?.priority === 'high') {
          xpStore.addXP('task:priority_high_completed', { taskId: id, boardId });
        }
        
        // Early/on-time/late completion
        if (task?.dueDate) {
          const now = new Date();
          const dueDate = new Date(task.dueDate);
          
          if (now < dueDate) {
            xpStore.addXP('task:completed_early', { taskId: id, boardId });
          } else if (now.toDateString() === dueDate.toDateString()) {
            xpStore.addXP('task:completed_on_time', { taskId: id, boardId });
          } else {
            xpStore.addXP('task:completed_overdue', { taskId: id, boardId });
          }
        }
      }, { priority: 50 }),
      
      // Board Created
      eventBus.on('board:created', ({ id }) => {
        xpStore.addXP('board:created', { boardId: id });
      }, { priority: 50 }),
      
      // Time Logged
      eventBus.on('task:time_logged', ({ taskId, hours }) => {
        xpStore.addXP('time:logged', { taskId });
      }, { priority: 50 }),
      
      // Daily Streak
      eventBus.on('system:daily_check', () => {
        xpStore.addXP('board:streak_daily');
      }, { priority: 50 }),
    ];
    
    return () => {
      handlers.forEach(id => eventBus.off(id));
    };
  }, []);
};