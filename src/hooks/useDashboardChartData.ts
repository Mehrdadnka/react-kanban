// hooks/useDashboardChartData.ts - COMPLETE FIXED VERSION
import { useMemo, useRef } from 'react';
import { useTaskStore } from '@/stores/task.store';
import { useBoardStore } from '@/stores/board.store';
import { useXPStore } from '@/stores/xp/xp.store';
import { ChartConfig } from '@/components/charts/chart-carousel/types';

export const useDashboardChartData = () => {
  const allTasks = useTaskStore(state => state.tasks);
  const boards = useBoardStore(state => state.boards);
  const totalXP = useXPStore(state => state.totalXP);
  const currentLevel = useXPStore(state => state.currentLevel);
  const xpEvents = useXPStore(state => state.events);
  
  const recentEvents = useMemo(() => 
    xpEvents ? xpEvents.slice(-50) : []
  , [xpEvents]);

  const overallProgress = useMemo(() => {
    if (!allTasks?.length) return { total: 0, done: 0, inProgress: 0, todo: 0 };
    
    const total = allTasks.length;
    const done = allTasks.filter(t => 
      t.columnId === 'done' || t.status === 'completed'
    ).length;
    const inProgress = allTasks.filter(t => 
      t.columnId === 'in-progress'
    ).length;
    const todo = allTasks.filter(t => 
      t.columnId === 'todo'
    ).length;
    
    return { total, done, inProgress, todo };
  }, [allTasks]);

  // 🏗️ Board Health
  const boardHealthData = useMemo(() => {
    if (!boards?.length || !allTasks?.length) return [];
    
    return boards.map(board => {
      const boardTasks = allTasks.filter(t => t.boardId === board.id);
      const completed = boardTasks.filter(t => 
        t.status === 'completed' || t.columnId === 'done'
      ).length;
      const total = boardTasks.length;
      const health = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: board.title,
        value: health,
        color: board.color,
        total,
        completed,
      };
    }).sort((a, b) => b.value - a.value);
  }, [boards, allTasks]);

  // 🎯 Priority Distribution
  const globalPriorityData = useMemo(() => {
    if (!allTasks?.length) return [];
    
    const priorityMap: Record<string, number> = {};
    
    allTasks.forEach(task => {
      const priority = task.priority || 'medium';
      priorityMap[priority] = (priorityMap[priority] || 0) + 1;
    });

    return Object.entries(priorityMap)
      .map(([label, value]) => ({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  }, [allTasks]);

  // 📈 Productivity Trend
  const productivityTrend = useMemo(() => {
    if (!allTasks?.length) return [];
    
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const created = allTasks.filter(t => {
        const createdAt = new Date(t.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      const completed = allTasks.filter(t => {
        if (!t.completedAt) return false;
        const completedAt = new Date(t.completedAt);
        return completedAt >= dayStart && completedAt <= dayEnd;
      }).length;

      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        completed,
        created,
        inProgress: created - completed,
      });
    }
    return days;
  }, [allTasks]);

  // 🏷️ Label Distribution
  const globalLabelData = useMemo(() => {
    if (!allTasks?.length) return [{ name: 'All Tasks', children: [] }];
    
    const labelMap: Record<string, { count: number }> = {};
    let noLabelCount = 0;

    allTasks.forEach(task => {
      if (!task.labels || task.labels.length === 0) {
        noLabelCount++;
        return;
      }
      
      task.labels.forEach(label => {
        if (!labelMap[label]) {
          labelMap[label] = { count: 0 };
        }
        labelMap[label].count++;
      });
    });

    const children = Object.entries(labelMap)
      .map(([name, data]) => ({
        name,
        value: data.count,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    if (noLabelCount > 0) {
      children.push({ name: 'Unlabeled', value: noLabelCount });
    }

    return [{
      name: 'All Tasks',
      children,
    }];
  }, [allTasks]);

  // ⚡ XP Progress : Calculate manually
  const xpProgressData = useMemo(() => {
    // Manual level calculation (same as store)
    let level = 1;
    let xpRequired = 0;
    let xpForCurrentLevel = 100;
    const total = totalXP || 0;
    
    while (total >= xpRequired + xpForCurrentLevel) {
      xpRequired += xpForCurrentLevel;
      level++;
      xpForCurrentLevel = level * 100 + (level - 1) * 50;
    }
    
    const currentLevelXP = total - xpRequired;
    const progress = Math.min(100, Math.round((currentLevelXP / xpForCurrentLevel) * 100));
    
    // Level titles
    const titles = [
      { max: 5, title: '🌱 Beginner' },
      { max: 10, title: '📚 Learner' },
      { max: 20, title: '⚡ Practitioner' },
      { max: 35, title: '🎯 Expert' },
      { max: 50, title: '🏆 Master' },
      { max: 75, title: '👑 Grandmaster' },
      { max: 100, title: '🌟 Legend' },
      { max: Infinity, title: '🔮 Transcendent' },
    ];
    
    const title = titles.find(t => level <= t.max)?.title || '🌱 Beginner';
    
    return {
      currentXP: currentLevelXP,
      xpToNextLevel: xpForCurrentLevel,
      progress,
      currentLevel: level,
      title,
      totalXP: total,
    };
  }, [totalXP]); // Only depends on totalXP

  // 🎮 Recent Activity
  const recentActivityData = useMemo(() => {
    if (!recentEvents?.length) return Array(7).fill(0);
    
    const last7Days = recentEvents
      .filter(e => {
        const eventDate = new Date(e.timestamp);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return eventDate >= sevenDaysAgo;
      })
      .reduce((acc: Record<string, number>, event) => {
        const day = new Date(event.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
        acc[day] = (acc[day] || 0) + event.finalAmount;
        return acc;
      }, {});

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    const orderedDays = [...days.slice(today + 1), ...days.slice(0, today + 1)];
    
    return orderedDays.slice(-7).map(day => last7Days[day] || 0);
  }, [recentEvents]);

  const heatmapStats = useMemo(() => {
    if (!allTasks?.length) return { totalActivity: 0, activeDays: 0, currentStreak: 0 };

    const activityMap: Record<string, number> = {};
    
    allTasks.forEach(task => {
      // Created date
      const createdDate = new Date(task.createdAt).toISOString().split('T')[0];
      activityMap[createdDate] = (activityMap[createdDate] || 0) + 1;
      
      // Completed date
      if (task.completedAt) {
        const completedDate = new Date(task.completedAt).toISOString().split('T')[0];
        activityMap[completedDate] = (activityMap[completedDate] || 0) + 1;
      }
      
      // Activity logs
      task.activityLog?.forEach(log => {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        activityMap[logDate] = (activityMap[logDate] || 0) + 1;
      });
    });

    const entries = Object.entries(activityMap);
    const totalActivity = entries.reduce((sum, [_, count]) => sum + count, 0);
    const activeDays = entries.filter(([_, count]) => count > 0).length;
    
    // Current streak
    let currentStreak = 0;
    const sortedDates = Object.keys(activityMap).sort().reverse();
    const today = new Date().toISOString().split('T')[0];
    
    for (const date of sortedDates) {
      if (date > today) continue;
      if (activityMap[date] > 0) currentStreak++;
      else if (date < today) break;
    }

    return { totalActivity, activeDays, currentStreak };
  }, [allTasks]);

  // Charts Config - Add heatmap
  const charts: ChartConfig[] = useMemo(() => [
    {
      id: 'overall-progress',
      title: 'Overall Progress',
      subtitle: `${overallProgress.done} of ${overallProgress.total} tasks complete`,
      type: 'ring',
      icon: '🎯',
      color: '#10b981',
      size: 'md',
      options: {},
    },
    {
      id: 'activity-heatmap',
      title: 'Activity Heatmap',
      subtitle: `${heatmapStats.totalActivity} total · ${heatmapStats.currentStreak} day streak 🔥`,
      type: 'custom',
      icon: '🔥',
      color: '#10b981',
      size: 'lg',
      options: {},
    },
    {
      id: 'board-health',
      title: 'Board Health',
      subtitle: `${boards?.length || 0} active boards`,
      type: 'bar',
      icon: '📊',
      color: '#6366f1',
      size: 'md',
      options: {},
    },
    {
      id: 'priority-distribution',
      title: 'Priority Distribution',
      subtitle: 'Across all boards',
      type: 'bar',
      icon: '⚡',
      color: '#f59e0b',
      size: 'md',
      options: {},
    },
    {
      id: 'productivity-trend',
      title: '14-Day Productivity',
      subtitle: 'Tasks created vs completed',
      type: 'area',
      icon: '📈',
      color: '#3b82f6',
      size: 'lg',
      options: {},
    },
    {
      id: 'label-distribution',
      title: 'Label Distribution',
      subtitle: 'Top categories across all tasks',
      type: 'sunburst',
      icon: '🏷️',
      color: '#8b5cf6',
      size: 'lg',
      options: {},
    },
    {
      id: 'xp-activity',
      title: 'XP Activity',
      subtitle: `Level ${xpProgressData.currentLevel} · ${xpProgressData.totalXP.toLocaleString()} XP`,
      type: 'sparkline',
      icon: '🌟',
      color: '#ec4899',
      size: 'md',
      options: {},
    },
  ], [overallProgress, boards?.length, xpProgressData, heatmapStats]);

  return {
    overallProgress,
    boardHealthData,
    globalPriorityData,
    productivityTrend,
    globalLabelData,
    xpProgressData,
    recentActivityData,
    heatmapStats,
    charts,
    totalTasks: allTasks?.length || 0,
    totalBoards: boards?.length || 0,
    totalXP: totalXP || 0,
    currentLevel: currentLevel || 1,
  };
};