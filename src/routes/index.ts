import { Router } from 'express';
import UserRouter from './UserRouter';
import TogetherPackingListCategoryRouter from './TogetherPackingListCategoryRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/packingList/together/category', TogetherPackingListCategoryRouter);

export default router;
