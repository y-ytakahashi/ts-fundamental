import type { RegisterInput } from '../../controller/auth/validator.js';
import argon from 'argon2';
import { prisma } from '../../db/index.js';
import { EmailAlreadyExistsError } from '../errors.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export async function registerStudent(input: RegisterInput) {
  const hashPassword = await argon.hash(input.password);
  try {
    // TODO(Week2): Prisma直呼び。StudentRepository経由に切り出す対象
    const student = await prisma.student.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: hashPassword,
      },
    });
    const { passwordHash, ...rest } = student;
    return rest;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new EmailAlreadyExistsError(input.email);
    }
    throw error;
  }
}
