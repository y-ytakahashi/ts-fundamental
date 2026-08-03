import express, { type Express, type Request, type Response } from 'express';
import authRouter from './routes/auth/index.js';
import problemRouter from './routes/problem/index.js';
import answerRouter from './routes/answer/index.js';
import { errorHandler } from './handler/error.js';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// middleware
app.use(express.json());

// 認証関連（生徒の新規登録など）
app.use('/api/auth', authRouter);

// 出題問題の追加
app.use('/api', problemRouter);

// 解答の提出
app.use('/api', answerRouter);

// エラーハンドリングミドルウェア
app.use(errorHandler);

app.listen(3000);
