// heatmap-calculations.ts
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

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - TOTAL_DAYS + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday
  const daysToMonday = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
  startDate.setDate(startDate.getDate() - daysToMonday);

  const days: DayActivity[] = [];
  const currentDate = new Date(startDate);

  const taskDateMap = new Map<string, number>();
  
  tasks.forEach(task => {
    if (task.createdAt) {
      const createdDate = getDateString(new Date(task.createdAt));
      taskDateMap.set(createdDate, (taskDateMap.get(createdDate) || 0) + 1);
    }
    
    if (task.updatedAt && task.updatedAt !== task.createdAt) {
      const updatedDate = getDateString(new Date(task.updatedAt));
      taskDateMap.set(updatedDate, (taskDateMap.get(updatedDate) || 0) + 1);
    }
  });

  let dayCount = 0;
  while (currentDate <= today && dayCount < 400) { 
    const dateStr = getDateString(currentDate);
    const count = taskDateMap.get(dateStr) || 0;

    days.push({
      date: dateStr,
      count,
      level: getActivityLevel(count),
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }

  console.log('Days generated:', days.length);
  console.log('First few days:', days.slice(0, 5));
  console.log('Last few days:', days.slice(-5));

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