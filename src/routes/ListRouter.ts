import { Router } from 'express';
import { ListController } from '../controllers';
import auth from '../middlewares/auth';
import { body } from 'express-validator';

const router = Router();

router.get('/invite/:inviteCode', auth, ListController.inviteList);
router.patch(
  '/title',
  [body('id').notEmpty(), body('title').notEmpty(), body('isAloned').notEmpty()],
  auth,
  ListController.updateListTitle,
);

export default router;
