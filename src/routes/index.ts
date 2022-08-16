import { Router } from 'express';
import UserRouter from './UserRouter';
import ListRouter from './ListRouter';
const router = Router();

router.use('/user', UserRouter);
router.use('/list', ListRouter);

export default router;
