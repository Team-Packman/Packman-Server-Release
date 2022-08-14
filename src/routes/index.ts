import { Router } from 'express';
import UserRouter from './UserRouter';
import TogetherListCategoryRouter from './TogetherListCategoryRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/list/together/category', TogetherListCategoryRouter);

export default router;
