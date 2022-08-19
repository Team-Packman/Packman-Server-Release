import { Router } from 'express';
import { body } from 'express-validator';
import { TogetherListController } from '../controllers';

const router: Router = Router();

router.post(
  '/add-member',
  [body('listId').notEmpty()],
  TogetherListController.addMember
);

export default router;
