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
router.get('/', auth, FolderController.getFolders);
router.get('/together', auth, FolderController.getTogetherFolders);

export default router;
