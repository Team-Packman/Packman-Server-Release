import { Router } from 'express';
import { body } from 'express-validator';
import { TogetherListCategoryController } from '../controllers';
import auth from '../middlewares/auth';

const router: Router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('listId').notEmpty()],
  auth,
  TogetherListCategoryController.createCategory,
);
router.patch(
  '/',
  [body('id').notEmpty(), body('name').notEmpty(), body('listId').notEmpty()],
  auth,
  TogetherListCategoryController.updateCategory,
);
router.delete('/:listId/:categoryId', auth, TogetherListCategoryController.deleteCategory);

export default router;
