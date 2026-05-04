// src/features/TaskSidebars/create/schemas/task.schema.ts
import { z } from 'zod';

export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['image', 'file']),
  url: z.string().optional(),
  content: z.string().optional(),
});

// ✅ Base schema بدون refinement
const baseTaskSchema = z.object({
  // Step 1: Quick Create (Required)
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be under 100 characters'),
  shortDescription: z.string()
    .min(1, 'Short description is required')
    .max(200, 'Short description must be under 200 characters'),
  
  type: z.enum(['task', 'bug', 'milestone', 'epic']).optional().default('task'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  columnId: z.string().optional().default('todo'),
  labels: z.array(z.string()).optional().default([]),
  milestoneIds: z.array(z.string()).optional().default([]),
  projectIds: z.array(z.string()).optional().default([]),

  // Step 2: Full Details (Optional)
  description: z.string().default(''),

  // Step 3: Schedule (Optional)
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  reminderDate: z.date().nullable().optional(),

  // Step 4: Meta (Optional)
  attachments: z.array(attachmentSchema).optional().default([]),
  estimatedHours: z.number()
    .positive('Must be greater than 0')
    .max(1000, 'Estimated hours seems too high')
    .nullable()
    .optional(),
  relatedTaskIds: z.array(z.string()).default([]),
  assigneeId: z.string().nullable().optional(),
});

// ✅ Full schema با refinement
export const taskFormSchema = baseTaskSchema.refine(
  (data) => {
    if (data.startDate && data.dueDate) {
      return data.startDate <= data.dueDate;
    }
    return true;
  },
  {
    message: 'Start date must be before due date',
    path: ['dueDate'],
  }
);

export type TaskFormValues = z.infer<typeof taskFormSchema>;

// ✅ Step-specific schemas از baseTaskSchema (بدون refinement)
export const quickCreateSchema = baseTaskSchema.pick({
  title: true,
  shortDescription: true,
  type: true,
  priority: true,
  columnId: true,
  labels: true,
  milestoneIds: true,
  projectIds: true,
});

export const detailsSchema = baseTaskSchema.pick({
  description: true,
});

export const scheduleSchema = baseTaskSchema.pick({
  startDate: true,
  dueDate: true,
  reminderDate: true,
}).refine(
  (data) => {
    if (data.startDate && data.dueDate) {
      return data.startDate <= data.dueDate;
    }
    return true;
  },
  {
    message: 'Start date must be before due date',
    path: ['dueDate'],
  }
);

export const metaSchema = baseTaskSchema.pick({
  attachments: true,
  estimatedHours: true,
  relatedTaskIds: true,
  assigneeId: true,
});