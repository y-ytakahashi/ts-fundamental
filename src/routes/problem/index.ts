import { Router } from 'express';
import { createProblemHandler, deleteProblemHandler } from '../../controller/problem/index.js';

const router = Router();
router.get('/problem', (req, res) => {
  res.send('problem api');
});

router.post('/problem', createProblemHandler);
router.delete('/problem/:problemId', deleteProblemHandler);

export default router;
