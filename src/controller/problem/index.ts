import { problemSchema } from './validator.js';
import { type Request, type Response } from 'express';
import z from 'zod';
import { createProblem } from '../../usecase/CreateProblemUsecase.js';

export async function problemController(req: Request, res: Response) {
  const parsed = problemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).send({ error: z.treeifyError(parsed.error) });
  }
  const problem = await createProblem(parsed.data);
  return res.status(201).json(problem);
}
