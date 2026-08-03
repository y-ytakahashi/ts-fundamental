import { Router } from 'express';
import { submitAnswerHandler } from '../../controller/answer/index.js';

const router = Router();
// 回答を登録
router.post('/answer', submitAnswerHandler);

export default router;
