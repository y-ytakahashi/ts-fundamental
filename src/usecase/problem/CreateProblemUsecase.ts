import { prisma } from '../../db/index.js';
import type { ProblemInput } from '../../controller/problem/validator.js';

export async function createProblem(input: ProblemInput) {
  // TODO(Week2): Prisma直呼び。ProblemRepository経由に切り出す対象
  return await prisma.problem.create({
    data: {
      title: input.title,
      body: input.body,
      correctAnswer: input.correctAnswer,
    },
  });
}
