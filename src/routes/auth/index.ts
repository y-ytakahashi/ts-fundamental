import { Router } from 'express';
import { registerController } from '../../controller/auth/index.js';

const router = Router();

router.post('/register', registerController);

export default router;
