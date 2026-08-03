import { z } from 'zod';
export const problemSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  correctAnswer: z.string().min(1),
});

export type ProblemInput = z.infer<typeof problemSchema>;
