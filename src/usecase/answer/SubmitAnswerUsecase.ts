import { prisma } from '../../db/index.js';
import type { SubmittedAnswerInput } from '../../controller/answer/validator.js';
import { AppError } from '../errors.js';
import { constants } from 'node:http2';

export async function submitAnswer(input: SubmittedAnswerInput) {
  // TODO(Week2): Prisma直呼び。ProblemRepository経由に切り出す対象
  const problem = await prisma.problem.findUnique({
    where: {
      id: input.problemId,
    },
  });
  if (!problem) {
    throw new AppError('Problem not found', constants.HTTP_STATUS_NOT_FOUND);
  }

  let isCorrect: boolean;
  isCorrect = problem.correctAnswer === input.submittedAnswer;

  // TODO(Week2): Prisma直呼び。AnswerRepository経由に切り出す対象
  return await prisma.answer.create({
    data: {
      submittedAnswer: input.submittedAnswer,
      studentId: input.studentId,
      problemId: input.problemId,
      isCorrect: isCorrect,
    },
  });
}
