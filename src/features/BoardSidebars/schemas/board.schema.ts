// features/BoardSidebars/schemas/board.schema.ts
import { z } from 'zod';

export const boardFormSchema = z.object({
  // Basic Info
  title: z.string().min(1, 'Board name is required').max(100),
  description: z.string().default(''),
  
  // Appearance
  color: z.string().default('#6366f1'),
  icon: z.string().default('Rocket'),
});

export type BoardFormValues = z.infer<typeof boardFormSchema>;

// Step-specific schemas
export const basicInfoSchema = boardFormSchema.pick({
  title: true,
  description: true,
});

export const appearanceSchema = boardFormSchema.pick({
  color: true,
  icon: true,
});