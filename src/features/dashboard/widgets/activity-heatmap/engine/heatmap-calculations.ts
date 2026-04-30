// features/activity-heatmap/engine/heatmap-calculations.ts
import { DayActivity, HeatmapData, ActivityLevel } from '../types';
import { TOTAL_DAYS } from '../constants';
import { Task } from '@/types/task.types';

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getActivityLevel(count: number): ActivityLevel {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

export function formatTooltipDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateHeatmapData(tasks: Task[]): HeatmapData {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const startDate = new Date(today.getTime() - TOTAL_DAYS * 24 * 60 * 60 * 1000);
  startDate.setHours(0, 0, 0, 0);
  const dayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - dayOfWeek);

  const days: DayActivity[] = [];
  const currentDate = new Date(startDate);

  const taskDateMap = new Map<string, number>();
  tasks.forEach(task => {
    const taskDate = getDateString(new Date(task.createdAt));
    taskDateMap.set(taskDate, (taskDateMap.get(taskDate) || 0) + 1);
    
    if (task.updatedAt) {
      const updatedDate = getDateString(new Date(task.updatedAt));
      if (updatedDate !== taskDate) {
        taskDateMap.set(updatedDate, (taskDateMap.get(updatedDate) || 0) + 1);
      }
    }
  });

  while (currentDate <= today) {
    const dateStr = getDateString(currentDate);
    const count = taskDateMap.get(dateStr) || 0;

    days.push({
      date: dateStr,
      count,
      level: getActivityLevel(count),
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const totalActivity = days.reduce((sum, day) => sum + day.count, 0);
  const activeDays = days.filter(d => d.count > 0).length;
  
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) streak++;
    else break;
  }

  return {
    totalActivity,
    activeDays,
    currentStreak: streak,
    days,
  };
}