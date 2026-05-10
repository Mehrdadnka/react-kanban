// stores/xp/xp-analytics.ts
import { useXPStore } from './xp.store';
import type { XPEvent } from './xp.types';

export interface XPAnalytics {
  predictNextLevel: () => { estimatedDate: Date; daysRemaining: number };
  getMostValuableActions: () => { action: string; totalXP: number }[];
  getProductivityTrend: () => { dates: string[]; values: number[] };
  getLevelTimeline: () => { level: number; reachedAt: Date }[];
  getWeeklyReport: () => { totalXP: number; tasksCompleted: number; bestDay: string };
}

export const useXPAnalytics = (): XPAnalytics => {
  const xpStore = useXPStore.getState();
  const events = xpStore.events;
  
  const predictNextLevel = () => {
    const xpStore = useXPStore.getState();
    const events = xpStore.events;
    if (events.length < 5) {
      return { 
        estimatedDate: new Date(Date.now() + 7 * 86400000), 
        daysRemaining: 7 
      };
    }
    
    // Get last 14 days
    const twoWeeksAgo = Date.now() - 14 * 86400000;
    const recentEvents = events.filter(e => e.timestamp.getTime() > twoWeeksAgo);
    
    if (recentEvents.length === 0) {
      return { estimatedDate: new Date(), daysRemaining: 999 };
    }
    
    const oldestDate = recentEvents[0].timestamp;
    const newestDate = recentEvents[recentEvents.length - 1].timestamp;
    const daysDiff = Math.max(1, (newestDate.getTime() - oldestDate.getTime()) / 86400000);
    
    const recentXP = recentEvents.reduce((sum, e) => sum + e.finalAmount, 0);
    const avgXPPerDay = recentXP / daysDiff;
    
    if (avgXPPerDay <= 0) {
      return { estimatedDate: new Date(), daysRemaining: 999 };
    }
    
    const xpNeeded = xpStore.xpToNextLevel - 
      (xpStore.totalXP % xpStore.xpToNextLevel || xpStore.xpToNextLevel);
    const daysRemaining = Math.max(1, Math.ceil(xpNeeded / avgXPPerDay));
    
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);
    
    return { estimatedDate, daysRemaining };
  };
  
  const getMostValuableActions = () => {
    const actionTotals: Record<string, number> = {};
    
    events.forEach(e => {
      actionTotals[e.action] = (actionTotals[e.action] || 0) + e.finalAmount;
    });
    
    return Object.entries(actionTotals)
      .map(([action, totalXP]) => ({ action, totalXP }))
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, 5);
  };
  
  const getProductivityTrend = () => {
    const last14Days: { date: string; xp: number }[] = [];
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();
      const xp = xpStore.dailyXP.get(dateKey) || 0;
      last14Days.push({ date: dateKey, xp });
    }
    
    return {
      dates: last14Days.map(d => d.date),
      values: last14Days.map(d => d.xp),
    };
  };
  
  const getLevelTimeline = () => {
    const timeline: { level: number; reachedAt: Date }[] = [];
    let cumulativeXP = 0;
    let currentLevel = 1;
    let xpForCurrentLevel = 100;
    
    timeline.push({ level: 1, reachedAt: events[0]?.timestamp || new Date() });
    
    events.forEach(event => {
      cumulativeXP += event.finalAmount;
      
      while (cumulativeXP >= xpForCurrentLevel) {
        cumulativeXP -= xpForCurrentLevel;
        currentLevel++;
        xpForCurrentLevel = currentLevel * 100 + (currentLevel - 1) * 50;
        timeline.push({ level: currentLevel, reachedAt: event.timestamp });
      }
    });
    
    return timeline;
  };
  
  const getWeeklyReport = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weeklyEvents = events.filter(e => e.timestamp >= weekStart);
    const totalXP = weeklyEvents.reduce((sum, e) => sum + e.finalAmount, 0);
    const tasksCompleted = weeklyEvents.filter(e => 
      e.action === 'task:completed' || 
      e.action === 'task:completed_early' || 
      e.action === 'task:completed_on_time'
    ).length;
    
    // Find best day
    const dailyTotals: Record<string, number> = {};
    weeklyEvents.forEach(e => {
      const day = e.timestamp.toDateString();
      dailyTotals[day] = (dailyTotals[day] || 0) + e.finalAmount;
    });
    
    const bestDay = Object.entries(dailyTotals)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';
    
    return { totalXP, tasksCompleted, bestDay };
  };
  
  return {
    predictNextLevel,
    getMostValuableActions,
    getProductivityTrend,
    getLevelTimeline,
    getWeeklyReport,
  };
};