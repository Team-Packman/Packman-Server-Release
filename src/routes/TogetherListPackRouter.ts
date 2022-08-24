import { Router } from 'express';
import { body } from 'express-validator';
import { TogetherListPackController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('categoryId').notEmpty(), body('listId').notEmpty()],
  auth,
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
  auth,
  TogetherListPackController.updatePack,
);

router.delete('/:listId/:categoryId/:packId', auth, TogetherListPackController.deletePack);

export default router;
