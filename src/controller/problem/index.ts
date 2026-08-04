import { problemSchema, deleteProblemSchema } from './validator.js';
import { type Request, type Response } from 'express';
import z from 'zod';
import { createProblem } from '../../usecase/problem/CreateProblemUsecase.js';
import { deleteProblem } from '../../usecase/problem/DeleteProblemUsecase.js';

export async function createProblemHandler(req: Request, res: Response) {
  const parsed = problemSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).send({ error: z.treeifyError(parsed.error) });
  }
  const problem = await createProblem(parsed.data);
  return res.status(201).json(problem);
}

export async function deleteProblemHandler(req: Request, res: Response) {
  const parsed = deleteProblemSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).send({ error: z.treeifyError(parsed.error) });
  }
  const problem = await deleteProblem(parsed.data);
  return res.status(200).json(problem);
}
