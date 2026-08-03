import { type ErrorRequestHandler } from 'express';
import { AppError } from '../usecase/errors.js';

class ErrorResponseBody {
  readonly error: string;

  constructor(message: string) {
    this.error = message;
  }
}

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(new ErrorResponseBody(err.message));
  }

  return res.status(500).json(new ErrorResponseBody('Internal Server Error'));
};
