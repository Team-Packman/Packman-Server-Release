import { Router } from 'express';
import UserRouter from './UserRouter';
import TogetherListCategoryRouter from './TogetherListCategoryRouter';
import TogetherListRouter from './TogetherListRouter';
import ListRouter from './ListRouter';
const router = Router();

router.use('/user', UserRouter);
router.use('/list', ListRouter);
router.use('/list/together/category', TogetherListCategoryRouter);
router.use('/list/together', TogetherListRouter);

export default router;
