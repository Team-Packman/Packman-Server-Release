import { Router } from 'express';
import { body } from 'express-validator';
import { TogetherListController } from '../controllers';
import auth from '../middlewares/auth';
const router = Router();

router.post(
  '/',
  [body('departureDate').notEmpty(), body('folderId').notEmpty(), body('title').notEmpty()],
  auth,
  TogetherListController.createTogetherList,
);
router.get('/:listId', auth, TogetherListController.readTogetherList);
router.patch(
  '/packer',
  [body('listId').notEmpty(), body('packId').notEmpty(), body('packerId').notEmpty()],
  auth,
  TogetherListController.updatePacker,
);
router.post('/add-member', auth, [body('listId').notEmpty()], TogetherListController.addMember);
router.delete('/:folderId/:listId', auth, TogetherListController.deleteTogetherList);
export default router;
