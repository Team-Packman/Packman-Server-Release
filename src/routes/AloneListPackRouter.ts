import { Router } from 'express';
import { body } from 'express-validator';
import { AloneListPackController } from '../controllers';
import auth from '../middlewares/auth';
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
  // auth,
  AloneListPackController.updatePack,
);

export default router;
