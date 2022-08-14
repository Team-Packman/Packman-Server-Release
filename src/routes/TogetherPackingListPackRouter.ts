import { Router } from 'express';
import { body } from 'express-validator';
import TogetherPackingListPackController from '../controllers/TogetherPackingListPackController';

const router = Router();

router.patch(
  '/',
  [
    body('id').notEmpty(),
    body('name').notEmpty(),
    body('isChecked').notEmpty(),
    body('listId').notEmpty(),
    body('categoryId').notEmpty(),
  ],
  TogetherPackingListPackController.updatePack,
);
export default router;
