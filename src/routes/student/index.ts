import { Router } from 'express';
import { listAnswerHandler } from '../../controller/student/index.js';

const router = Router();
router.get('/:studentId/answers', listAnswerHandler);

export default router;
