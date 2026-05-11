// stores/task.store.ts - REFACTORED VERSION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { 
  Task, 
  Attachment, 
  ActivityLog, 
  createDefaultTask, 
  TaskType,
  TaskPriority,
  TaskUpdateData,
} from '@/types/task.types';
import { useBoardStore } from './board.store';
import { useEventBus } from './core/event-bus.store';

// ──── Input Types ────
interface AddTaskInput {
  title: string;
  shortDescription?: string;
  description?: string;
  columnId: string;
  priority: TaskPriority;
  type?: TaskType;
  labels?: string[];
  milestoneIds?: string[];
  projectIds?: string[];
  dueDate?: Date;
  startDate?: Date;
  reminderDate?: Date;
  estimatedHours?: number;
  parentId?: string;
  assigneeId?: string;
  attachments?: Attachment[];
  workingHoursStart?: string;
  workingHoursEnd?: string; 
  boardId: string;
}

interface TaskStore {
  tasks: Task[];
  
  // ──── Core CRUD ────
  addTask: (input: AddTaskInput) => string;
  updateTask: (id: string, updates: TaskUpdateData) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newColumnId: string, newOrder?: number) => void;
  reorderTasks: (activeId: string, overId: string) => void;
  duplicateTask: (id: string) => string;
  
  // ──── Bulk Operations ────
  bulkMoveTasks: (taskIds: string[], targetColumnId: string) => void;
  bulkDeleteTasks: (taskIds: string[]) => void;
  bulkUpdateTasks: (taskIds: string[], updates: Partial<TaskUpdateData>) => void;
  
  // ──── Sub-tasks ────
  addSubTask: (parentId: string, input: AddTaskInput) => string;
  removeSubTask: (parentId: string, subTaskId: string) => void;
  toggleSubTask: (subTaskId: string) => void;
  getSubTasks: (parentId: string) => Task[];
  
  // ──── Related Tasks ────
  addRelatedTask: (taskId: string, relatedId: string) => void;
  removeRelatedTask: (taskId: string, relatedId: string) => void;
  getRelatedTasks: (taskId: string) => Task[];
  
  // ──── Labels ────
  addLabel: (taskId: string, labelId: string) => void;
  removeLabel: (taskId: string, labelId: string) => void;
  
  // ──── Milestones ────
  addMilestone: (taskId: string, milestoneId: string) => void;
  removeMilestone: (taskId: string, milestoneId: string) => void;
  
  // ──── Projects ────
  addProject: (taskId: string, projectId: string) => void;
  removeProject: (taskId: string, projectId: string) => void;
  
  // ──── Attachments ────
  addAttachment: (taskId: string, attachment: Attachment) => void;
  removeAttachment: (taskId: string, attachmentId: string) => void;
  
  // ──── Time Tracking ────
  logTime: (taskId: string, hours: number, description?: string) => void;
  
  // ──── Activity & Queries ────
  getTaskActivity: (taskId: string) => ActivityLog[];
  getTaskById: (id: string) => Task | undefined;
  getTasksByColumn: (columnId: string) => Task[];
  getTasksByMilestone: (milestoneId: string) => Task[];
  getTasksByProject: (projectId: string) => Task[];
  
  // ──── Status Management ────
  completeTask: (taskId: string) => void;
  archiveTask: (taskId: string) => void;
  reopenTask: (taskId: string) => void;
}

// ──── Helpers ────
const createLog = (
  taskId: string, 
  action: ActivityLog['action'], 
  field?: string, 
  oldValue?: string, 
  newValue?: string
): ActivityLog => ({
  id: uuidv4(),
  taskId,
  action,
  field,
  oldValue,
  newValue,
  timestamp: new Date(),
});

const MAX_ACTIVITY_LOGS = 100;

// 🎯 FIXED: Unique IDs for demo tasks
const createDemoTasks = (): Task[] => {
  const now = new Date();
  
  const makeTask = (
    id: string,
    title: string,
    columnId: string,
    boardId: string,
    priority: TaskPriority = 'medium',
    completedDaysAgo?: number,
  ): Task => {
    const boardColumnId = columnId.includes(boardId) 
    ? columnId 
    : `${boardId}-${columnId}`; 
    const task: Task = {
      ...createDefaultTask(columnId, 0, boardId),
      id,
      title,
      shortDescription: `Demo task: ${title}`,
      description: `This is a demo task for ${boardId}`,
      type: 'task',
      priority,
      labels: [],
      milestoneIds: [],
      projectIds: [],
      
      createdAt: now,
      updatedAt: now,
      activityLog: [createLog(id, 'created')],
      order: columnId === 'todo' ? 0 : columnId === 'in-progress' ? 1 : 2,
    };

    if (completedDaysAgo) {
      task.completedAt = new Date(now.getTime() - completedDaysAgo * 24 * 60 * 60 * 1000);
      task.activityLog.push(createLog(id, 'moved', 'column', 'in-progress', 'done'));
    }

    return task;
  };

  return [
    // Board 1 tasks (3 tasks)
    makeTask('task-b1-1', 'Setup Project', 'done', 'board-1', 'high', 2),
    makeTask('task-b1-2', 'Design Database Schema', 'in-progress', 'board-1', 'urgent'),
    makeTask('task-b1-3', 'Write API Documentation', 'todo', 'board-1', 'medium'),
    
    // Board 2 tasks (2 tasks)
    makeTask('task-b2-1', 'Implement Authentication', 'in-progress', 'board-2', 'high'),
    makeTask('task-b2-2', 'Setup CI/CD Pipeline', 'todo', 'board-2', 'medium'),
    
    // Board 3 tasks (1 task)
    makeTask('task-b3-1', 'Create Marketing Plan', 'todo', 'board-3', 'low'),
  ];
};

// ──── Store ────
export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: createDemoTasks(),

      // ──── CORE CRUD ────
      addTask: (input) => {
        const id = uuidv4();
        const tasks = get().tasks;
        const maxOrder = Math.max(
          ...tasks.filter(t => t.columnId === input.columnId).map(t => t.order), 
          -1
        );

        const newTask: Task = {
          ...createDefaultTask(input.columnId, maxOrder + 1, input.boardId),
          id,
          title: input.title,
          shortDescription: input.shortDescription || '',
          description: input.description || '',
          type: input.type || 'task',
          priority: input.priority,
          labels: input.labels || [],
          milestoneIds: input.milestoneIds || [],
          projectIds: input.projectIds || [],
          dueDate: input.dueDate,
          startDate: input.startDate,
          reminderDate: input.reminderDate,
          estimatedHours: input.estimatedHours,
          parentId: input.parentId,
          assigneeId: input.assigneeId,
          attachments: input.attachments || [],
          createdAt: new Date(),
          updatedAt: new Date(),
          workingHoursStart: input.workingHoursStart,
          workingHoursEnd: input.workingHoursEnd,
          activityLog: [createLog(id, 'created')],
        };

        set(state => {
          let updatedTasks = [...state.tasks, newTask];

          // Add to parent's subTasks if parentId exists
          if (input.parentId) {
            updatedTasks = updatedTasks.map(t => {
              if (t.id !== input.parentId) return t;
              return {
                ...t,
                subTasks: [...t.subTasks, id],
                activityLog: [
                  ...t.activityLog, 
                  createLog(input.parentId!, 'subtask_added', 'subtasks', '', id)
                ].slice(-MAX_ACTIVITY_LOGS),
                updatedAt: new Date(),
              };
            });
          }

          return { tasks: updatedTasks };
        });

        // 🎯 EMIT EVENT
        useEventBus.getState().emit('task:created', {
          id: newTask.id,
          boardId: newTask.boardId,
          columnId: newTask.columnId,
          title: newTask.title,
        });

        return id;
      },

      updateTask: (id, updates) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (task.id !== id) return task;

            const logs: ActivityLog[] = [];
            
            // Track changes
            if (updates.title && updates.title !== task.title) 
              logs.push(createLog(id, 'updated', 'title', task.title, updates.title));
            if (updates.priority && updates.priority !== task.priority) 
              logs.push(createLog(id, 'priority_changed', 'priority', task.priority, updates.priority));
            if (updates.description && updates.description !== task.description) 
              logs.push(createLog(id, 'description_updated', 'description'));

            const updatedTask = {
              ...task,
              ...updates,
              updatedAt: new Date(),
              activityLog: [...task.activityLog, ...logs].slice(-MAX_ACTIVITY_LOGS),
            };

            // 🎯 EMIT EVENT if column changed
            if (updates.columnId && updates.columnId !== task.columnId) {
              const isCompleted = updates.columnId === 'done';
              
              useEventBus.getState().emit('task:moved', {
                id: task.id,
                from: task.columnId,
                to: updates.columnId,
                boardId: task.boardId,
              });

              if (isCompleted) {
                useEventBus.getState().emit('task:completed', {
                  id: task.id,
                  boardId: task.boardId,
                });
              }
            }

            return updatedTask;
          }),
        }));
      },

      deleteTask: (id) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;
        
        const boardId = task.boardId;

        set(state => {
          let tasks = state.tasks.filter(t => t.id !== id);

          // Remove from parent's subTasks
          if (task.parentId) {
            tasks = tasks.map(t => 
              t.id === task.parentId 
                ? { 
                    ...t, 
                    subTasks: t.subTasks.filter(stId => stId !== id),
                    updatedAt: new Date(),
                  } 
                : t
            );
          }

          // Delete all sub-tasks recursively
          if (task.subTasks?.length) {
            const idsToRemove = new Set<string>();
            const collectIds = (taskId: string) => {
              const t = tasks.find(t => t.id === taskId);
              if (!t) return;
              idsToRemove.add(taskId);
              t.subTasks.forEach(collectIds);
            };
            task.subTasks.forEach(collectIds);
            tasks = tasks.filter(t => !idsToRemove.has(t.id));
          }

          // Remove from relatedTasks of other tasks
          tasks = tasks.map(t => ({
            ...t,
            relatedTasks: t.relatedTasks.filter(rt => rt !== id),
            updatedAt: t.relatedTasks.includes(id) ? new Date() : t.updatedAt,
          }));

          return { tasks };
        });

        // 🎯 EMIT EVENT
        useEventBus.getState().emit('task:deleted', {
          id,
          boardId,
        });
      },

      moveTask: (id, newColumnId, newOrder?) => {
        const task = get().tasks.find(t => t.id === id);
        if (!task) return;

        const oldColumnId = task.columnId;
        const isCompleted = newColumnId === 'done';

        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== id) return t;
            
            const updates: Partial<Task> = {
              columnId: newColumnId,
              updatedAt: new Date(),
              completedAt: isCompleted ? new Date() : undefined,
              status: isCompleted ? 'completed' : 'active',
            };
            
            if (newOrder !== undefined) updates.order = newOrder;
            
            const log = createLog(id, 'moved', 'column', oldColumnId, newColumnId);
            
            return { 
              ...t, 
              ...updates, 
              activityLog: [...t.activityLog, log].slice(-MAX_ACTIVITY_LOGS) 
            };
          }),
        }));

        // 🎯 EMIT EVENTS
        useEventBus.getState().emit('task:moved', {
          id,
          from: oldColumnId,
          to: newColumnId,
          boardId: task.boardId,
        });

        if (isCompleted && oldColumnId !== 'done') {
          useEventBus.getState().emit('task:completed', {
            id,
            boardId: task.boardId,
          });
        }
      },

      reorderTasks: (activeId, overId) => {
        set(state => {
          const tasks = [...state.tasks];
          const activeIndex = tasks.findIndex(t => t.id === activeId);
          const overIndex = tasks.findIndex(t => t.id === overId);
          
          if (activeIndex !== -1 && overIndex !== -1) {
            const temp = tasks[activeIndex].order;
            tasks[activeIndex] = {
              ...tasks[activeIndex],
              order: tasks[overIndex].order,
              updatedAt: new Date(),
            };
            tasks[overIndex] = {
              ...tasks[overIndex],
              order: temp,
              updatedAt: new Date(),
            };
          }
          
          return { tasks };
        });
      },

      duplicateTask: (id) => {
        const original = get().tasks.find(t => t.id === id);
        if (!original) return '';
        
        const newId = uuidv4();
        const duplicate: Task = {
          ...original,
          id: newId,
          title: `${original.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          activityLog: [createLog(newId, 'created')],
          subTasks: [],
          parentId: undefined,
          relatedTasks: [...original.relatedTasks],
          columnId: original.columnId,
          order: get().tasks.filter(t => t.columnId === original.columnId).length,
        };
        
        set(state => ({ tasks: [...state.tasks, duplicate] }));

        // 🎯 EMIT EVENT
        useEventBus.getState().emit('task:created', {
          id: duplicate.id,
          boardId: duplicate.boardId,
          columnId: duplicate.columnId,
          title: duplicate.title,
        });

        return newId;
      },

      // ──── BULK OPERATIONS ────
      bulkMoveTasks: (taskIds, targetColumnId) => {
        set(state => ({
          tasks: state.tasks.map(task => {
            if (!taskIds.includes(task.id)) return task;
            
            const isCompleted = targetColumnId === 'done';
            return {
              ...task,
              columnId: targetColumnId,
              completedAt: isCompleted ? new Date() : undefined,
              status: isCompleted ? 'completed' : 'active',
              updatedAt: new Date(),
              activityLog: [
                ...task.activityLog,
                createLog(task.id, 'moved', 'column', task.columnId, targetColumnId),
              ].slice(-MAX_ACTIVITY_LOGS),
            };
          }),
        }));

        // 🎯 EMIT BULK EVENT
        useEventBus.getState().emit('task:bulk-moved', {
          taskIds,
          targetColumnId,
        });
      },

      bulkDeleteTasks: (taskIds) => {
        // Emit before delete
        taskIds.forEach(id => {
          const task = get().tasks.find(t => t.id === id);
          if (task) {
            useEventBus.getState().emit('task:deleted', {
              id,
              boardId: task.boardId,
            });
          }
        });
        
        taskIds.forEach(id => get().deleteTask(id));
      },

      bulkUpdateTasks: (taskIds, updates) => {
        taskIds.forEach(id => get().updateTask(id, updates));
      },

      // ──── SUB-TASKS ────
      addSubTask: (parentId, input) => {
        return get().addTask({ ...input, parentId });
      },

      removeSubTask: (parentId, subTaskId) => {
        get().deleteTask(subTaskId);
      },

      toggleSubTask: (subTaskId) => {
        const task = get().tasks.find(t => t.id === subTaskId);
        if (!task) return;
        const newColumnId = task.columnId === 'done' ? 'todo' : 'done';
        get().moveTask(subTaskId, newColumnId);
      },

      getSubTasks: (parentId) => {
        const parent = get().tasks.find(t => t.id === parentId);
        if (!parent) return [];
        return get().tasks.filter(t => parent.subTasks.includes(t.id));
      },

      // ──── RELATED TASKS ────
      addRelatedTask: (taskId, relatedId) => {
        if (taskId === relatedId) return;
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id === taskId && !t.relatedTasks.includes(relatedId)) {
              return {
                ...t,
                relatedTasks: [...t.relatedTasks, relatedId],
                activityLog: [
                  ...t.activityLog, 
                  createLog(taskId, 'related_task_added', 'relatedTasks', '', relatedId)
                ].slice(-MAX_ACTIVITY_LOGS),
                updatedAt: new Date(),
              };
            }
            if (t.id === relatedId && !t.relatedTasks.includes(taskId)) {
              return {
                ...t,
                relatedTasks: [...t.relatedTasks, taskId],
                updatedAt: new Date(),
              };
            }
            return t;
          }),
        }));
      },

      removeRelatedTask: (taskId, relatedId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                relatedTasks: t.relatedTasks.filter(rt => rt !== relatedId),
                activityLog: [
                  ...t.activityLog, 
                  createLog(taskId, 'related_task_removed', 'relatedTasks', relatedId, '')
                ].slice(-MAX_ACTIVITY_LOGS),
                updatedAt: new Date(),
              };
            }
            if (t.id === relatedId) {
              return {
                ...t,
                relatedTasks: t.relatedTasks.filter(rt => rt !== taskId),
                updatedAt: new Date(),
              };
            }
            return t;
          }),
        }));
      },

      getRelatedTasks: (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return [];
        return get().tasks.filter(t => task.relatedTasks.includes(t.id));
      },

      // ──── LABELS ────
      addLabel: (taskId, labelId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId || t.labels.includes(labelId)) return t;
            return {
              ...t,
              labels: [...t.labels, labelId],
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'label_changed', 'labels', '', labelId)
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      removeLabel: (taskId, labelId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              labels: t.labels.filter(l => l !== labelId),
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'label_changed', 'labels', labelId, 'removed')
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      // ──── MILESTONES ────
      addMilestone: (taskId, milestoneId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId || t.milestoneIds.includes(milestoneId)) return t;
            return {
              ...t,
              milestoneIds: [...t.milestoneIds, milestoneId],
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'milestone_changed', 'milestones', '', milestoneId)
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      removeMilestone: (taskId, milestoneId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              milestoneIds: t.milestoneIds.filter(m => m !== milestoneId),
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'milestone_changed', 'milestones', milestoneId, 'removed')
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      // ──── PROJECTS ────
      addProject: (taskId, projectId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId || t.projectIds.includes(projectId)) return t;
            return {
              ...t,
              projectIds: [...t.projectIds, projectId],
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'project_changed', 'projects', '', projectId)
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      removeProject: (taskId, projectId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              projectIds: t.projectIds.filter(p => p !== projectId),
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'project_changed', 'projects', projectId, 'removed')
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      // ──── ATTACHMENTS ────
      addAttachment: (taskId, attachment) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              attachments: [...t.attachments, attachment],
              activityLog: [
                ...t.activityLog, 
                createLog(taskId, 'attachment_added', 'attachments', '', attachment.name)
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      removeAttachment: (taskId, attachmentId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            return { 
              ...t, 
              attachments: t.attachments.filter(a => a.id !== attachmentId), 
              updatedAt: new Date() 
            };
          }),
        }));
      },

      // ──── TIME TRACKING ────
      logTime: (taskId, hours, description) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t;
            const timeLog = {
              id: uuidv4(),
              taskId,
              hours,
              description,
              date: new Date(),
              createdAt: new Date(),
            };
            return {
              ...t,
              timeSpent: (t.timeSpent || 0) + hours,
              timeLogs: [...(t.timeLogs || []), timeLog],
              activityLog: [
                ...t.activityLog,
                createLog(taskId, 'time_logged', 'timeSpent', t.timeSpent?.toString(), ((t.timeSpent || 0) + hours).toString()),
              ].slice(-MAX_ACTIVITY_LOGS),
              updatedAt: new Date(),
            };
          }),
        }));
      },

      // ──── ACTIVITY & QUERIES ────
      getTaskActivity: (taskId) => {
        const task = get().tasks.find(t => t.id === taskId);
        return task?.activityLog || [];
      },

      getTaskById: (id) => {
        return get().tasks.find(t => t.id === id);
      },

      getTasksByColumn: (columnId) => {
        return get().tasks.filter(t => t.columnId === columnId);
      },

      getTasksByMilestone: (milestoneId) => {
        return get().tasks.filter(t => t.milestoneIds.includes(milestoneId));
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter(t => t.projectIds.includes(projectId));
      },

      // ──── STATUS MANAGEMENT ────
      completeTask: (taskId) => {
        get().updateTask(taskId, { 
          status: 'completed', 
          completedAt: new Date(),
          columnId: 'done' 
        });
      },

      archiveTask: (taskId) => {
        get().updateTask(taskId, { 
          status: 'archived' 
        });
      },

      reopenTask: (taskId) => {
        get().updateTask(taskId, { 
          status: 'active', 
          completedAt: undefined,
          columnId: 'todo' 
        });
      },
    }),
    {
      name: 'taskflow-storage-v7',
      version: 7,
      migrate: (persistedState: any, version: number) => {
        if (version < 7) {
          return {
            ...persistedState,
            tasks: persistedState.tasks.map((task: Task) => ({
              ...task,
              milestoneIds: task.milestoneIds || [],
              projectIds: task.projectIds || [],
              shortDescription: task.shortDescription || '',
              status: task.status || 'active',
              timeSpent: task.timeSpent || 0,
            })),
          };
        }
        return persistedState;
      },
    }
  )
);