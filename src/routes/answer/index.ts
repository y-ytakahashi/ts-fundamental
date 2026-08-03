import { Router } from 'express';
import { answerController } from '../../controller/answer/index.js';

const router = Router();
// 回答を登録
router.post('/answer', answerController);

export default router;
