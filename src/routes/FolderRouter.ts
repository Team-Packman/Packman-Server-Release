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
router.delete('/:folderId', auth, FolderController.deleteFolder);
router.get('/', auth, FolderController.getFolders);
router.get('/together', auth, FolderController.getTogetherFolders);
router.get('/alone', auth, FolderController.getAloneFolders);
router.get('/list/together/:folderId', auth, FolderController.getTogetherListInFolder);
router.get('/list/alone/:folderId', auth, FolderController.getAloneListInFolder);

export default router;
