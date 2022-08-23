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

export default router;
