import { registerSchema } from './validator.js';
import { type Request, type Response } from 'express';
import z from 'zod';
import { registerStudent } from '../../usecase/RegisterStudentUsecase.js';

export async function registerController(req: Request, res: Response) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: z.treeifyError(parsed.error) });
  }

  const student = await registerStudent(parsed.data);
  return res.status(201).json(student);
}
