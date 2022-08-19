import { Router } from 'express';
import { body } from 'express-validator';
import TogetherListPackController from '../controllers/TogetherListPackController';

const router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('categoryId').notEmpty(), body('listId').notEmpty()],
  TogetherListPackController.createPack,
);

router.patch(
  '/',
  [
    body('id').notEmpty(),
    body('name').notEmpty(),
    body('isChecked').notEmpty(),
    body('listId').notEmpty(),
    body('categoryId').notEmpty(),
  ],
  TogetherListPackController.updatePack,
);

router.delete('/:listId/:categoryId/:packId', TogetherListPackController.deletePack);

export default router;
