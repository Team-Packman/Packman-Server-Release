import { Router } from 'express';
import UserRouter from './UserRouter';
import TogetherListCategoryRouter from './TogetherListCategoryRouter';
import TogetherListRouter from './TogetherListRouter';
import ListRouter from './ListRouter';
import TogetherListPackRouter from './TogetherListPackRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/list', ListRouter);
router.use('/list/together/category', TogetherListCategoryRouter);
router.use('/list/together', TogetherListRouter);
router.use('/list/together/pack', TogetherListPackRouter);

export default router;
