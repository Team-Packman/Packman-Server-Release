import { Router } from 'express';
import { body } from 'express-validator';
import { AloneListCategoryController } from '../controllers';
import auth from '../middlewares/auth';

const router: Router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('listId').notEmpty()],
  auth,
  AloneListCategoryController.createCategory,
);
router.patch(
  '/',
  [body('id').notEmpty(), body('name').notEmpty(), body('listId').notEmpty()],
  auth,
  AloneListCategoryController.updateCategory,
);
router.delete('/:listId/:categoryId', auth, AloneListCategoryController.deleteCategory);

export default router;
