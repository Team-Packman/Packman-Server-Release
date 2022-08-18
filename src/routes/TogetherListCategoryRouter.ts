import { Router } from 'express';
import { body } from 'express-validator';
import TogetherListCategoryController from '../controllers/TogetherListCategoryController';

const router: Router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('listId').notEmpty()],
  TogetherListCategoryController.createCategory,
);
router.patch(
  '/',
  [body('id').notEmpty(), body('name').notEmpty(), body('listId').notEmpty()],
  TogetherListCategoryController.updateCategory,
);
router.delete('/:listId/:categoryId', TogetherListCategoryController.deleteCategory);

export default router;
