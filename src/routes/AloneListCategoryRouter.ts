import { Router } from 'express';
import { body } from 'express-validator';
import { AloneListCategoryController } from '../controllers';
import auth from '../middlewares/auth';

const router: Router = Router();

router.delete('/:listId/:categoryId', auth, AloneListCategoryController.deleteCategory);

export default router;
