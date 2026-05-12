import { useMemo } from 'react';
import { useTaskStore } from '@/stores/task.store';
import { useBoardStore } from '@/stores/board.store';
import { ChartConfig } from '@/components/charts/chart-carousel/types';

export const useBoardChartData = (boardId: string) => {
  const tasks = useTaskStore(state => state.tasks);
  const boards = useBoardStore(state => state.boards);
  
  const boardTasks = useMemo(() => 
    tasks.filter(t => t.boardId === boardId),
    [tasks, boardId]
  );
  
  const board = boards.find(b => b.id === boardId);

  // Progress metric
  const progressData = useMemo(() => ({
    total: boardTasks.length,
    todo: boardTasks.filter(t => t.columnId === 'todo').length,
    inProgress: boardTasks.filter(t => t.columnId === 'in-progress').length,
    done: boardTasks.filter(t => t.columnId === 'done').length,
  }), [boardTasks]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    const priorities = ['urgent', 'high', 'medium', 'low'];
    return priorities.map(p => ({
      label: p.charAt(0).toUpperCase() + p.slice(1),
      value: boardTasks.filter(t => t.priority === p).length,
    }));
  }, [boardTasks]);

  // Label distribution (for sunburst)
  const labelSunburstData = useMemo(() => {
    const labelCounts: Record<string, number> = {};
    boardTasks.forEach(t => {
      t.labels?.forEach(l => {
        labelCounts[l] = (labelCounts[l] || 0) + 1;
      });
    });

    // "No Label" for tasks without labels
    const noLabelCount = boardTasks.filter(t => !t.labels?.length).length;
    
    return [
      {
        name: 'Tasks',
        children: [
          ...Object.entries(labelCounts).map(([name, value]) => ({
            name,
            value,
          })),
          ...(noLabelCount > 0 ? [{ name: 'No Label', value: noLabelCount }] : []),
        ],
      },
    ];
  }, [boardTasks]);

  // Velocity (last 7 days)
  const velocityData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const created = boardTasks.filter(t => 
        t.createdAt >= dayStart && t.createdAt <= dayEnd
      ).length;
      
      const completed = boardTasks.filter(t => 
        t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;

      days.push({ date: dateStr, completed, created });
    }
    return days;
  }, [boardTasks]);

  // Generate chart configs
  const charts: ChartConfig[] = useMemo(() => [
    {
      id: 'progress',
      title: `${board?.title || 'Board'} Progress`,
      subtitle: `${progressData.done} of ${progressData.total} tasks complete`,
      type: 'ring',
      icon: '🎯',
      color: '#22c55e',
      options: {},
    },
    {
      id: 'priority',
      title: 'Priority Distribution',
      subtitle: 'Tasks by priority level',
      type: 'bar',
      icon: '📊',
      color: '#ef4444',
      options: {},
    },
    {
      id: 'velocity',
      title: '7-Day Velocity',
      subtitle: 'Completed vs Created tasks',
      type: 'area',
      icon: '📈',
      color: '#3b82f6',
      options: {},
    },
    {
      id: 'labels',
      title: 'Label Distribution',
      subtitle: 'Task categorization',
      type: 'sunburst',
      icon: '🏷️',
      color: '#8b5cf6',
      options: {},
    },
  ], [board, progressData, velocityData]);

  return {
    progressData,
    priorityData,
    velocityData,
    labelSunburstData,
    charts,
    board,
  };
};