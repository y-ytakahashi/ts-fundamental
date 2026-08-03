import { Router } from 'express';
import { problemController } from '../../controller/problem/index.js';

const router = Router();
router.get('/problem', (req, res) => {
  res.send('problem api');
});

router.post('/problem', problemController);

export default router;
