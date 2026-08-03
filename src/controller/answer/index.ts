import { type Request, type Response } from 'express';
import z from 'zod';
import { submittedAnswerSchema } from './validator.js';
import { submitAnswer } from '../../usecase/SubmitAnswerUsecase.js';

export async function answerController(req: Request, res: Response) {
  const parsed = submittedAnswerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).send({ error: z.treeifyError(parsed.error) });
  }
  const answer = await submitAnswer(parsed.data);
  return res.status(201).json(answer);
}
