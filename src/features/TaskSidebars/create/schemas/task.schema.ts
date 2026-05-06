import { z } from 'zod';

export const attachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['image', 'file']),
  url: z.string().optional(),
  content: z.string().optional(),
});

const baseTaskSchema = z.object({
  // Step 1: Quick Create (Required)
  title: z.string().min(1).max(100),
  shortDescription: z.string().min(1).max(200),
  
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
  estimatedHours: z.number().positive().max(1000).nullable().optional(),
  relatedTaskIds: z.array(z.string()).default([]),
  assigneeId: z.string().nullable().optional(),
});

export const taskFormSchema = baseTaskSchema.refine(
  (data) => {
    if (data.startDate && data.dueDate) {
      return data.startDate <= data.dueDate;
    }
    return true;
  }
);

export type TaskFormValues = z.infer<typeof taskFormSchema>;

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
  }
);


export const metaSchema = baseTaskSchema.pick({
  attachments: true,
  estimatedHours: true,
  relatedTaskIds: true,
  assigneeId: true,
});