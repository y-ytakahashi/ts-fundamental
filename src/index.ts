import express, { type Express, type Request, type Response } from 'express';
import authRouter from './routes/auth/index.js';

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

// middleware
app.use(express.json());

// 認証関連（生徒の新規登録など）
app.use('/api/auth', authRouter);

app.listen(3000);
