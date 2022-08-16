import { Router } from 'express';
import UserRouter from './UserRouter';
import TogetherListPackRouter from './TogetherListPackRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/list/together/pack', TogetherListPackRouter);

export default router;
