import { prisma } from '../../db/index.js';
import type { ListAnswerInput } from '../../controller/student/validator.js';

export async function listStudentAnswers(input: ListAnswerInput) {
  // TODO(Week2): Prisma直呼び。AnswerRepository経由に切り出す対象（UC2/UC5で共有する想定）
  return await prisma.answer.findMany({
    where: {
      studentId: input.studentId,
    },
    include: { problem: true },
  });
}
