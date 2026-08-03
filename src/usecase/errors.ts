import { constants } from 'node:http2';

// usecaseのエラーはここにあるカスタムエラークラスを利用して定義すること

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class EmailAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(`Email already exists ${email}`, constants.HTTP_STATUS_CONFLICT);
  }
}
