import { prisma } from '../../db/index.js';
import type { ListAnswerInput } from '../../controller/student/validator.js';

export async function listStudentAnswers(input: ListAnswerInput) {
  return await prisma.answer.findMany({
    where: {
      studentId: input.studentId,
    },
    include: { problem: true },
  });
}
