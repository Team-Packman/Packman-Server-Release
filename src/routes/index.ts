import { Router } from 'express';
import UserRouter from './UserRouter';
import AuthRouter from './AuthRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/auth', AuthRouter);

export default router;
