import { Router } from 'express';
import { body } from 'express-validator';
import TogetherPackingListPackController from '../controllers/TogetherPackingListPackController';

const router = Router();

router.delete('/:listId/:categoryId/:packId', TogetherPackingListPackController.deletePack);

export default router;
