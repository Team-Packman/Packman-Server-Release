import { Router } from 'express';
import { ListController } from '../controllers';
import auth from '../middlewares/auth';
import { body } from 'express-validator';

const router = Router();

router.get('/:listType/share/:inviteCode', ListController.getSharedList);

router.get('/invite/:inviteCode', auth, ListController.inviteList);

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
