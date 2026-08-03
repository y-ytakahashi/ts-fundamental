import { prisma } from '../db/index.js';
import type { ProblemInput } from '../controller/problem/validator.js';

export async function createProblem(input: ProblemInput) {
  return await prisma.problem.create({
    data: {
      title: input.title,
      body: input.body,
      correctAnswer: input.correctAnswer,
    },
  });
}
