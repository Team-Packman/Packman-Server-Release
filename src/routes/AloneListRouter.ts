import { Router } from 'express';
import { body } from 'express-validator';
import { AloneListController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.post(
  '/',
  [body('departureDate').notEmpty(), body('folderId').notEmpty(), body('title').notEmpty()],
  auth,
  AloneListController.createAloneList,
);

router.get('/:listId', auth, AloneListController.getAloneList);

router.get('/:listId', auth, AloneListController.getAloneList);

router.delete('/:folderId/:listId', auth, AloneListController.deleteAloneList);

router.get('/invite/:inviteCode', auth, AloneListController.getInviteAloneList);

export default router;
