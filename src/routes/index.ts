import { Router } from 'express';
import UserRouter from './UserRouter';
import AuthRouter from './AuthRouter';
import TogetherListCategoryRouter from './TogetherListCategoryRouter';
import TogetherListRouter from './TogetherListRouter';
import ListRouter from './ListRouter';
import TogetherListPackRouter from './TogetherListPackRouter';
import FolderRouter from './FolderRouter';
import LandingRouter from './LandingRouter';
import AloneListRouter from './AloneListRouter';
import AloneListCategoryRouter from './AloneListCategoryRouter';
import AloneListPackRouter from './AloneListPackRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/auth', AuthRouter);
router.use('/list', ListRouter);
router.use('/list/together/category', TogetherListCategoryRouter);
router.use('/list/together', TogetherListRouter);
router.use('/list/together/pack', TogetherListPackRouter);
router.use('/folder', FolderRouter);
router.use('/landing', LandingRouter);
router.use('/list/alone', AloneListRouter);
router.use('/list/alone/category', AloneListCategoryRouter);
router.use('/list/alone/pack', AloneListPackRouter);

export default router;
