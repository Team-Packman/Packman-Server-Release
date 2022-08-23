import { Router } from 'express';
import { ListController } from '../controllers';
import auth from '../middlewares/auth';
import { body } from 'express-validator';

const router = Router();

router.get('/invite/:inviteCode', auth, ListController.inviteList);
router.patch(
  '/myTemplate',
  [body('id').notEmpty(), body('isSaved').notEmpty(), body('isAloned').notEmpty()],
  auth,
  ListController.updateMyTemplate,
);

export default router;
