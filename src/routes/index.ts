import { Router } from 'express';
import UserRouter from './UserRouter';
import AuthRouter from './AuthRouter';
import TogetherListRouter from './TogetherListRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/auth', AuthRouter);
router.use('/list/together', TogetherListRouter);

export default router;
