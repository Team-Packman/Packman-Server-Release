import { Router } from 'express';
import { body } from 'express-validator';
import { FolderController } from '../controllers';

const router = Router();

router.get('/recentCreatedList', FolderController.getRecentCreatedList);
router.post(
  '/',
  [body('name').notEmpty(), body('isAloned').notEmpty()],
  FolderController.createFolder,
);
export default router;
