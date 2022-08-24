import { Router } from 'express';
import { body } from 'express-validator';
import { AloneListCategoryController } from '../controllers';
import auth from '../middlewares/auth';

const router: Router = Router();


router.patch(
    '/',
    [body('id').notEmpty(), body('name').notEmpty(), body('listId').notEmpty()],
    auth,
    AloneListCategoryController.updateCategory,
  );


export default router;