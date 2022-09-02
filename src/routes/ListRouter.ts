import { Router } from 'express';
import { ListController } from '../controllers';
import auth from '../middlewares/auth';
import { body } from 'express-validator';
import isLogin from '../middlewares/isLogin';

const router = Router();

router.get('/invite/:inviteCode', isLogin, ListController.inviteList);

router.get('/share/:listType/:inviteCode', ListController.getSharedList);

router.patch(
  '/title',
  [body('id').notEmpty(), body('title').notEmpty(), body('isAloned').notEmpty()],
  auth,
  ListController.updateTitle,
);
router.patch(
  '/departureDate',
  [body('id').notEmpty(), body('departureDate').notEmpty(), body('isAloned').notEmpty()],
  auth,
  ListController.updateDate,
);
router.patch(
  '/myTemplate',
  [body('id').notEmpty(), body('isSaved').notEmpty(), body('isAloned').notEmpty()],
  auth,
  ListController.updateMyTemplate,
);

export default router;
