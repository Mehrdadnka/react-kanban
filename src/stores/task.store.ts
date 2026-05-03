import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task, Attachment, ActivityLog, createDefaultTask } from '@/types/task.types';

interface AddTaskInput {
title: string;
description?: string;
columnId: string;
priority: Task['priority'];
labels?: string[];
dueDate?: Date;
startDate?: Date;
parentId?: string;
}

interface UpdateTaskInput extends Partial<Omit<Task, 'id' | 'createdAt' | 'activityLog' | 'subTasks'>> {
}

interface TaskStore {
tasks: Task[];

// Core CRUD
addTask: (input: AddTaskInput) => string;
updateTask: (id: string, updates: Partial<Task>) => void;
deleteTask: (id: string) => void;
moveTask: (id: string, newColumnId: string, newOrder?: number) => void;
reorderTasks: (activeId: string, overId: string) => void;

// Sub-tasks
addSubTask: (parentId: string, input: AddTaskInput) => string;
removeSubTask: (parentId: string, subTaskId: string) => void;
toggleSubTask: (subTaskId: string) => void;

// Labels
addLabel: (taskId: string, labelId: string) => void;
removeLabel: (taskId: string, labelId: string) => void;

// Attachments
addAttachment: (taskId: string, attachment: Attachment) => void;
removeAttachment: (taskId: string, attachmentId: string) => void;

// Activity
getTaskActivity: (taskId: string) => ActivityLog[];

// Bulk
duplicateTask: (id: string) => string | void;
}

// Helper: create activity log entry
const createLog = (taskId: string, action: ActivityLog['action'], field?: string, oldValue?: string, newValue?: string): ActivityLog => ({
id: uuidv4(),
taskId,
action,
field,
oldValue,
newValue,
timestamp: new Date(),
});

// Helper: push log to task
const logActivity = (task: Task, log: ActivityLog): Task => ({
...task,
activityLog: [...(task.activityLog || []), log].slice(-50), // keep last 50
});

export const useTaskStore = create<TaskStore>()(
persist(
(set, get) => ({
tasks: [
{
...createDefaultTask('todo', 0),
id: uuidv4(),
title: 'Welcome!',
description: 'This is your first task',
columnId: 'todo',
priority: 'medium',
createdAt: new Date(),
updatedAt: new Date(),
activityLog: [],
labels: [],
subTasks: [],
attachments: [],
},
],

// ──── CORE CRUD ────

addTask: (input) => {
const id = uuidv4();
const tasks = get().tasks;
const maxOrder = Math.max(...tasks.filter(t => t.columnId === input.columnId).map(t => t.order), -1);

const newTask: Task = {
...createDefaultTask(input.columnId, maxOrder + 1),
id,
title: input.title,
description: input.description || '',
priority: input.priority,
labels: input.labels || [],
dueDate: input.dueDate,
startDate: input.startDate,
parentId: input.parentId,
createdAt: new Date(),
updatedAt: new Date(),
activityLog: [createLog(id, 'created')],
};

set(state => ({
tasks: [...state.tasks, newTask],
}));

// If this is a sub-task, add it to parent
if (input.parentId) {
get().addSubTask(input.parentId, input);
}

return id;
},

updateTask: (id, updates) => {
set(state => ({
tasks: state.tasks.map(task => {
if (task.id !== id) return task;

// Build activity logs for changed fields
const logs: ActivityLog[] = [];

if (updates.title && updates.title !== task.title) {
logs.push(createLog(id, 'updated', 'title', task.title, updates.title));
}
if (updates.priority && updates.priority !== task.priority) {
logs.push(createLog(id, 'priority_changed', 'priority', task.priority, updates.priority));
}
if (updates.dueDate && updates.dueDate !== task.dueDate) {
logs.push(createLog(id, 'due_date_changed', 'dueDate',
task.dueDate?.toISOString(), updates.dueDate?.toISOString()));
}
if (updates.columnId && updates.columnId !== task.columnId) {
logs.push(createLog(id, 'moved', 'column', task.columnId, updates.columnId));
}

const updated: Task = {
...task,
...updates,
updatedAt: new Date(),
activityLog: [...task.activityLog, ...logs].slice(-50),
};

return updated;
}),
}));
},

deleteTask: (id) => {
const task = get().tasks.find(t => t.id === id);

set(state => {
let tasks = state.tasks.filter(t => t.id !== id);

// Remove from parent's subTasks if exists
if (task?.parentId) {
tasks = tasks.map(t =>
t.id === task.parentId
? { ...t, subTasks: t.subTasks.filter(stId => stId !== id) }
: t
);
}

// Delete all sub-tasks recursively
if (task?.subTasks?.length) {
const idsToRemove = new Set(task.subTasks);
tasks = tasks.filter(t => !idsToRemove.has(t.id));
}

return { tasks };
});
},

moveTask: (id, newColumnId, newOrder?) => {
set(state => ({
tasks: state.tasks.map(task => {
if (task.id !== id) return task;

const updates: Partial<Task> = {
columnId: newColumnId,
updatedAt: new Date(),
completedAt: newColumnId === 'done' ? new Date() : task.completedAt,
};

if (newOrder !== undefined) {
updates.order = newOrder;
}

const log = createLog(id, 'moved', 'column', task.columnId, newColumnId);

return {
...task,
...updates,
activityLog: [...task.activityLog, log].slice(-50),
};
}),
}));
},

reorderTasks: (activeId, overId) => {
set(state => {
const tasks = [...state.tasks];
const activeIndex = tasks.findIndex(t => t.id === activeId);
const overIndex = tasks.findIndex(t => t.id === overId);

if (activeIndex !== -1 && overIndex !== -1) {
const activeOrder = tasks[activeIndex].order;
const overOrder = tasks[overIndex].order;
tasks[activeIndex] = { ...tasks[activeIndex], order: overOrder, updatedAt: new Date() };
tasks[overIndex] = { ...tasks[overIndex], order: activeOrder, updatedAt: new Date() };
}

return { tasks };
});
},

// ──── SUB-TASKS ────

addSubTask: (parentId, input) => {
const childId = get().addTask({ ...input, parentId });

set(state => ({
tasks: state.tasks.map(t => {
if (t.id !== parentId) return t;
return {
...t,
subTasks: [...t.subTasks, childId],
activityLog: [...t.activityLog, createLog(parentId, 'subtask_added', 'subtasks', '', childId)].slice(-50),
updatedAt: new Date(),
};
}),
}));

return childId;
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

// ──── LABELS ────

addLabel: (taskId, labelId) => {
set(state => ({
tasks: state.tasks.map(t => {
if (t.id !== taskId) return t;
if (t.labels.includes(labelId)) return t;
return {
...t,
labels: [...t.labels, labelId],
activityLog: [...t.activityLog, createLog(taskId, 'label_changed', 'labels', '', labelId)].slice(-50),
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
activityLog: [...t.activityLog, createLog(taskId, 'label_changed', 'labels', labelId, 'removed')].slice(-50),
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
activityLog: [...t.activityLog, createLog(taskId, 'attachment_added', 'attachments', '', attachment.name)].slice(-50),
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
updatedAt: new Date(),
};
}),
}));
},

// ──── ACTIVITY ────

getTaskActivity: (taskId) => {
const task = get().tasks.find(t => t.id === taskId);
return task?.activityLog || [];
},

// ──── BULK ────

duplicateTask: (id) => {
const original = get().tasks.find(t => t.id === id);
if (!original) return;

const newId = uuidv4();
const duplicate: Task = {
...original,
id: newId,
title: `${original.title} (copy)`,
createdAt: new Date(),
updatedAt: new Date(),
activityLog: [createLog(newId, 'created')],
subTasks: [],
parentId: undefined,
};

set(state => ({
tasks: [...state.tasks, duplicate],
}));

return newId;
},
}),
{
name: 'taskflow-storage-v2',
version: 2,
}
)
);