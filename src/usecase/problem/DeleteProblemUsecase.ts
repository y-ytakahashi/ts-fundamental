import { prisma } from '../../db/index.js';
import type { DeleteProblemInput } from '../../controller/problem/validator.js';

export async function deleteProblem(input: DeleteProblemInput) {
  // TODO(Week2): Prisma直呼び。ProblemRepository経由に切り出す対象
  return await prisma.problem.delete({
    where: {
      id: input.problemId,
    },
  });
}
