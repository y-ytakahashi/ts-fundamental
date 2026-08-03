import { z } from 'zod';

export const listAnswerSchema = z.object({
  studentId: z.string().trim().min(1),
});

export type ListAnswerInput = z.infer<typeof listAnswerSchema>;
