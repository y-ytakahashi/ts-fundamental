import { z } from 'zod';

export const submittedAnswerSchema = z.object({
  studentId: z.string().min(1),
  problemId: z.string().min(1),
  submittedAnswer: z.string().min(1),
});

export type SubmittedAnswerInput = z.infer<typeof submittedAnswerSchema>;
