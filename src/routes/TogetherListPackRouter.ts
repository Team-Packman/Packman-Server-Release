import { Router } from 'express';
import { body } from 'express-validator';
import TogetherListPackController from '../controllers/TogetherListPackController';

const router = Router();

router.post(
  '/',
  [body('name').notEmpty(), body('categoryId').notEmpty(), body('listId').notEmpty()],
  TogetherListPackController.createPack,
);
export default router;
