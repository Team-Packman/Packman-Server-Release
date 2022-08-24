import { Router } from 'express';
import { body } from 'express-validator';
import { FolderController } from '../controllers';
import auth from '../middlewares/auth';

const router = Router();

router.get('/recentCreatedList', auth, FolderController.getRecentCreatedList);
router.post(
  '/',
  [body('name').notEmpty(), body('isAloned').notEmpty()],
  auth,
  FolderController.createFolder,
);
export default router;
