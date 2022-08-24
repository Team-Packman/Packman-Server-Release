import { Router } from 'express';
import { body } from 'express-validator';
import { AloneListPackController } from '../controllers';
import auth from '../middlewares/auth';
const router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('categoryId').notEmpty(), body('listId').notEmpty()],
  auth,
  AloneListPackController.createPack,
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
  AloneListPackController.updatePack,
);

export default router;
