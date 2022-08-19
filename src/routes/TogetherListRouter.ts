import { Router } from 'express';
import { body } from 'express-validator';
import { TogetherListController } from '../controllers';
import Auth from '../middlewares/Auth';
const router = Router();

router.post(
  '/',
  [body('departureDate').notEmpty(), body('folderId').notEmpty(), body('title').notEmpty()],
  Auth,
  TogetherListController.createTogetherList,
);
router.get('/:listId', Auth, TogetherListController.readTogetherList);
router.patch(
  '/packer',
  [body('listId').notEmpty(), body('packId').notEmpty(), body('packerId').notEmpty()],
  Auth,
  TogetherListController.updatePacker,
);
router.post('/add-member', [body('listId').notEmpty()], TogetherListController.addMember);

export default router;
