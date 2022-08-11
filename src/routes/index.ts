import { Router } from 'express';
import UserRouter from './UserRouter';
import TogetherPackingListPackRouter from './TogetherPackingListPackRouter';

const router = Router();

router.use('/user', UserRouter);
router.use('/packingList/together/pack', TogetherPackingListPackRouter);

export default router;
