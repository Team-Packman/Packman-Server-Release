import { Router } from 'express';
import UserRouter from './UserRouter';
import AuthRouter from './AuthRouter';
import TogetherListCategoryRouter from './TogetherListCategoryRouter';
import TogetherListRouter from './TogetherListRouter';
import ListRouter from './ListRouter';
import TogetherListPackRouter from './TogetherListPackRouter';
import FolderRouter from './FolderRouter';
import LandingRouter from './LandingRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/auth', AuthRouter);
router.use('/list', ListRouter);
router.use('/list/together/category', TogetherListCategoryRouter);
router.use('/list/together', TogetherListRouter);
router.use('/list/together/pack', TogetherListPackRouter);
router.use('/folder', FolderRouter);
router.use('/landing', LandingRouter);

export default router;
