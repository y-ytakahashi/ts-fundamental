import { type Request, type Response } from 'express';
import z from 'zod';

import { listAnswerSchema } from './validator.js';
import { listStudentAnswers } from '../../usecase/answer/ListStudentAnswersUsecase.js';

export async function listAnswerHandler(req: Request, res: Response) {
  // 生徒の回答一覧の取得
  const parsed = listAnswerSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).send({ error: z.treeifyError(parsed.error) });
  }
  const answers = await listStudentAnswers(parsed.data);
  return res.status(200).json(answers);
}
